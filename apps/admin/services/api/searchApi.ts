import { api } from '@shared/api';
import { User, Order, Product, Category, OrderStatus, AppwriteUser, mapAppwriteUserToUser, CategoryStatus } from '@shared/types';
import { databases, APPWRITE_CONFIG, usersApi } from '@shared/services';
import { Query } from 'appwrite';

// Global search result interface
export interface GlobalSearchResult {
  users: User[];
  orders: Order[];
  products: Product[];
  categories: Category[];
  counts: {
    users: number;
    orders: number;
    products: number;
    categories: number;
    total: number;
  };
  searchTime: number;
}

// Helper function to filter items by search term (client-side filtering)
function filterBySearchTerm<T>(items: T[], searchTerm: string, fields: (keyof T)[]): T[] {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return items.filter(item =>
    fields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerSearchTerm);
      }
      return false;
    })
  );
}

const searchApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    globalSearch: builder.query<GlobalSearchResult, string>({
      queryFn: async (searchTerm: string) => {
        const startTime = performance.now();
        
        if (!searchTerm || searchTerm.trim().length < 2) {
          return {
            data: {
              users: [],
              orders: [],
              products: [],
              categories: [],
              counts: { users: 0, orders: 0, products: 0, categories: 0, total: 0 },
              searchTime: 0,
            },
          };
        }

        const term = searchTerm.trim();
        
        try {
          // Run all searches in parallel
          const [usersResult, ordersResult, productsResult, categoriesResult] = await Promise.allSettled([
            // Search Users via Cloud Function
            usersApi.list().then((response: { users: AppwriteUser[] }) => {
              const allUsers = response.users || [];
              // Filter client-side since Users API doesn't support search
              return allUsers
                .filter((user: AppwriteUser) =>
                  user.name?.toLowerCase().includes(term.toLowerCase()) ||
                  user.email?.toLowerCase().includes(term.toLowerCase()) ||
                  user.$id?.toLowerCase().includes(term.toLowerCase())
                )
                .map(mapAppwriteUserToUser);
            }),

             // Search Orders
             databases.listDocuments(
               APPWRITE_CONFIG.DATABASE_ID,
               APPWRITE_CONFIG.COLLECTION_ORDERS,
               [Query.limit(100)]
             ).then(response => {
               // Filter client-side for more flexible matching
               return response.documents
                 .filter((doc: any) =>
                   doc.customerName?.toLowerCase().includes(term.toLowerCase()) ||
                   doc.customerEmail?.toLowerCase().includes(term.toLowerCase()) ||
                   doc.$id?.toLowerCase().includes(term.toLowerCase())
                 )
                 .map((doc: any): Order => ({
                   $id: doc.$id,
                   $createdAt: doc.$createdAt,
                   customerName: doc.customerName,
                   customerEmail: doc.customerEmail,
                   customerPhone: doc.customerPhone || '',
                   customerAvatar: doc.customerAvatar || '',
                   total: doc.total,
                   subtotal: doc.subtotal || 0,
                   shippingCost: doc.shippingCost || 0,
                   tax: doc.tax || 0,
                   status: doc.status as OrderStatus,
                   shippingStreet: doc.shippingStreet,
                   shippingApartment: doc.shippingApartment || '',
                   shippingCity: doc.shippingCity,
                   shippingPostalCode: doc.shippingPostalCode,
                   shippingCountry: doc.shippingCountry,
                   paymentMethod: doc.paymentMethod,
                   paymentCardExpiry: doc.paymentCardExpiry || '',
                   paymentTransactionId: doc.paymentTransactionId,
                   paymentChargeDate: doc.paymentChargeDate,
                 }));
             }),

             // Search Products
             databases.listDocuments(
               APPWRITE_CONFIG.DATABASE_ID,
               APPWRITE_CONFIG.COLLECTION_PRODUCTS,
               [Query.limit(100)]
             ).then(response => {
               // Filter client-side for more flexible matching
               return response.documents
                 .filter((doc: any) =>
                   doc.productName?.toLowerCase().includes(term.toLowerCase()) ||
                   doc.sku?.toLowerCase().includes(term.toLowerCase()) ||
                   doc.shortDescription?.toLowerCase().includes(term.toLowerCase()) ||
                   doc.$id?.toLowerCase().includes(term.toLowerCase())
                 ) as unknown as Product[];
             }),

             // Search Categories
             databases.listDocuments(
               APPWRITE_CONFIG.DATABASE_ID,
               APPWRITE_CONFIG.COLLECTION_CATEGORIES,
               [Query.limit(100)]
             ).then(response => {
               // Filter client-side for more flexible matching
               return response.documents
                 .filter((doc: any) =>
                   doc.name?.toLowerCase().includes(term.toLowerCase()) ||
                   doc.slug?.toLowerCase().includes(term.toLowerCase()) ||
                   doc.description?.toLowerCase().includes(term.toLowerCase()) ||
                   doc.$id?.toLowerCase().includes(term.toLowerCase())
                 )
                 .map((doc: any): Category => ({
                   $id: doc.$id,
                   name: doc.name,
                   slug: doc.slug,
                   parentId: doc.parentId || null,
                   status: doc.status as CategoryStatus,
                   displayOrder: doc.displayOrder || 0,
                   description: doc.description,
                   image: doc.image,
                   icon: doc.icon,
                   iconColor: doc.iconColor,
                 }));
             }),
          ]);

          // Extract results, handling failures gracefully
          const users = usersResult.status === 'fulfilled' ? usersResult.value : [];
          const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
          const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
          const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];

          const endTime = performance.now();
          const searchTime = (endTime - startTime) / 1000; // Convert to seconds

          return {
            data: {
              users,
              orders,
              products,
              categories,
              counts: {
                users: users.length,
                orders: orders.length,
                products: products.length,
                categories: categories.length,
                total: users.length + orders.length + products.length + categories.length,
              },
              searchTime: Math.round(searchTime * 100) / 100, // Round to 2 decimal places
            },
          };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בביצוע חיפוש' };
        }
      },
      providesTags: ['Search'],
    }),
  }),
  overrideExisting: false,
});

export const { useGlobalSearchQuery } = searchApiSlice;
