import { api } from '@shared/api';
import { AnalyticsSummary, TimeSeriesDataPoint, AnalyticsInterval, AnalyticsEvent, Product } from '@shared/types';
import { databases, usersApi, APPWRITE_CONFIG } from '@shared/services';
import { Query } from 'appwrite';

const analyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsSummary: builder.query<AnalyticsSummary, void>({
      queryFn: async () => {
        try {
          const now = new Date();
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          startOfWeek.setHours(0, 0, 0, 0);
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
           // Fetch analytics events, products, and users in parallel
           const [eventsResponse, productsResponse, usersResponse] = await Promise.allSettled([
             databases.listDocuments(
               APPWRITE_CONFIG.DATABASE_ID,
               APPWRITE_CONFIG.COLLECTION_ANALYTICS_EVENTS,
               [Query.limit(10000)]
             ),
             databases.listDocuments(
               APPWRITE_CONFIG.DATABASE_ID,
               APPWRITE_CONFIG.COLLECTION_PRODUCTS,
               [Query.limit(1000)]
             ),
             usersApi.list().catch(() => ({ users: [] }))
          ]);

          // Extract results with fallbacks
          const events = eventsResponse.status === 'fulfilled' ? eventsResponse.value.documents : [];
          const products = productsResponse.status === 'fulfilled' ? productsResponse.value.documents : [];
          const users = usersResponse.status === 'fulfilled' && usersResponse.value.users ? usersResponse.value.users : [];

          // Filter events by date ranges
          const todayEvents = events.filter((e: any) => new Date(e.$createdAt) >= startOfToday);
          const weekEvents = events.filter((e: any) => new Date(e.$createdAt) >= startOfWeek);
          const monthEvents = events.filter((e: any) => new Date(e.$createdAt) >= startOfMonth);

          // Count views
          const viewsToday = todayEvents.filter((e: any) => e.type === 'page_view' || e.type === 'product_view').length;
          const viewsThisWeek = weekEvents.filter((e: any) => e.type === 'page_view' || e.type === 'product_view').length;
          const viewsThisMonth = monthEvents.filter((e: any) => e.type === 'page_view' || e.type === 'product_view').length;

          // Calculate DAU/WAU/MAU (unique users)
          const todayUserIds = new Set(todayEvents.map((e: any) => e.userId).filter(Boolean));
          const weekUserIds = new Set(weekEvents.map((e: any) => e.userId).filter(Boolean));
          const monthUserIds = new Set(monthEvents.map((e: any) => e.userId).filter(Boolean));

          const dau = todayUserIds.size;
          const wau = weekUserIds.size;
          const mau = monthUserIds.size;

          // Calculate top products by views
          const productViewCounts: Record<string, number> = {};
          events.forEach((e: any) => {
            if (e.type === 'product_view' && e.productId) {
              productViewCounts[e.productId] = (productViewCounts[e.productId] || 0) + 1;
            }
          });

          // Map product IDs to names
          const productsMap = new Map(products.map((p: any) => [p.$id, p.productName || 'מוצר ללא שם']));
          
          const topProducts = Object.entries(productViewCounts)
            .map(([productId, views]) => ({
              productId,
              productName: productsMap.get(productId) || 'מוצר לא ידוע',
              views: views as number,
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

          // Calculate retention (weekly cohorts)
          // For simplicity, we'll calculate based on users who had events in week 0 and returned in week 1/7/30
          const retention = {
            week1: 0,
            week7: 0,
            week30: 0,
          };

          // Group events by user and calculate retention
          const userEvents: Record<string, any[]> = {};
          events.forEach((e: any) => {
            if (e.userId) {
              if (!userEvents[e.userId]) {
                userEvents[e.userId] = [];
              }
              userEvents[e.userId].push(e);
            }
          });

          // Calculate retention for users who had events in the last 30 days
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          const recentUsers = Object.keys(userEvents).filter(userId => {
            const userEventDates = userEvents[userId].map((e: any) => new Date(e.$createdAt));
            return userEventDates.some(date => date >= thirtyDaysAgo);
          });

          if (recentUsers.length > 0) {
            let week1Count = 0;
            let week7Count = 0;
            let week30Count = 0;

            recentUsers.forEach(userId => {
              const userEventDates = userEvents[userId]
                .map((e: any) => new Date(e.$createdAt))
                .sort((a, b) => a.getTime() - b.getTime());
              
              if (userEventDates.length === 0) return;

              const firstEvent = userEventDates[0];
              const lastEvent = userEventDates[userEventDates.length - 1];
              const daysDiff = (lastEvent.getTime() - firstEvent.getTime()) / (1000 * 60 * 60 * 24);

              if (daysDiff >= 1) week1Count++;
              if (daysDiff >= 7) week7Count++;
              if (daysDiff >= 30) week30Count++;
            });

            retention.week1 = Math.round((week1Count / recentUsers.length) * 100);
            retention.week7 = Math.round((week7Count / recentUsers.length) * 100);
            retention.week30 = Math.round((week30Count / recentUsers.length) * 100);
          }

           // Calculate total views and visitors
           const totalViews = events.filter((e: any) => e.type === 'page_view' || e.type === 'product_view').length;
           const totalVisitors = new Set(events.map((e: any) => e.userId).filter(Boolean)).size;
           
           // Calculate average session duration (in seconds) - estimate based on time between events per user
           let totalSessionDuration = 0;
           let sessionCount = 0;
           Object.values(userEvents).forEach((userEventsList: any) => {
             if (userEventsList.length > 1) {
               const sortedEvents = userEventsList.sort((a: any, b: any) => 
                 new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
               );
               for (let i = 0; i < sortedEvents.length - 1; i++) {
                 const duration = (new Date(sortedEvents[i + 1].$createdAt).getTime() - new Date(sortedEvents[i].$createdAt).getTime()) / 1000; // Convert to seconds
                 if (duration < 3600) { // Only count if less than 1 hour (realistic)
                   totalSessionDuration += duration;
                 }
               }
               sessionCount++;
             }
           });
           const averageSessionDuration = sessionCount > 0 ? Math.round(totalSessionDuration / sessionCount) : 0;
           
           // Calculate bounce rate (percentage of users with only 1 event)
           const usersWithOneEvent = Object.values(userEvents).filter((events: any) => events.length === 1).length;
           const bounceRate = totalVisitors > 0 ? Math.round((usersWithOneEvent / totalVisitors) * 100) : 0;
           
           // Calculate conversion rate (add_to_cart or checkout events as percentage of views)
           const conversionEvents = events.filter((e: any) => e.type === 'add_to_cart' || e.type === 'checkout').length;
           const conversionRate = totalViews > 0 ? Math.round((conversionEvents / totalViews) * 100) : 0;

           return {
             data: {
               totalViews,
               totalVisitors,
               averageSessionDuration,
               bounceRate,
               conversionRate,
               viewsToday,
               viewsThisWeek,
               viewsThisMonth,
               dau,
               wau,
               mau,
               topProducts,
               retention,
             }
           };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת נתוני אנליטיקות' };
        }
      },
      providesTags: ['Analytics'],
    }),

    getViewsSeries: builder.query<TimeSeriesDataPoint[], AnalyticsInterval>({
      queryFn: async (interval) => {
        try {
          const now = new Date();
          let startDate: Date;
          let dateFormatter: (date: Date) => string;

          if (interval === 'daily') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30); // Last 30 days
            dateFormatter = (date: Date) => {
              return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
            };
          } else if (interval === 'weekly') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - (now.getDay() + 7 * 12)); // Last 12 weeks
            dateFormatter = (date: Date) => {
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              return `שבוע ${weekStart.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}`;
            };
          } else { // monthly
            startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1); // Last 12 months
            dateFormatter = (date: Date) => {
              const monthNames = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
              return monthNames[date.getMonth()];
            };
           }

           const response = await databases.listDocuments(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_ANALYTICS_EVENTS,
             [
               Query.greaterThanEqual('$createdAt', startDate.toISOString()),
               Query.limit(10000)
             ]
           );

          const events = response.documents.filter((e: any) => 
            e.type === 'page_view' || e.type === 'product_view'
          );

          // Aggregate by time period
          const aggregated: Record<string, number> = {};

          events.forEach((e: any) => {
            const eventDate = new Date(e.$createdAt);
            let key: string;

            if (interval === 'daily') {
              key = dateFormatter(eventDate);
            } else if (interval === 'weekly') {
              const weekStart = new Date(eventDate);
              weekStart.setDate(eventDate.getDate() - eventDate.getDay());
              weekStart.setHours(0, 0, 0, 0);
              key = dateFormatter(weekStart);
            } else { // monthly
              const monthStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1);
              key = dateFormatter(monthStart);
            }

            aggregated[key] = (aggregated[key] || 0) + 1;
          });

           // Convert to array and sort
           const chartData: TimeSeriesDataPoint[] = Object.entries(aggregated)
             .map(([name, value]) => ({ 
               timestamp: name,
               name, 
               value 
             }))
             .sort((a, b) => {
               // Simple sort - in production, parse dates properly
               return (a.name || a.timestamp).localeCompare(b.name || b.timestamp, 'he');
             });

          return { data: chartData };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת נתוני צפיות' };
        }
      },
      providesTags: ['Analytics'],
    }),

    getNewUsersSeries: builder.query<TimeSeriesDataPoint[], AnalyticsInterval>({
      queryFn: async (interval) => {
        try {
          const now = new Date();
          let startDate: Date;
          let dateFormatter: (date: Date) => string;

          if (interval === 'daily') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            dateFormatter = (date: Date) => {
              return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
            };
          } else if (interval === 'weekly') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - (now.getDay() + 7 * 12));
            dateFormatter = (date: Date) => {
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              return `שבוע ${weekStart.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}`;
            };
          } else { // monthly
            startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
            dateFormatter = (date: Date) => {
              const monthNames = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
              return monthNames[date.getMonth()];
            };
          }

          const usersResponse = await usersApi.list().catch(() => ({ users: [] }));
          const users = usersResponse.users || [];

          // Filter users registered after startDate
          const recentUsers = users.filter((u: any) => {
            const registrationDate = new Date(u.registration || u.$createdAt);
            return registrationDate >= startDate;
          });

          // Aggregate by time period
          const aggregated: Record<string, number> = {};

          recentUsers.forEach((u: any) => {
            const regDate = new Date(u.registration || u.$createdAt);
            let key: string;

            if (interval === 'daily') {
              key = dateFormatter(regDate);
            } else if (interval === 'weekly') {
              const weekStart = new Date(regDate);
              weekStart.setDate(regDate.getDate() - regDate.getDay());
              weekStart.setHours(0, 0, 0, 0);
              key = dateFormatter(weekStart);
            } else { // monthly
              const monthStart = new Date(regDate.getFullYear(), regDate.getMonth(), 1);
              key = dateFormatter(monthStart);
            }

            aggregated[key] = (aggregated[key] || 0) + 1;
          });

           // Convert to array and sort
           const chartData: TimeSeriesDataPoint[] = Object.entries(aggregated)
             .map(([name, value]) => ({ 
               timestamp: name,
               name, 
               value 
             }))
             .sort((a, b) => (a.name || a.timestamp).localeCompare(b.name || b.timestamp, 'he'));

          return { data: chartData };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת נתוני משתמשים חדשים' };
        }
      },
      providesTags: ['Analytics'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAnalyticsSummaryQuery,
  useGetViewsSeriesQuery,
  useGetNewUsersSeriesQuery,
} = analyticsApi;
