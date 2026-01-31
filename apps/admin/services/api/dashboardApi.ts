import { api } from '@shared/api';
import { Order, OrderStatus } from '@shared/types';
import { databases, usersApi, APPWRITE_CONFIG } from '@shared/services';
import { Query } from 'appwrite';

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalUsers: number;
  usersChange: number;
  newOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  ordersChange: number;
  totalProducts: number;
  conversionRate: number;
}

interface MonthlySalesData {
  name: string;
  value: number;
}

const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<DashboardStats, void>({
      queryFn: async () => {
        try {
          // Get current date info for filtering
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          
           // Fetch all orders
           const ordersResponse = await databases.listDocuments(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_ORDERS,
             [Query.limit(1000)]
           );
           const allOrders = ordersResponse.documents;
          
          // Calculate total revenue (from completed orders)
          const completedOrders = allOrders.filter((o: any) => o.status === 'completed');
          const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
          
          // Revenue this month vs last month (from completed orders)
          const thisMonthCompletedOrders = completedOrders.filter((o: any) => 
            new Date(o.$createdAt) >= startOfMonth
          );
          const lastMonthCompletedOrders = completedOrders.filter((o: any) => {
            const date = new Date(o.$createdAt);
            return date >= startOfLastMonth && date < startOfMonth;
          });
          
          // All orders this month (for order count stat)
          const thisMonthAllOrders = allOrders.filter((o: any) => 
            new Date(o.$createdAt) >= startOfMonth
          );
          
          // Count cancelled and pending orders this month
          const thisMonthCancelled = thisMonthAllOrders.filter((o: any) => o.status === 'cancelled').length;
          const thisMonthPending = thisMonthAllOrders.filter((o: any) => o.status === 'pending').length;
          
          const thisMonthRevenue = thisMonthCompletedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
          const lastMonthRevenue = lastMonthCompletedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
          const revenueChange = lastMonthRevenue > 0 
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
            : 0;
          
          // Fetch users count
          let totalUsers = 0;
          try {
            const usersResponse = await usersApi.list();
            totalUsers = usersResponse.users?.length || 0;
          } catch {
            totalUsers = 0;
          }
          
          // Orders today vs yesterday
          const todayOrders = allOrders.filter((o: any) => 
            new Date(o.$createdAt) >= startOfToday
          );
          const yesterdayOrders = allOrders.filter((o: any) => {
            const date = new Date(o.$createdAt);
            return date >= startOfYesterday && date < startOfToday;
          });
          const ordersChange = yesterdayOrders.length > 0 
            ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100 
            : 0;
          
           // Fetch products count
           const productsResponse = await databases.listDocuments(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_PRODUCTS,
             [Query.limit(1)]
           );
           const totalProducts = productsResponse.total;
          
          // Calculate conversion rate (orders / users)
          const conversionRate = totalUsers > 0 
            ? (allOrders.length / totalUsers) * 100 
            : 0;
          
          return {
            data: {
              totalRevenue,
              revenueChange: Math.round(revenueChange * 10) / 10,
              totalUsers,
              usersChange: 5.2, // Would need historical user data to calculate
              newOrders: thisMonthAllOrders.length,
              cancelledOrders: thisMonthCancelled,
              pendingOrders: thisMonthPending,
              ordersChange: Math.round(ordersChange * 10) / 10,
              totalProducts,
              conversionRate: Math.round(conversionRate * 100) / 100,
            }
          };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת נתוני דאשבורד' };
        }
      },
    }),

     getRecentOrders: builder.query<Order[], number | void>({
       queryFn: async (limit = 5) => {
         try {
           const response = await databases.listDocuments(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_ORDERS,
             [Query.orderDesc('$createdAt'), Query.limit(limit || 5)]
           );
           
           const orders: Order[] = response.documents.map((doc: any) => ({
             $id: doc.$id,
             $createdAt: doc.$createdAt,
             customerName: doc.customerName,
             customerEmail: doc.customerEmail,
             customerPhone: doc.customerPhone || '',
             customerAvatar: doc.customerAvatar || '',
             total: doc.total,
             subtotal: doc.subtotal || 0,
             shippingCost: doc.shippingCost || 0,
             tax: doc.tax || 0,
             status: doc.status as OrderStatus,
             shippingStreet: doc.shippingStreet,
             shippingApartment: doc.shippingApartment || '',
             shippingCity: doc.shippingCity,
             shippingPostalCode: doc.shippingPostalCode,
             shippingCountry: doc.shippingCountry,
             paymentMethod: doc.paymentMethod,
             paymentCardExpiry: doc.paymentCardExpiry || '',
             paymentTransactionId: doc.paymentTransactionId,
             paymentChargeDate: doc.paymentChargeDate,
           }));
           
           return { data: orders };
         } catch (error: any) {
           return { error: error.message || 'שגיאה בטעינת הזמנות אחרונות' };
         }
       },
       providesTags: ['Orders'],
     }),

    getMonthlySales: builder.query<MonthlySalesData[], void>({
      queryFn: async () => {
        try {
          const now = new Date();
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          
           // Fetch all orders from current year
           const response = await databases.listDocuments(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_ORDERS,
             [
               Query.greaterThanEqual('$createdAt', startOfYear.toISOString()),
               Query.limit(1000)
             ]
           );
          
          // Hebrew month names
          const monthNames = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
          
          // Initialize all months with 0
          const monthlyData: Record<number, number> = {};
          for (let i = 0; i <= now.getMonth(); i++) {
            monthlyData[i] = 0;
          }
          
          // Aggregate completed orders by month
          response.documents.forEach((doc: any) => {
            if (doc.status === 'completed') {
              const orderDate = new Date(doc.$createdAt);
              const month = orderDate.getMonth();
              monthlyData[month] = (monthlyData[month] || 0) + (doc.total || 0);
            }
          });
          
          // Convert to chart data format
          const chartData = Object.entries(monthlyData).map(([month, value]) => ({
            name: monthNames[parseInt(month)],
            value: Math.round(value),
          }));
          
          return { data: chartData };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת נתוני מכירות' };
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetStatsQuery,
  useGetRecentOrdersQuery,
  useGetMonthlySalesQuery,
} = dashboardApi;
