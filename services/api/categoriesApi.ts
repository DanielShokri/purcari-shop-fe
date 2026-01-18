import { api } from './baseApi';
import { Category, CategoryStatus } from '../../types';
import { ID } from 'appwrite';

// Helper to delay for realistic loading effect
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        try {
          await delay(600);
          const mockCategories: Category[] = [
            { 
              $id: '1', 
              name: 'ביגוד והנעלה', 
              slug: 'clothing-footwear',
              parentId: null,
              status: CategoryStatus.ACTIVE,
              displayOrder: 1,
              description: 'מגוון ביגוד והנעלה',
              icon: 'checkroom',
              iconColor: 'blue'
            },
            { 
              $id: '2', 
              name: 'חולצות גברים', 
              slug: 'mens-shirts',
              parentId: '1',
              status: CategoryStatus.ACTIVE,
              displayOrder: 1,
              icon: 'checkroom',
              iconColor: 'blue'
            },
            { 
              $id: '3', 
              name: 'מכנסיים', 
              slug: 'pants',
              parentId: '1',
              status: CategoryStatus.ACTIVE,
              displayOrder: 2,
              description: 'מגוון מכנסיים לכל אירוע, ג\'ינסים, מכנסי אלגנט וטרנינגים.',
              icon: 'checkroom',
              iconColor: 'blue'
            },
            { 
              $id: '4', 
              name: 'אלקטרוניקה ומחשבים', 
              slug: 'electronics-computers',
              parentId: null,
              status: CategoryStatus.HIDDEN,
              displayOrder: 2,
              icon: 'devices',
              iconColor: 'purple'
            },
            { 
              $id: '5', 
              name: 'לבית ולגן', 
              slug: 'home-garden',
              parentId: null,
              status: CategoryStatus.ACTIVE,
              displayOrder: 3,
              icon: 'home',
              iconColor: 'orange'
            },
          ];
          return { data: mockCategories };

          // Real Implementation:
          // const response = await databases.listDocuments(
          //   APPWRITE_CONFIG.DATABASE_ID,
          //   APPWRITE_CONFIG.COLLECTION_CATEGORIES,
          //   [Query.orderAsc('displayOrder')]
          // );
          // return { data: response.documents as unknown as Category[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['Categories'],
    }),

    createCategory: builder.mutation<Category, Partial<Category>>({
      queryFn: async (newCategory: Partial<Category>) => {
        try {
          await delay(1000);
          const category = { 
            ...newCategory, 
            $id: ID.unique(),
            slug: newCategory.slug || newCategory.name?.toLowerCase().replace(/\s+/g, '-') || '',
            status: newCategory.status || CategoryStatus.ACTIVE,
            displayOrder: newCategory.displayOrder || 0
          } as Category;
          return { data: category };
          
          // Real:
          // const response = await databases.createDocument(..., ID.unique(), newCategory);
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Categories'],
    }),

    updateCategory: builder.mutation<Category, { id: string } & Partial<Category>>({
      queryFn: async ({ id, ...updates }: { id: string } & Partial<Category>) => {
        await delay(800);
        const updatedCategory = { ...updates, $id: id } as Category;
        return { data: updatedCategory };
        // Real: await databases.updateDocument(..., id, updates);
      },
      invalidatesTags: ['Categories']
    }),

    deleteCategory: builder.mutation<boolean, string>({
      queryFn: async (categoryId: string) => {
        await delay(500);
        return { data: true };
        // Real: await databases.deleteDocument(..., categoryId);
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
