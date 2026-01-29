import { api } from './baseApi';
import { databases, APPWRITE_CONFIG } from '../appwrite';
import { Query } from 'appwrite';
import { CartRule } from '../../types';

export const cartRulesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCartRules: builder.query<CartRule[], void>({
      queryFn: async () => {
        try {
          console.debug('[CartRulesApi] Fetching cart rules from Appwrite...');
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_CART_RULES,
            [
              Query.equal('status', 'active'),
              Query.orderAsc('priority'),
              Query.limit(100)
            ]
          );
          console.debug('[CartRulesApi] Successfully fetched cart rules:', {
            count: response.documents.length,
            rules: response.documents.map(doc => ({
              id: doc.$id,
              name: (doc as any).name,
              type: (doc as any).type,
              priority: (doc as any).priority,
              status: (doc as any).status
            }))
          });
          return { data: response.documents as unknown as CartRule[] };
        } catch (error: any) {
          console.error('[CartRulesApi] Error fetching cart rules:', error);
          return { error: error.message };
        }
      },
      providesTags: ['CartRules'],
    }),
  }),
});

export const { useGetCartRulesQuery } = cartRulesApi;
