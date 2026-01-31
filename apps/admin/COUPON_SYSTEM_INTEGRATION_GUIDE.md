# Coupon System Integration Guide (Storefront FE)

This guide defines how the Storefront Frontend should integrate with the **Coupon** system managed by the Hebrew Admin Dashboard.

## 1. Data Schema & Types

The Storefront should implement the following interfaces for coupon validation and application.

```typescript
export enum CouponDiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
  FREE_PRODUCT = 'free_product',
  BUY_X_GET_Y = 'buy_x_get_y'
}

export enum CouponStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  SCHEDULED = 'scheduled'
}

export interface Coupon {
  $id: string;
  code: string;                    // The unique code (e.g., "SAVE20")
  description?: string;            // Internal description
  discountType: CouponDiscountType;
  discountValue: number;           // % or fixed amount
  startDate: string;               // ISO date
  endDate?: string;                // ISO date (optional)
  usageCount: number;
  status: CouponStatus;
  
  // Rules & Restrictions
  minimumOrder?: number;           // Minimum cart subtotal
  maximumDiscount?: number;        // Cap for percentage discounts
  usageLimit?: number;             // Total global usage limit
  usageLimitPerUser?: number;      // Limit per customer email
  categoryIds: string[];           // Restricted to these categories
  productIds: string[];            // Restricted to these products
  userIds: string[];               // Restricted to these users
  firstPurchaseOnly: boolean;      // First-time customers only
  excludeOtherCoupons: boolean;    // Cannot stack with other codes
}
```

## 2. API Integration (RTK Query)

The Storefront needs a validation endpoint to check if a coupon code is valid for the current cart.

```typescript
// services/api/couponsApi.ts
import { api } from './baseApi';
import { databases, APPWRITE_CONFIG } from '../appwrite';
import { Query } from 'appwrite';

export const couponsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    validateCoupon: builder.query<Coupon, string>({
      queryFn: async (code) => {
        try {
          const response = await databases.listDocuments({
            databaseId: APPWRITE_CONFIG.DATABASE_ID,
            collectionId: APPWRITE_CONFIG.COLLECTION_COUPONS,
            queries: [
              Query.equal('code', code.toUpperCase()),
              Query.equal('status', 'active'),
              Query.limit(1)
            ]
          });
          
          if (response.documents.length === 0) {
            throw new Error('קוד קופון לא נמצא או שאינו פעיל');
          }
          
          const coupon = response.documents[0] as unknown as Coupon;
          
          // Basic Date Validation
          const now = new Date();
          if (new Date(coupon.startDate) > now) throw new Error('הקופון עדיין לא בתוקף');
          if (coupon.endDate && new Date(coupon.endDate) < now) throw new Error('תוקף הקופון פג');
          
          // Global Usage Limit
          if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            throw new Error('הקופון הגיע למכסה המקסימלית');
          }

          return { data: coupon };
        } catch (error: any) {
          return { error: error.message };
        }
      },
    }),
  }),
});
```

## 3. Validation Logic (Frontend)

When applying a coupon, the FE must validate the cart state against the coupon rules:

```typescript
const validateCouponForCart = (coupon: Coupon, cart: CartState, user?: User) => {
  // 1. Minimum Order
  if (coupon.minimumOrder && cart.subtotal < coupon.minimumOrder) {
    return { valid: false, error: `מינימום הזמנה לקופון זה: ₪${coupon.minimumOrder}` };
  }

  // 2. First Purchase Only
  if (coupon.firstPurchaseOnly && user && user.orderCount > 0) {
    return { valid: false, error: 'הקופון מיועד לרכישה ראשונה בלבד' };
  }

  // 3. Category/Product Restrictions
  if (coupon.productIds.length > 0) {
    const hasValidProduct = cart.items.some(item => coupon.productIds.includes(item.productId));
    if (!hasValidProduct) return { valid: false, error: 'הקופון אינו תקף למוצרים בעגלה' };
  }

  return { valid: true };
};
```

## 4. Discount Calculation

```typescript
const calculateDiscount = (coupon: Coupon, subtotal: number) => {
  let amount = 0;
  if (coupon.discountType === 'percentage') {
    amount = subtotal * (coupon.discountValue / 100);
    if (coupon.maximumDiscount) amount = Math.min(amount, coupon.maximumDiscount);
  } else if (coupon.discountType === 'fixed_amount') {
    amount = coupon.discountValue;
  }
  return amount;
};
```

## 5. Integration Checklist

1. **Upper Case**: Always convert user input to `.toUpperCase()` before querying Appwrite.
2. **Atomic Updates**: When an order is placed, use an Appwrite Function or the `updateDocument` to increment the `usageCount` of the coupon.
3. **Stacked Coupons**: Check `excludeOtherCoupons`. If true, applying a new coupon should remove any existing ones.
4. **Real-time Price**: Ensure the discount is recalculated if the user changes item quantities in the cart.

---
*Generated for Storefront FE Integration - v1.0*
