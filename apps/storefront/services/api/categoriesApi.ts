import baseApi from '@shared/api';
import { databases, APPWRITE_CONFIG } from '@shared/services';
import { Query } from 'appwrite';
import { Category, CategoryWithChildren } from '@shared/types';

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get all active categories (flat list)
    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CATEGORIES,
            [
              Query.equal('status', 'active'),
              Query.orderAsc('displayOrder'),
              Query.limit(100),
            ]
          );
          return { data: response.documents as unknown as Category[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת קטגוריות' };
        }
      },
      providesTags: ['Categories'],
    }),

    // 2. Get category by slug
    getCategoryBySlug: builder.query<Category | null, string>({
      queryFn: async (slug) => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CATEGORIES,
            [
              Query.equal('slug', slug),
              Query.equal('status', 'active'),
              Query.limit(1),
            ]
          );
          
          if (response.documents.length === 0) {
            return { data: null };
          }
          
          return { data: response.documents[0] as unknown as Category };
        } catch (error: any) {
          return { error: error.message || 'הקטגוריה לא נמצאה' };
        }
      },
      providesTags: (result, error, slug) => [{ type: 'Categories', id: slug }],
    }),

    // 3. Get category by ID
    getCategoryById: builder.query<Category, string>({
      queryFn: async (categoryId) => {
        try {
          const response = await databases.getDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CATEGORIES,
            categoryId
          );
          return { data: response as unknown as Category };
        } catch (error: any) {
          return { error: error.message || 'הקטגוריה לא נמצאה' };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Categories', id }],
    }),

    // 4. Get category tree (nested structure)
    getCategoryTree: builder.query<CategoryWithChildren[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CATEGORIES,
            [
              Query.equal('status', 'active'),
              Query.orderAsc('displayOrder'),
              Query.limit(100),
            ]
          );
          
          const categories = response.documents as unknown as Category[];
          
          // Build tree structure from flat list
          const buildTree = (parentId: string | null): CategoryWithChildren[] => {
            return categories
              .filter(cat => cat.parentId === parentId)
              .map(cat => ({
                ...cat,
                children: buildTree(cat.$id),
              }));
          };
          
          return { data: buildTree(null) };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת עץ הקטגוריות' };
        }
      },
      providesTags: ['Categories'],
    }),

    // 5. Get child categories by parent ID
    getChildCategories: builder.query<Category[], string>({
      queryFn: async (parentId) => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CATEGORIES,
            [
              Query.equal('parentId', parentId),
              Query.equal('status', 'active'),
              Query.orderAsc('displayOrder'),
              Query.limit(50),
            ]
          );
          return { data: response.documents as unknown as Category[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת תת-קטגוריות' };
        }
      },
      providesTags: ['Categories'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
  useGetCategoryByIdQuery,
  useGetCategoryTreeQuery,
  useGetChildCategoriesQuery,
} = categoriesApi;
