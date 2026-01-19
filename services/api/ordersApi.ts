import { api } from './baseApi';
import { databases, APPWRITE_CONFIG, account } from '../appwrite';
import { ID, Query } from 'appwrite';
import { Order, OrderItem, OrderStatus } from '../../types';

export const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create order (checkout)
    createOrder: builder.mutation<Order, {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      shippingAddress: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
      };
      payment: {
        method: string;
        transactionId: string;
        chargeDate: string;
      };
      items: Omit<OrderItem, '$id' | 'orderId'>[];
    }>({
      queryFn: async (orderData) => {
        try {
          // 1. Calculate totals
          const subtotal = orderData.items.reduce((sum, item) => sum + item.total, 0);
          const shippingCost = 0; // Fixed for now, could be dynamic
          const tax = 0;
          const total = subtotal + shippingCost + tax;
          
          // 2. Create order document (flattened structure)
          const orderResponse = await databases.createDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ORDERS,
            ID.unique(),
            {
              customerName: orderData.customerName,
              customerEmail: orderData.customerEmail,
              customerPhone: orderData.customerPhone || null,
              total,
              subtotal,
              shippingCost,
              tax,
              status: 'pending' as OrderStatus,
              // Flatten shipping address
              shippingStreet: orderData.shippingAddress.street,
              shippingCity: orderData.shippingAddress.city,
              shippingPostalCode: orderData.shippingAddress.postalCode,
              shippingCountry: orderData.shippingAddress.country,
              // Flatten payment info
              paymentMethod: orderData.payment.method,
              paymentTransactionId: orderData.payment.transactionId,
              paymentChargeDate: orderData.payment.chargeDate,
            }
          );
          
          // 3. Create order items
          for (const item of orderData.items) {
            await databases.createDocument(
              APPWRITE_CONFIG.DATABASE_ID,
              APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
              ID.unique(),
              {
                orderId: orderResponse.$id,
                productName: item.productName,
                productId: item.productId,
                productImage: item.productImage || null,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
              }
            );
          }
          
          return { data: orderResponse as unknown as Order };
        } catch (error: any) {
          return { error: error.message || 'שגיאה ביצירת הזמנה' };
        }
      },
      invalidatesTags: ['Orders'],
    }),

    // Get customer orders (requires authentication)
    getMyOrders: builder.query<Order[], void>({
      queryFn: async () => {
        try {
          const user = await account.get();
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ORDERS,
            [
              Query.equal('customerEmail', user.email),
              Query.orderDesc('$createdAt')
            ]
          );
          return { data: response.documents as unknown as Order[] };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת הזמנות' };
        }
      },
      providesTags: ['Orders'],
    }),

    // Get single order details
    getOrderById: builder.query<{ order: Order; items: OrderItem[] }, string>({
      queryFn: async (orderId) => {
        try {
          const orderResponse = await databases.getDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ORDERS,
            orderId
          );
          
          const itemsResponse = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
            [Query.equal('orderId', orderId)]
          );
          
          return { 
            data: { 
              order: orderResponse as unknown as Order, 
              items: itemsResponse.documents as unknown as OrderItem[] 
            } 
          };
        } catch (error: any) {
          return { error: error.message || 'הזמנה לא נמצאה' };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
} = ordersApi;
