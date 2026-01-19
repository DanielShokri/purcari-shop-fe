import { api } from './baseApi';
import { databases, APPWRITE_CONFIG } from '../appwrite';
import { Query } from 'appwrite';
import { Product } from '../../types';

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get all products (with optional filters)
    getProducts: builder.query<Product[], { category?: string; featured?: boolean } | void>({
      queryFn: async (args) => {
        try {
          const queries = [Query.orderDesc('$createdAt'), Query.limit(100)];
          if (args) {
            if (args.category) queries.push(Query.equal('category', args.category));
            if (args.featured) queries.push(Query.equal('isFeatured', true));
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

    // 3. Search products
    searchProducts: builder.query<Product[], string>({
      queryFn: async (searchTerm) => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            [
              Query.search('productName', searchTerm),
              Query.limit(50)
            ]
          );
          return { data: response.documents as unknown as Product[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בחיפוש מוצרים' };
        }
      },
    }),

    // 4. Get featured products (legacy/shortcut)
    getFeaturedProducts: builder.query<Product[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_PRODUCTS,
            [Query.equal('isFeatured', true), Query.limit(10)]
          );
          return { data: response.documents as unknown as Product[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת מוצרים נבחרים' };
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
  useSearchProductsQuery,
  useGetFeaturedProductsQuery,
} = productsApi;
