import { api } from '@shared/api';
import { Product, ProductCategory, WineType } from '@shared/types';
import { databases, APPWRITE_CONFIG } from '@shared/services';
import { ID, Query } from 'appwrite';

// Transform wine type from lowercase enum to capitalized format for Appwrite
const transformWineType = (wineType: any): string | null => {
  if (!wineType) return null;
  
  const normalized = String(wineType).toLowerCase().trim();
  
  const typeMap: Record<string, string> = {
    'red': 'Red',
    'white': 'White',
    'rose': 'Rosé',
    'sparkling': 'Sparkling',
  };
  
  return typeMap[normalized] || null;
};

const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            [Query.orderDesc('$createdAt'), Query.limit(100)]
          );
          return { data: response.documents as unknown as Product[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Products'],
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      queryFn: async (newProduct) => {
        try {
          const response = await databases.createDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            ID.unique(),
            {
              // Required fields
              productName: newProduct.productName || '',
              price: newProduct.price || 0,
              quantityInStock: newProduct.quantityInStock || 0,
              sku: newProduct.sku || '',
              category: newProduct.category || 'red_wine',
              // Optional fields
              description: newProduct.description || null,
              shortDescription: newProduct.shortDescription || null,
              salePrice: newProduct.salePrice || null,
              onSale: newProduct.onSale || false,
              tags: newProduct.tags || [],
              relatedProducts: newProduct.relatedProducts || [],
              isFeatured: newProduct.isFeatured || false,
              featuredImage: newProduct.featuredImage || null,
              dateAdded: newProduct.dateAdded || new Date().toISOString(),
              stockStatus: newProduct.stockStatus || 'in_stock',
              // Wine fields
              wineType: transformWineType(newProduct.wineType),
              volume: newProduct.volume || null,
              grapeVariety: newProduct.grapeVariety || null,
              vintage: newProduct.vintage || null,
              servingTemperature: newProduct.servingTemperature || null,
            }
          );
          return { data: response as unknown as Product };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Products'],
    }),

    updateProduct: builder.mutation<Product, { id: string } & Partial<Product>>({
      queryFn: async ({ id, ...updates }) => {
        try {
          // Remove $id and status (UI-only) from updates
          const { $id, status, ...cleanUpdates } = updates as any;
          
          // Transform wineType if present
          if (cleanUpdates.wineType) {
            cleanUpdates.wineType = transformWineType(cleanUpdates.wineType);
          }
          
          const response = await databases.updateDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            id,
            cleanUpdates
          );
          return { data: response as unknown as Product };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Products']
    }),

    deleteProduct: builder.mutation<boolean, string>({
      queryFn: async (productId) => {
        try {
          await databases.deleteDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            productId
          );
          return { data: true };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Products']
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetProductsQuery, 
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
