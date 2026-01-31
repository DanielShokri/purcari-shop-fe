import { api } from '@shared/api';
import { CartRule, CartRuleStatus, CartRuleType } from '@shared/types';
import { databases, APPWRITE_CONFIG } from '@shared/services';
import { ID, Query } from 'appwrite';

const cartRulesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all cart rules
    getCartRules: builder.query<CartRule[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CART_RULES,
            [Query.orderAsc('priority'), Query.limit(100)]
          );
          return { data: response.documents as unknown as CartRule[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת חוקי עגלה' };
        }
      },
      providesTags: ['CartRules'],
    }),

    // Get cart rule by ID
    getCartRuleById: builder.query<CartRule, string>({
      queryFn: async (cartRuleId) => {
        try {
          const response = await databases.getDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CART_RULES,
            cartRuleId
          );
          return { data: response as unknown as CartRule };
        } catch (error: any) {
          return { error: error.message || 'חוק עגלה לא נמצא' };
        }
      },
      providesTags: (result, error, id) => [{ type: 'CartRules', id }],
    }),

    // Create cart rule
    createCartRule: builder.mutation<CartRule, Partial<CartRule>>({
      queryFn: async (newCartRule) => {
        try {
          const response = await databases.createDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CART_RULES,
            ID.unique(),
            {
              name: newCartRule.name || '',
              description: newCartRule.description || null,
              type: newCartRule.type || CartRuleType.SHIPPING,
              priority: newCartRule.priority ?? 10,
              status: newCartRule.status || CartRuleStatus.ACTIVE,
              value: newCartRule.value ?? null,
            }
          );
          return { data: response as unknown as CartRule };
        } catch (error: any) {
          return { error: error.message || 'שגיאה ביצירת חוק עגלה' };
        }
      },
      invalidatesTags: ['CartRules'],
    }),

    // Update cart rule
    updateCartRule: builder.mutation<CartRule, { id: string } & Partial<CartRule>>({
      queryFn: async ({ id, ...updates }) => {
        try {
          // Remove $id and timestamps from updates
          const { $id, $createdAt, $updatedAt, ...cleanUpdates } = updates as any;
          const response = await databases.updateDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CART_RULES,
            id,
            cleanUpdates
          );
          return { data: response as unknown as CartRule };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בעדכון חוק עגלה' };
        }
      },
      invalidatesTags: ['CartRules'],
    }),

    // Delete cart rule
    deleteCartRule: builder.mutation<boolean, string>({
      queryFn: async (cartRuleId) => {
        try {
          await databases.deleteDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CART_RULES,
            cartRuleId
          );
          return { data: true };
        } catch (error: any) {
          return { error: error.message || 'שגיאה במחיקת חוק עגלה' };
        }
      },
      invalidatesTags: ['CartRules'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCartRulesQuery,
  useGetCartRuleByIdQuery,
  useCreateCartRuleMutation,
  useUpdateCartRuleMutation,
  useDeleteCartRuleMutation,
} = cartRulesApi;
