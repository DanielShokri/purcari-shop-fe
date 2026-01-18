import { api } from './baseApi';
import { Order, OrderStatus, OrderDetails, OrderItem, ShippingAddress, PaymentInfo } from '../../types';
import { databases, APPWRITE_CONFIG } from '../appwrite';
import { ID, Query } from 'appwrite';

const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            queries: [Query.orderDesc('$createdAt'), Query.limit(100)]
          });
          
          // Map Appwrite documents to Order type
          const orders: Order[] = response.documents.map((doc: any) => ({
            $id: doc.$id,
            customerName: doc.customerName,
            customerEmail: doc.customerEmail,
            customerAvatar: doc.customerAvatar || undefined,
            total: doc.total,
            status: doc.status as OrderStatus,
            createdAt: doc.$createdAt,
          }));
          
          return { data: orders };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת הזמנות' };
        }
      },
      providesTags: ['Orders'],
    }),

    getOrderById: builder.query<OrderDetails, string>({
      queryFn: async (orderId: string) => {
        try {
          // Fetch the order document
          const orderDoc = await databases.getDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            documentId: orderId
          });
          
          // Fetch related order items
          const itemsResponse = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
            queries: [Query.equal('orderId', orderId)]
          });
          
          // Map order items
          const items: OrderItem[] = itemsResponse.documents.map((doc: any) => ({
            $id: doc.$id,
            productName: doc.productName,
            productImage: doc.productImage || undefined,
            variant: doc.variant || undefined,
            quantity: doc.quantity,
            price: doc.price,
            total: doc.total,
          }));
          
          // Map flat Appwrite fields to nested OrderDetails structure
          const orderDetails: OrderDetails = {
            $id: orderDoc.$id,
            customerName: orderDoc.customerName,
            customerEmail: orderDoc.customerEmail,
            customerPhone: orderDoc.customerPhone || undefined,
            customerAvatar: orderDoc.customerAvatar || undefined,
            total: orderDoc.total,
            status: orderDoc.status as OrderStatus,
            createdAt: orderDoc.$createdAt,
            shippingAddress: {
              street: orderDoc.shippingStreet,
              apartment: orderDoc.shippingApartment || undefined,
              city: orderDoc.shippingCity,
              postalCode: orderDoc.shippingPostalCode,
              country: orderDoc.shippingCountry,
            },
            items,
            payment: {
              method: orderDoc.paymentMethod,
              cardExpiry: orderDoc.paymentCardExpiry || undefined,
              transactionId: orderDoc.paymentTransactionId,
              chargeDate: orderDoc.paymentChargeDate,
            },
            subtotal: orderDoc.subtotal,
            shippingCost: orderDoc.shippingCost || 0,
            tax: orderDoc.tax || 0,
          };
          
          return { data: orderDetails };
        } catch (error: any) {
          return { error: error.message || 'הזמנה לא נמצאה' };
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),

    createOrder: builder.mutation<Order, {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      customerAvatar?: string;
      shippingAddress: ShippingAddress;
      payment: PaymentInfo;
      items: Omit<OrderItem, '$id'>[];
      status?: OrderStatus;
    }>({
      queryFn: async (orderData) => {
        try {
          // Calculate totals from items
          const subtotal = orderData.items.reduce((sum, item) => sum + item.total, 0);
          const shippingCost = 0; // Can be calculated based on business logic
          const tax = 0; // Can be calculated based on business logic
          const total = subtotal + shippingCost + tax;
          
          // Create the order document with flattened fields
          const orderResponse = await databases.createDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            documentId: ID.unique(),
            data: {
              customerName: orderData.customerName,
              customerEmail: orderData.customerEmail,
              customerPhone: orderData.customerPhone || null,
              customerAvatar: orderData.customerAvatar || null,
              total,
              subtotal,
              shippingCost,
              tax,
              status: orderData.status || OrderStatus.PENDING,
              // Flattened shipping address
              shippingStreet: orderData.shippingAddress.street,
              shippingApartment: orderData.shippingAddress.apartment || null,
              shippingCity: orderData.shippingAddress.city,
              shippingPostalCode: orderData.shippingAddress.postalCode,
              shippingCountry: orderData.shippingAddress.country,
              // Flattened payment info
              paymentMethod: orderData.payment.method,
              paymentCardExpiry: orderData.payment.cardExpiry || null,
              paymentTransactionId: orderData.payment.transactionId,
              paymentChargeDate: orderData.payment.chargeDate,
            }
          });
          
          // Create order items
          for (const item of orderData.items) {
            await databases.createDocument({
              databaseId: APPWRITE_CONFIG.DATABASE_ID,
              collectionId: APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
              documentId: ID.unique(),
              data: {
                orderId: orderResponse.$id,
                productName: item.productName,
                productImage: item.productImage || null,
                variant: item.variant || null,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
              }
            });
          }
          
          // Return the created order
          const order: Order = {
            $id: orderResponse.$id,
            customerName: orderResponse.customerName,
            customerEmail: orderResponse.customerEmail,
            customerAvatar: orderResponse.customerAvatar || undefined,
            total: orderResponse.total,
            status: orderResponse.status as OrderStatus,
            createdAt: orderResponse.$createdAt,
          };
          
          return { data: order };
        } catch (error: any) {
          return { error: error.message || 'שגיאה ביצירת הזמנה' };
        }
      },
      invalidatesTags: ['Orders'],
    }),

    updateOrderStatus: builder.mutation<Order, { id: string; status: OrderStatus }>({
      queryFn: async ({ id, status }) => {
        try {
          const response = await databases.updateDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            documentId: id,
            data: { status }
          });
          
          // Return the updated order (basic fields)
          const updatedOrder: Order = {
            $id: response.$id,
            customerName: response.customerName,
            customerEmail: response.customerEmail,
            customerAvatar: response.customerAvatar || undefined,
            total: response.total,
            status: response.status as OrderStatus,
            createdAt: response.$createdAt,
          };
          
          return { data: updatedOrder };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בעדכון סטטוס הזמנה' };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Orders', id }, 'Orders'],
    }),

    deleteOrder: builder.mutation<boolean, string>({
      queryFn: async (orderId: string) => {
        try {
          // First, delete all order items associated with this order
          const itemsResponse = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
            queries: [Query.equal('orderId', orderId)]
          });
          
          // Delete each order item
          for (const item of itemsResponse.documents) {
            await databases.deleteDocument({
              databaseId: APPWRITE_CONFIG.DATABASE_ID,
              collectionId: APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
              documentId: item.$id
            });
          }
          
          // Then delete the order itself
          await databases.deleteDocument({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_ORDERS,
            documentId: orderId
          });
          
          return { data: true };
        } catch (error: any) {
          return { error: error.message || 'שגיאה במחיקת הזמנה' };
        }
      },
      invalidatesTags: ['Orders']
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = ordersApi;
