import { api } from './baseApi';
import { Product } from '../../types';
import { databases, APPWRITE_CONFIG } from '../appwrite';
import { ID, Query } from 'appwrite';

const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            queries: [Query.orderDesc('$createdAt'), Query.limit(100)]
          });
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
          const response = await databases.createDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            documentId: ID.unique(),
            data: {
              // Required fields
              productName: newProduct.productName || '',
              price: newProduct.price || 0,
              quantityInStock: newProduct.quantityInStock || 0,
              sku: newProduct.sku || '',
              category: newProduct.category || 'electronics',
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
            }
          });
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
          const response = await databases.updateDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            documentId: id,
            data: cleanUpdates
          });
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
          await databases.deleteDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            documentId: productId
          });
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
