import { api } from './baseApi';
import { databases, APPWRITE_CONFIG } from '../appwrite';
import { Query } from 'appwrite';
import { Coupon } from '../../types';

export const couponsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Validate coupon code
    validateCoupon: builder.query<Coupon, { code: string; cartTotal: number }>({
      queryFn: async ({ code, cartTotal }) => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_COUPONS,
            [
              Query.equal('code', code.toUpperCase()),
              Query.equal('status', 'active')
            ]
          );
          
          if (response.documents.length === 0) {
            return { error: 'קוד קופון לא תקין' };
          }
          
          const coupon = response.documents[0] as unknown as Coupon;
          
          // Validate date range
          const now = new Date();
          if (new Date(coupon.startDate) > now) {
            return { error: 'קופון עדיין לא פעיל' };
          }
          if (coupon.endDate && new Date(coupon.endDate) < now) {
            return { error: 'קופון פג תוקף' };
          }
          
          // Validate minimum order
          if (coupon.minimumOrder && cartTotal < coupon.minimumOrder) {
            return { error: `הזמנה מינימלית: ₪${coupon.minimumOrder}` };
          }
          
          // Validate usage limit
          if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return { error: 'קופון הגיע למגבלת שימוש' };
          }
          
          return { data: coupon };
        } catch (error: any) {
          return { error: error.message || 'שגיאה באימות קופון' };
        }
      },
    }),
  }),
});

export const { useValidateCouponQuery, useLazyValidateCouponQuery } = couponsApi;
