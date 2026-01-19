import { api } from './baseApi';
import { databases, APPWRITE_CONFIG } from '../appwrite';
import { Query } from 'appwrite';
import { Category } from '../../types';

export const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all active categories
    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CATEGORIES,
            [
              Query.equal('status', 'active'),
              Query.orderAsc('displayOrder')
            ]
          );
          return { data: response.documents as unknown as Category[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת קטגוריות' };
        }
      },
      providesTags: ['Categories'],
    }),
  }),
});

export const { useGetCategoriesQuery } = categoriesApi;
