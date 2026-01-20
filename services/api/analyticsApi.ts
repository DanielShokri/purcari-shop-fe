import { api } from './baseApi';
import { databases, APPWRITE_CONFIG } from '../appwrite';
import { ID } from 'appwrite';

export const analyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Track user event
    trackEvent: builder.mutation<void, {
      type: 'page_view' | 'product_view' | 'add_to_cart' | 'checkout';
      productId?: string;
      userId?: string;
    }>({
      queryFn: async (eventData) => {
        try {
          await databases.createDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ANALYTICS_EVENTS,
            ID.unique(),
            {
              type: eventData.type,
              productId: eventData.productId || null,
              userId: eventData.userId || null,
            }
          );
          return { data: null };
        } catch (error: any) {
          console.error('Failed to track event:', error);
          return { data: null }; // Don't block UI on analytics failure
        }
      },
      invalidatesTags: ['Analytics'],
    }),
  }),
});

export const { useTrackEventMutation } = analyticsApi;
