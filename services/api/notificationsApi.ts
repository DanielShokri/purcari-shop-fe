import { api } from './baseApi';
import { Notification, NotificationType } from '../../types';
import { databases, APPWRITE_CONFIG } from '../appwrite';
import { Query } from 'appwrite';

const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_NOTIFICATIONS,
            queries: [Query.orderDesc('$createdAt'), Query.limit(100)]
          });
          
          const notifications: Notification[] = response.documents.map((doc: any) => ({
            $id: doc.$id,
            title: doc.title,
            message: doc.message,
            type: doc.type as NotificationType,
            isRead: doc.isRead ?? false,
            icon: doc.icon || undefined,
            createdAt: doc.$createdAt,
          }));
          
          return { data: notifications };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת התראות' };
        }
      },
      providesTags: ['Notifications'],
    }),

    getRecentNotifications: builder.query<Notification[], number>({
      queryFn: async (limit: number = 5) => {
        try {
          const response = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_NOTIFICATIONS,
            queries: [Query.orderDesc('$createdAt'), Query.limit(limit)]
          });
          
          const notifications: Notification[] = response.documents.map((doc: any) => ({
            $id: doc.$id,
            title: doc.title,
            message: doc.message,
            type: doc.type as NotificationType,
            isRead: doc.isRead ?? false,
            icon: doc.icon || undefined,
            createdAt: doc.$createdAt,
          }));
          
          return { data: notifications };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת התראות' };
        }
      },
      providesTags: ['Notifications'],
    }),

    getUnreadCount: builder.query<number, void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_NOTIFICATIONS,
            queries: [Query.equal('isRead', false), Query.limit(100)]
          });
          
          return { data: response.total };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת מספר התראות' };
        }
      },
      providesTags: ['Notifications'],
    }),

    markAsRead: builder.mutation<Notification, string>({
      queryFn: async (notificationId: string) => {
        try {
          const response = await databases.updateDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_NOTIFICATIONS,
            documentId: notificationId,
            data: { isRead: true }
          });
          
          const notification: Notification = {
            $id: response.$id,
            title: response.title,
            message: response.message,
            type: response.type as NotificationType,
            isRead: response.isRead ?? true,
            icon: response.icon || undefined,
            createdAt: response.$createdAt,
          };
          
          return { data: notification };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בעדכון התראה' };
        }
      },
      invalidatesTags: ['Notifications'],
    }),

    markAllAsRead: builder.mutation<boolean, void>({
      queryFn: async () => {
        try {
          // Fetch all unread notifications
          const response = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_NOTIFICATIONS,
            queries: [Query.equal('isRead', false), Query.limit(100)]
          });
          
          // Update each notification to mark as read
          const updatePromises = response.documents.map((doc: any) =>
            databases.updateDocument({
              databaseId: APPWRITE_CONFIG.DATABASE_ID,
              collectionId: APPWRITE_CONFIG.COLLECTION_NOTIFICATIONS,
              documentId: doc.$id,
              data: { isRead: true }
            })
          );
          
          await Promise.all(updatePromises);
          
          return { data: true };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בעדכון התראות' };
        }
      },
      invalidatesTags: ['Notifications'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetRecentNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationsApi;
