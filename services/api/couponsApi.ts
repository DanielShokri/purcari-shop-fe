import { api } from './baseApi';
import { databases, account, functions, APPWRITE_CONFIG } from '../appwrite';
import { Query } from 'appwrite';
import { Coupon, CouponValidationResult, CartItem, CouponDiscountType, CouponUsageRecord } from '../../types';

// Standard shipping cost for free shipping calculation
const STANDARD_SHIPPING_COST = 29.90;

// Coupon validation input
interface ValidateCouponInput {
  code: string;
  cartItems: CartItem[];
  subtotal: number;
  userEmail?: string;    // NEW: for per-user limit checks
  userId?: string;       // NEW: for authenticated users
}

export const couponsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Validate coupon code with full validation logic
    validateCoupon: builder.query<CouponValidationResult, ValidateCouponInput>({
      queryFn: async ({ code, cartItems, subtotal, userEmail, userId }) => {
        try {
          // Find coupon by code
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_COUPONS,
            [
              Query.equal('code', code.toUpperCase()),
              Query.limit(1),
            ]
          );
          
          if (response.documents.length === 0) {
            return {
              data: {
                valid: false,
                error: 'קוד קופון לא תקין',
              },
            };
          }
          
          const coupon = response.documents[0] as unknown as Coupon;
          const now = new Date();
          
          // Check status
          if (coupon.status !== 'active') {
            return {
              data: {
                valid: false,
                error: 'קופון זה אינו פעיל',
              },
            };
          }
          
          // Check start date
          if (new Date(coupon.startDate) > now) {
            return {
              data: {
                valid: false,
                error: 'קופון זה עדיין לא בתוקף',
              },
            };
          }
          
          // Check end date
          if (coupon.endDate && new Date(coupon.endDate) < now) {
            return {
              data: {
                valid: false,
                error: 'תוקף הקופון פג',
              },
            };
          }
          
          // Check usage limit
          if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return {
              data: {
                valid: false,
                error: 'הקופון הגיע למגבלת השימושים',
              },
            };
          }
          
          // NEW: Check per-user usage limit (from coupon_usage collection)
          if (coupon.usageLimitPerUser && userEmail) {
            try {
              const usageResponse = await databases.listDocuments(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_COUPON_USAGE,
                [
                  Query.equal('couponCode', code.toUpperCase()),
                  Query.equal('userEmail', userEmail),
                  Query.limit(1)
                ]
              );
              
              if (usageResponse.documents.length > 0) {
                const usage = usageResponse.documents[0] as unknown as CouponUsageRecord;
                if (usage.usageCount >= coupon.usageLimitPerUser) {
                  return {
                    data: {
                      valid: false,
                      error: `You have reached the maximum usage limit for this coupon (${coupon.usageLimitPerUser} uses)`,
                    },
                  };
                }
              }
            } catch (error) {
              console.error('[CouponsApi] Error checking coupon usage:', error);
              // Continue anyway - don't block validation on DB errors
            }
          }
           
           // NEW: Check per-user usage limit (from coupon_usage collection)
           if (coupon.usageLimitPerUser) {
             const userIdentifier = userEmail || (await account.get().then(u => u.email).catch(() => null));
             
             if (userIdentifier) {
               try {
                 const usageResponse = await databases.listDocuments(
                   APPWRITE_CONFIG.DATABASE_ID,
                   APPWRITE_CONFIG.COLLECTION_COUPON_USAGE,
                   [
                     Query.equal('couponCode', code.toUpperCase()),
                     Query.equal('userEmail', userIdentifier),
                     Query.limit(1)
                   ]
                 );
                 
                 if (usageResponse.documents.length > 0) {
                   const usage = usageResponse.documents[0] as unknown as CouponUsageRecord;
                   if (usage.usageCount >= coupon.usageLimitPerUser) {
                     return {
                       data: {
                         valid: false,
                         error: `You have reached the maximum usage limit for this coupon (${coupon.usageLimitPerUser} uses)`,
                       },
                     };
                   }
                 }
               } catch (error) {
                 console.error('[CouponsApi] Error checking coupon usage:', error);
                 // Continue anyway - don't block validation on DB errors
               }
             }
           }
          
          // Check minimum order
          if (coupon.minimumOrder && subtotal < coupon.minimumOrder) {
            return {
              data: {
                valid: false,
                error: `מינימום הזמנה לקופון זה: ₪${coupon.minimumOrder}`,
              },
            };
          }
          
          // Check first purchase only
          if (coupon.firstPurchaseOnly) {
            try {
              const user = await account.get();
              const orders = await databases.listDocuments(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ORDERS,
                [
                  Query.equal('customerEmail', user.email),
                  Query.limit(1),
                ]
              );
              
              if (orders.documents.length > 0) {
                return {
                  data: {
                    valid: false,
                    error: 'קופון זה לרכישה ראשונה בלבד',
                  },
                };
              }
            } catch {
              // User not logged in - allow for now, will check at checkout
            }
          }
          
          // Check user restrictions
          if (coupon.userIds && coupon.userIds.length > 0) {
            try {
              const user = await account.get();
              if (!coupon.userIds.includes(user.$id)) {
                return {
                  data: {
                    valid: false,
                    error: 'קופון זה אינו זמין עבורך',
                  },
                };
              }
            } catch {
              return {
                data: {
                  valid: false,
                  error: 'יש להתחבר כדי להשתמש בקופון זה',
                },
              };
            }
          }
          
          // Check category restrictions
          if (coupon.categoryIds && coupon.categoryIds.length > 0) {
            // For now we skip this check as cart items don't have category info
            // This should be validated at checkout with full product data
          }
          
          // Check product restrictions
          if (coupon.productIds && coupon.productIds.length > 0) {
            const validProducts = cartItems.filter(item =>
              coupon.productIds!.includes(item.productId)
            );
            if (validProducts.length === 0) {
              return {
                data: {
                  valid: false,
                  error: 'הקופון אינו תקף למוצרים בעגלה',
                },
              };
            }
          }
          
          // Calculate discount amount
          let discountAmount = 0;
          
          switch (coupon.discountType) {
            case CouponDiscountType.PERCENTAGE:
              discountAmount = subtotal * (coupon.discountValue / 100);
              break;
              
            case CouponDiscountType.FIXED_AMOUNT:
              discountAmount = coupon.discountValue;
              break;
              
            case CouponDiscountType.FREE_SHIPPING:
              discountAmount = STANDARD_SHIPPING_COST;
              break;
              
            case CouponDiscountType.FREE_PRODUCT:
              // Free product discount - value is the product price
              // This would need more complex logic with specific products
              discountAmount = coupon.discountValue;
              break;
              
            case CouponDiscountType.BUY_X_GET_Y:
              // Buy X get Y free - simplified calculation
              if (coupon.buyQuantity && coupon.getQuantity) {
                const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                const sets = Math.floor(totalItems / (coupon.buyQuantity + coupon.getQuantity));
                // Assume average item price for free items
                const avgPrice = subtotal / totalItems;
                discountAmount = sets * coupon.getQuantity * avgPrice;
              }
              break;
              
            default:
              discountAmount = 0;
          }
          
          // Apply maximum discount cap
          if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
            discountAmount = coupon.maximumDiscount;
          }
          
          // Don't allow discount to exceed subtotal
          if (discountAmount > subtotal) {
            discountAmount = subtotal;
          }
          
          return {
            data: {
              valid: true,
              coupon,
              discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimals
            },
          };
        } catch (error: any) {
          return { error: error.message || 'שגיאה באימות קופון' };
        }
      },
      providesTags: ['Coupons'],
    }),
    
    // NEW: Increment coupon usage via Cloud Function
    incrementCouponUsage: builder.mutation<void, {
      couponCode: string;
      userEmail: string;
      userId?: string;
    }>({
      queryFn: async (payload) => {
        try {
          console.debug('[CouponsApi] Calling incrementCouponUsage function:', payload);
          
          const result = await functions.createExecution(
            APPWRITE_CONFIG.FUNCTION_INCREMENT_COUPON_USAGE,
            JSON.stringify({
              couponCode: payload.couponCode.toUpperCase(),
              userEmail: payload.userEmail,
              userId: payload.userId
            }),
            false,  // async: false - wait for result
            '/'     // path
          );
          
          console.debug('[CouponsApi] Function execution result:', result);
          
          if (result.status !== 'completed') {
            throw new Error(`Function execution failed: ${result.errors || 'Unknown error'}`);
          }
          
          return { data: undefined };
        } catch (error: any) {
          console.error('[CouponsApi] Error incrementing coupon usage:', error);
          return { error: error.message };
        }
      },
      invalidatesTags: ['Coupons']
    }),
  }),
  overrideExisting: true,
});

export const { 
  useValidateCouponQuery, 
  useLazyValidateCouponQuery,
  useIncrementCouponUsageMutation  // NEW
} = couponsApi;
