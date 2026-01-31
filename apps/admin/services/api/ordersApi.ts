import { api } from '@shared/api';
import { Order, OrderStatus, OrderDetails, OrderItem, ShippingAddress, PaymentInfo } from '@shared/types';
import { databases, APPWRITE_CONFIG } from '@shared/services';
import { ID, Query } from 'appwrite';

const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
       queryFn: async () => {
         try {
           const response = await databases.listDocuments(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_ORDERS,
             [Query.orderDesc('$createdAt'), Query.limit(100)]
           );
          
           // Map Appwrite documents to Order type
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
          return { error: error.message || 'שגיאה בטעינת הזמנות' };
        }
      },
      providesTags: ['Orders'],
    }),

    getOrderById: builder.query<OrderDetails, string>({
      queryFn: async (orderId: string) => {
         try {
           // Fetch the order document
           const orderDoc = await databases.getDocument(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_ORDERS,
             orderId
           );
           
           // Fetch related order items
           const itemsResponse = await databases.listDocuments(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
             [Query.equal('orderId', orderId)]
           );
          
           // Map order items
           const items: OrderItem[] = itemsResponse.documents.map((doc: any) => ({
             $id: doc.$id,
             orderId: doc.orderId,
             productId: doc.productId,
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
             $createdAt: orderDoc.$createdAt,
             customerName: orderDoc.customerName,
             customerEmail: orderDoc.customerEmail,
             customerPhone: orderDoc.customerPhone || '',
             customerAvatar: orderDoc.customerAvatar || '',
             total: orderDoc.total,
             subtotal: orderDoc.subtotal || 0,
             shippingCost: orderDoc.shippingCost || 0,
             tax: orderDoc.tax || 0,
             status: orderDoc.status as OrderStatus,
             shippingStreet: orderDoc.shippingStreet,
             shippingApartment: orderDoc.shippingApartment || '',
             shippingCity: orderDoc.shippingCity,
             shippingPostalCode: orderDoc.shippingPostalCode,
             shippingCountry: orderDoc.shippingCountry,
             paymentMethod: orderDoc.paymentMethod,
             paymentCardExpiry: orderDoc.paymentCardExpiry || '',
             paymentTransactionId: orderDoc.paymentTransactionId,
             paymentChargeDate: orderDoc.paymentChargeDate,
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
           const orderResponse = await databases.createDocument(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_ORDERS,
             ID.unique(),
             {
               customerName: orderData.customerName,
               customerEmail: orderData.customerEmail,
               customerPhone: orderData.customerPhone || null,
               customerAvatar: orderData.customerAvatar || null,
               total,
               subtotal,
               shippingCost,
               tax,
               status: orderData.status || 'pending',
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
           );
          
           // Create order items
           for (const item of orderData.items) {
             await databases.createDocument(
               APPWRITE_CONFIG.DATABASE_ID,
               APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
               ID.unique(),
               {
                 orderId: orderResponse.$id,
                 productId: item.productId,
                 productName: item.productName,
                 productImage: item.productImage || null,
                 variant: item.variant || null,
                 quantity: item.quantity,
                 price: item.price,
                 total: item.total,
               }
             );
           }
          
           // Return the created order
           const order: Order = {
             $id: orderResponse.$id,
             $createdAt: orderResponse.$createdAt,
             customerName: orderResponse.customerName,
             customerEmail: orderResponse.customerEmail,
             customerPhone: orderResponse.customerPhone || '',
             customerAvatar: orderResponse.customerAvatar || '',
             total: orderResponse.total,
             subtotal: orderResponse.subtotal || 0,
             shippingCost: orderResponse.shippingCost || 0,
             tax: orderResponse.tax || 0,
             status: orderResponse.status as OrderStatus,
             shippingStreet: orderResponse.shippingStreet,
             shippingApartment: orderResponse.shippingApartment || '',
             shippingCity: orderResponse.shippingCity,
             shippingPostalCode: orderResponse.shippingPostalCode,
             shippingCountry: orderResponse.shippingCountry,
             paymentMethod: orderResponse.paymentMethod,
             paymentCardExpiry: orderResponse.paymentCardExpiry || '',
             paymentTransactionId: orderResponse.paymentTransactionId,
             paymentChargeDate: orderResponse.paymentChargeDate,
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
           const response = await databases.updateDocument(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_ORDERS,
             id,
             { status }
           );
           
           // Return the updated order (basic fields)
           const updatedOrder: Order = {
             $id: response.$id,
             $createdAt: response.$createdAt,
             customerName: response.customerName,
             customerEmail: response.customerEmail,
             customerPhone: response.customerPhone || '',
             customerAvatar: response.customerAvatar || '',
             total: response.total,
             subtotal: response.subtotal || 0,
             shippingCost: response.shippingCost || 0,
             tax: response.tax || 0,
             status: response.status as OrderStatus,
             shippingStreet: response.shippingStreet,
             shippingApartment: response.shippingApartment || '',
             shippingCity: response.shippingCity,
             shippingPostalCode: response.shippingPostalCode,
             shippingCountry: response.shippingCountry,
             paymentMethod: response.paymentMethod,
             paymentCardExpiry: response.paymentCardExpiry || '',
             paymentTransactionId: response.paymentTransactionId,
             paymentChargeDate: response.paymentChargeDate,
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
           const itemsResponse = await databases.listDocuments(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
             [Query.equal('orderId', orderId)]
           );
           
           // Delete each order item
           for (const item of itemsResponse.documents) {
             await databases.deleteDocument(
               APPWRITE_CONFIG.DATABASE_ID,
               APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
               item.$id
             );
           }
           
           // Then delete the order itself
           await databases.deleteDocument(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_ORDERS,
             orderId
           );
          
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
