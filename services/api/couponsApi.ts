import { api } from './baseApi';
import { databases, account, APPWRITE_CONFIG } from '../appwrite';
import { Query } from 'appwrite';
import { Coupon, CouponValidationResult, CartItem, CouponDiscountType } from '../../types';

// Standard shipping cost for free shipping calculation
const STANDARD_SHIPPING_COST = 29.90;

// Coupon validation input
interface ValidateCouponInput {
  code: string;
  cartItems: CartItem[];
  subtotal: number;
}

export const couponsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Validate coupon code with full validation logic
    validateCoupon: builder.query<CouponValidationResult, ValidateCouponInput>({
      queryFn: async ({ code, cartItems, subtotal }) => {
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
  }),
  overrideExisting: true,
});

export const { useValidateCouponQuery, useLazyValidateCouponQuery } = couponsApi;
