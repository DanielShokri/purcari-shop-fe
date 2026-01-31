import baseApi from '@shared/api';
import { databases, APPWRITE_CONFIG, account, functions } from '@shared/services';
import { ID, Query, Permission, Role } from 'appwrite';
import { Order, OrderItem, OrderDetails, CreateOrderPayload, OrderStatus, ShippingAddress, PaymentInfo } from '@shared/types';

// Israeli VAT rate
const VAT_RATE = 0.17;
// Free shipping threshold in ILS
const FREE_SHIPPING_THRESHOLD = 300;
// Standard shipping cost in ILS
const STANDARD_SHIPPING_COST = 29.90;

// Helper to map flat order to OrderDetails
const mapFlatOrderToDetails = (
  order: any,
  items: OrderItem[]
): OrderDetails => ({
  $id: order._id,
  $createdAt: order.$createdAt,
  customerName: order.customerName,
  customerEmail: order.customerEmail,
  customerPhone: order.customerPhone,
  customerAvatar: order.customerAvatar,
  total: order.total,
  subtotal: order.subtotal,
  shippingCost: order.shippingCost,
  tax: order.tax,
  status: order.status,
  // Flattened fields
  shippingStreet: order.shippingStreet,
  shippingApartment: order.shippingApartment,
  shippingCity: order.shippingCity,
  shippingPostalCode: order.shippingPostalCode,
  shippingCountry: order.shippingCountry,
  paymentMethod: order.paymentMethod,
  paymentCardExpiry: order.paymentCardExpiry,
  paymentTransactionId: order.paymentTransactionId,
  paymentChargeDate: order.paymentChargeDate,
  // Nested structures for convenience
  shippingAddress: {
    street: order.shippingStreet,
    apartment: order.shippingApartment,
    city: order.shippingCity,
    postalCode: order.shippingPostalCode,
    country: order.shippingCountry,
  },
  payment: {
    method: order.paymentMethod,
    cardExpiry: order.paymentCardExpiry,
    transactionId: order.paymentTransactionId,
    chargeDate: order.paymentChargeDate,
  },
  items,
});

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create order (checkout)
    createOrder: builder.mutation<Order, CreateOrderPayload>({
      queryFn: async (payload) => {
        try {
          // Calculate totals
          const subtotal = payload.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          
          // Free shipping over threshold
          const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
          
          // Israeli VAT (17%)
          const tax = Math.round(subtotal * VAT_RATE * 100) / 100;
          
          // Total with proper rounding
          const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;
          
          // Get current user for permissions (optional - guest checkout supported)
          let userId: string | null = null;
          try {
            const user = await account.get();
            userId = user._id;
          } catch {
            // Guest checkout - no user-specific permissions
          }
          
          // Document permissions - user can read their own order
          const permissions = userId
            ? [Permission.read(Role.user(userId))]
            : [];
          
          const orderId = ID.unique();
          
           // Build order document with coupon snapshot
           const orderData: any = {
             customerName: payload.customerName,
             customerEmail: payload.customerEmail,
             customerPhone: payload.customerPhone || '',
             total,
             subtotal,
             shippingCost,
             tax,
             status: 'pending' as OrderStatus,
             // Flattened shipping address
             shippingStreet: payload.shippingAddress.street,
             shippingApartment: payload.shippingAddress.apartment || '',
             shippingCity: payload.shippingAddress.city,
             shippingPostalCode: payload.shippingAddress.postalCode,
             shippingCountry: payload.shippingAddress.country,
             // Flattened payment info
             paymentMethod: payload.payment.method,
             paymentCardExpiry: payload.payment.cardExpiry || '',
             paymentTransactionId: payload.payment.transactionId,
             paymentChargeDate: payload.payment.chargeDate,
           };
           
           // Add coupon snapshot if provided
           if (payload.appliedCouponCode) {
             orderData.appliedCouponCode = payload.appliedCouponCode;
             orderData.appliedCouponDiscount = payload.appliedCouponDiscount || 0;
             orderData.appliedCouponType = payload.appliedCouponType || 'percentage';
           }
           
           // Create order document (flattened structure matching backend schema)
           const orderResponse = await databases.createDocument(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_ORDERS,
             orderId,
             orderData,
             permissions
           );
          
           // Create order items in parallel
           await Promise.all(
             payload.items.map((item) =>
               databases.createDocument(
                 APPWRITE_CONFIG.DATABASE_ID,
                 APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
                 ID.unique(),
                 {
                   orderId,
                   productName: item.productName,
                   productImage: item.productImage || '',
                   variant: item.variant || '',
                   quantity: item.quantity,
                   price: item.price,
                   total: Math.round(item.price * item.quantity * 100) / 100,
                 },
                 permissions
               )
             )
           );
           
           // After successful order creation, increment coupon usage if coupon was applied
           if (payload.appliedCouponCode) {
             try {
               console.debug('[OrdersApi] Incrementing coupon usage for:', payload.appliedCouponCode);
               
               await functions.createExecution(
                 APPWRITE_CONFIG.FUNCTION_INCREMENT_COUPON_USAGE,
                 JSON.stringify({
                   couponCode: payload.appliedCouponCode.toUpperCase(),
                   userEmail: payload.customerEmail,
                   userId: userId || undefined
                 }),
                 false,  // async: false - wait for result
                 '/'     // path
               );
               
               console.debug('[OrdersApi] Coupon usage incremented successfully');
             } catch (error: any) {
               // Non-blocking error: log but don't fail the order
               console.error('[OrdersApi] Error incrementing coupon usage:', error.message);
               // Continue - order already created successfully
             }
           }
          
          return {
            data: {
              $id: orderResponse._id,
              $createdAt: orderResponse.$createdAt,
              customerName: orderResponse.customerName,
              customerEmail: orderResponse.customerEmail,
              customerPhone: orderResponse.customerPhone,
              total: orderResponse.total,
              subtotal: orderResponse.subtotal,
              shippingCost: orderResponse.shippingCost,
              tax: orderResponse.tax,
              status: orderResponse.status as OrderStatus,
              shippingStreet: orderResponse.shippingStreet,
              shippingApartment: orderResponse.shippingApartment,
              shippingCity: orderResponse.shippingCity,
              shippingPostalCode: orderResponse.shippingPostalCode,
              shippingCountry: orderResponse.shippingCountry,
              paymentMethod: orderResponse.paymentMethod,
              paymentCardExpiry: orderResponse.paymentCardExpiry,
              paymentTransactionId: orderResponse.paymentTransactionId,
              paymentChargeDate: orderResponse.paymentChargeDate,
            } as Order,
          };
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
              Query.orderDesc('$createdAt'),
              Query.limit(50),
            ]
          );
          
          return { data: response.documents as unknown as Order[] };
        } catch (error: any) {
          if (error.code === 401) {
            return { error: 'יש להתחבר כדי לצפות בהזמנות' };
          }
          return { error: error.message || 'שגיאה בטעינת הזמנות' };
        }
      },
      providesTags: ['Orders'],
    }),

    // Get single order with full details
    getOrderById: builder.query<OrderDetails, string>({
      queryFn: async (orderId) => {
        try {
          // Get current user for authorization
          const user = await account.get();
          
          // Get order
          const order = await databases.getDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ORDERS,
            orderId
          );
          
          // Verify ownership
          if ((order as any).customerEmail !== user.email) {
            return { error: 'אין לך הרשאה לצפות בהזמנה זו' };
          }
          
          // Get order items
          const itemsResponse = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
            [
              Query.equal('orderId', orderId),
              Query.limit(100),
            ]
          );
          
          const orderDetails = mapFlatOrderToDetails(
            order,
            itemsResponse.documents as unknown as OrderItem[]
          );
          
          return { data: orderDetails };
        } catch (error: any) {
          if (error.code === 401) {
            return { error: 'יש להתחבר כדי לצפות בהזמנה' };
          }
          if (error.code === 404) {
            return { error: 'ההזמנה לא נמצאה' };
          }
          return { error: error.message || 'שגיאה בטעינת ההזמנה' };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),

    // Get order by ID without auth (for order confirmation page with order ID only)
    getOrderConfirmation: builder.query<Order, string>({
      queryFn: async (orderId) => {
        try {
          const order = await databases.getDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ORDERS,
            orderId
          );
          
          return { data: order as unknown as Order };
        } catch (error: any) {
          if (error.code === 404) {
            return { error: 'ההזמנה לא נמצאה' };
          }
          return { error: error.message || 'שגיאה בטעינת ההזמנה' };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderConfirmationQuery,
} = ordersApi;
