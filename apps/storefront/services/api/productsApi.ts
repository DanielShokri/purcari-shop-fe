import baseApi from '@shared/api';
import { databases, APPWRITE_CONFIG } from '@shared/services';
import { Query } from 'appwrite';
import { Product, CartItem, WineType, StockStatus } from '@shared/types';

// Product filter options
interface ProductFilters {
  category?: string;
  featured?: boolean;
  onSale?: boolean;
  wineType?: WineType | string;
  inStockOnly?: boolean;
  limit?: number;
}

// Stock validation result
interface StockValidationResult {
  valid: boolean;
  errors: string[];
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get all products (with optional filters)
    getProducts: builder.query<Product[], ProductFilters | undefined>({
      queryFn: async (args) => {
        try {
          const queries = [Query.orderDesc('$createdAt')];
          const limit = args?.limit || 100;
          queries.push(Query.limit(limit));
          
          if (args) {
            if (args.category) queries.push(Query.equal('category', args.category));
            if (args.featured) queries.push(Query.equal('isFeatured', true));
            if (args.onSale) queries.push(Query.equal('onSale', true));
            if (args.wineType) queries.push(Query.equal('wineType', args.wineType));
            if (args.inStockOnly) {
              queries.push(Query.notEqual('stockStatus', StockStatus.OUT_OF_STOCK));
            }
          }
          
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            queries
          );
          return { data: response.documents as unknown as Product[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת מוצרים' };
        }
      },
      providesTags: ['Products'],
    }),

    // 2. Get single product by ID
    getProductById: builder.query<Product, string>({
      queryFn: async (productId) => {
        try {
          const response = await databases.getDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            productId
          );
          return { data: response as unknown as Product };
        } catch (error: any) {
          return { error: error.message || 'המוצר לא נמצא' };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Products', id }],
    }),

    // 3. Get products by category
    getProductsByCategory: builder.query<Product[], string>({
      queryFn: async (categoryId) => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            [
              Query.equal('category', categoryId),
              Query.orderDesc('$createdAt'),
              Query.limit(100),
            ]
          );
          return { data: response.documents as unknown as Product[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת מוצרים לקטגוריה' };
        }
      },
      providesTags: ['Products'],
    }),

    // 4. Search products (client-side filtering for Hebrew support)
    searchProducts: builder.query<Product[], string>({
      queryFn: async (searchTerm) => {
        try {
          if (searchTerm.length < 2) {
            return { data: [] };
          }
          
          // Get all products first (Appwrite search has limitations with Hebrew)
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            [Query.limit(100)]
          );
          
          // Client-side search for better Hebrew support
          const term = searchTerm.toLowerCase();
          const filtered = response.documents.filter((doc: any) =>
            doc.productName?.toLowerCase().includes(term) ||
            doc.productNameHe?.includes(searchTerm) ||
            doc.description?.toLowerCase().includes(term) ||
            doc.descriptionHe?.includes(searchTerm) ||
            doc.sku?.toLowerCase().includes(term) ||
            doc.tags?.some((tag: string) => tag.toLowerCase().includes(term))
          );
          
          return { data: filtered as unknown as Product[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בחיפוש מוצרים' };
        }
      },
      providesTags: ['Products'],
    }),

    // 5. Get featured products
    getFeaturedProducts: builder.query<Product[], number | undefined>({
      queryFn: async (limit = 8) => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            [
              Query.equal('isFeatured', true),
              Query.limit(limit),
            ]
          );
          return { data: response.documents as unknown as Product[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת מוצרים נבחרים' };
        }
      },
      providesTags: ['Products'],
    }),

    // 6. Get products on sale
    getSaleProducts: builder.query<Product[], number | undefined>({
      queryFn: async (limit = 12) => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            [
              Query.equal('onSale', true),
              Query.limit(limit),
            ]
          );
          return { data: response.documents as unknown as Product[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת מבצעים' };
        }
      },
      providesTags: ['Products'],
    }),

    // 7. Validate stock availability for cart items
    validateStock: builder.query<StockValidationResult, CartItem[]>({
      queryFn: async (items) => {
        try {
          const errors: string[] = [];
          
          for (const item of items) {
            const product = await databases.getDocument(
              APPWRITE_CONFIG.DATABASE_ID,
              APPWRITE_CONFIG.COLLECTION_PRODUCTS,
              item.productId
            ) as unknown as Product;
            
            if (product.quantityInStock < item.quantity) {
              errors.push(
                `${item.title}: רק ${product.quantityInStock} יחידות במלאי`
              );
            }
            
            if (product.stockStatus === StockStatus.OUT_OF_STOCK) {
              errors.push(`${item.title}: אזל מהמלאי`);
            }
          }
          
          return { data: { valid: errors.length === 0, errors } };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בבדיקת מלאי' };
        }
      },
    }),

    // 8. Get related products
    getRelatedProducts: builder.query<Product[], { productId: string; category: string; limit?: number }>({
      queryFn: async ({ productId, category, limit = 4 }) => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            [
              Query.equal('category', category),
              Query.notEqual('$id', productId),
              Query.limit(limit),
            ]
          );
          return { data: response.documents as unknown as Product[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת מוצרים קשורים' };
        }
      },
      providesTags: ['Products'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
  useSearchProductsQuery,
  useGetFeaturedProductsQuery,
  useGetSaleProductsQuery,
  useValidateStockQuery,
  useLazyValidateStockQuery,
  useGetRelatedProductsQuery,
} = productsApi;
