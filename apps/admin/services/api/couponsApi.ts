import { api } from '@shared/api';
import { Coupon, CouponStatus, CouponDiscountType } from '@shared/types';
import { databases, APPWRITE_CONFIG } from '@shared/services';
import { ID, Query } from 'appwrite';

const couponsApi = api.injectEndpoints({
  endpoints: (builder) => ({
     getCoupons: builder.query<Coupon[], void>({
       queryFn: async () => {
         try {
           const response = await databases.listDocuments(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_COUPONS,
             [Query.orderDesc('$createdAt'), Query.limit(100)]
           );
           return { data: response.documents as unknown as Coupon[] };
         } catch (error: any) {
           return { error: error.message };
         }
       },
       providesTags: ['Coupons'],
     }),

     getCouponById: builder.query<Coupon, string>({
       queryFn: async (couponId) => {
         try {
           const response = await databases.getDocument(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_COUPONS,
             couponId
           );
           return { data: response as unknown as Coupon };
         } catch (error: any) {
           return { error: error.message };
         }
       },
       providesTags: (result, error, id) => [{ type: 'Coupons', id }],
     }),

     createCoupon: builder.mutation<Coupon, Partial<Coupon>>({
       queryFn: async (newCoupon) => {
         try {
           const response = await databases.createDocument(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_COUPONS,
             ID.unique(),
             {
               // Required fields
               code: newCoupon.code || '',
               discountType: newCoupon.discountType || CouponDiscountType.PERCENTAGE,
               discountValue: newCoupon.discountValue || 0,
               startDate: newCoupon.startDate || new Date().toISOString(),
               usageCount: newCoupon.usageCount || 0,
               status: newCoupon.status || CouponStatus.ACTIVE,
               // Optional fields
               description: newCoupon.description || null,
               buyQuantity: newCoupon.buyQuantity || null,
               getQuantity: newCoupon.getQuantity || null,
               endDate: newCoupon.endDate || null,
               minimumOrder: newCoupon.minimumOrder || null,
               maximumDiscount: newCoupon.maximumDiscount || null,
               usageLimit: newCoupon.usageLimit || null,
               usageLimitPerUser: newCoupon.usageLimitPerUser || null,
               categoryIds: newCoupon.categoryIds || [],
               productIds: newCoupon.productIds || [],
               userIds: newCoupon.userIds || [],
               firstPurchaseOnly: newCoupon.firstPurchaseOnly || false,
               excludeOtherCoupons: newCoupon.excludeOtherCoupons || false,
             }
           );
           return { data: response as unknown as Coupon };
         } catch (error: any) {
           return { error: error.message };
         }
       },
       invalidatesTags: ['Coupons'],
     }),

     updateCoupon: builder.mutation<Coupon, { id: string } & Partial<Coupon>>({
       queryFn: async ({ id, ...updates }) => {
         try {
           // Remove $id from updates
           const { $id, ...cleanUpdates } = updates as any;
           const response = await databases.updateDocument(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_COUPONS,
             id,
             cleanUpdates
           );
           return { data: response as unknown as Coupon };
         } catch (error: any) {
           return { error: error.message };
         }
       },
       invalidatesTags: ['Coupons']
     }),

     deleteCoupon: builder.mutation<boolean, string>({
       queryFn: async (couponId) => {
         try {
           await databases.deleteDocument(
             APPWRITE_CONFIG.DATABASE_ID,
             APPWRITE_CONFIG.COLLECTION_COUPONS,
             couponId
           );
           return { data: true };
         } catch (error: any) {
           return { error: error.message };
         }
       },
       invalidatesTags: ['Coupons']
     }),

    generateCouponCode: builder.query<string, void>({
      queryFn: async () => {
        try {
          // Generate a random coupon code (8 characters, uppercase alphanumeric)
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let code = '';
          for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return { data: code };
        } catch (error: any) {
          return { error: error.message };
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetCouponsQuery, 
  useGetCouponByIdQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useLazyGenerateCouponCodeQuery,
} = couponsApi;
