import { api } from '@shared/api';
import { Category, CategoryStatus } from '@shared/types';
import { databases, APPWRITE_CONFIG } from '@shared/services';
import { ID, Query } from 'appwrite';

// Helper to generate slug from Hebrew name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0590-\u05FFa-z0-9-]/g, '') // Keep Hebrew, Latin, numbers, and hyphens
    || ID.unique();
};

const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CATEGORIES,
            [Query.orderAsc('displayOrder'), Query.limit(100)]
          );
          return { data: response.documents as unknown as Category[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Categories'],
    }),

     createCategory: builder.mutation<Category, Partial<Category>>({
       queryFn: async (newCategory: Partial<Category>) => {
         try {
           const response = await databases.createDocument(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_CATEGORIES,
             ID.unique(),
             {
               // Required fields
               name: newCategory.name || '',
               slug: newCategory.slug || generateSlug(newCategory.name || ''),
               status: newCategory.status || CategoryStatus.ACTIVE,
               displayOrder: newCategory.displayOrder || 0,
               // Optional fields
               parentId: newCategory.parentId || null,
               description: newCategory.description || null,
               image: newCategory.image || null,
               icon: newCategory.icon || null,
               iconColor: newCategory.iconColor || null,
             }
           );
           return { data: response as unknown as Category };
         } catch (error: any) {
           return { error: error.message };
         }
       },
       invalidatesTags: ['Categories'],
     }),

     updateCategory: builder.mutation<Category, { id: string } & Partial<Category>>({
       queryFn: async ({ id, ...updates }: { id: string } & Partial<Category>) => {
         try {
           // Remove $id from updates (Appwrite doesn't allow updating $id)
           const { $id, ...cleanUpdates } = updates as any;
           
           // Generate slug if name changed but slug wasn't provided
           if (cleanUpdates.name && !cleanUpdates.slug) {
             cleanUpdates.slug = generateSlug(cleanUpdates.name);
           }
           
           const response = await databases.updateDocument(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_CATEGORIES,
             id,
             cleanUpdates
           );
           return { data: response as unknown as Category };
         } catch (error: any) {
           return { error: error.message };
         }
       },
       invalidatesTags: ['Categories']
     }),

     deleteCategory: builder.mutation<boolean, string>({
       queryFn: async (categoryId: string) => {
         try {
           await databases.deleteDocument(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_CATEGORIES,
             categoryId
           );
           return { data: true };
         } catch (error: any) {
           return { error: error.message };
         }
       },
       invalidatesTags: ['Categories']
     }),
  }),
  overrideExisting: false,
});

export const { 
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
