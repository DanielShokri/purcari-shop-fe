# Cart Rules Integration Guide (Storefront FE)

This guide defines how the Storefront Frontend should integrate with the dynamic **Cart Rules** system managed by the Hebrew Admin Dashboard.

## 1. Data Schema & Types

The Storefront must implement the following interfaces to ensure type safety when communicating with Appwrite.

```typescript
export enum CartRuleType {
  SHIPPING = 'shipping',       // Shipping logic (e.g., Free shipping threshold)
  DISCOUNT = 'discount',       // Automatic cart discounts
  RESTRICTION = 'restriction', // Cart restrictions (e.g., Minimum order)
  BENEFIT = 'benefit'          // Special benefits/gifts
}

export enum CartRuleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused'
}

export interface CartRule {
  $id: string;
  name: string;                // Rule name (e.g., "Free Shipping over 300")
  description?: string;        // Description shown to user
  type: CartRuleType;
  priority: number;            // Lower number = Higher priority
  status: CartRuleStatus;
  value?: number;              // Numeric parameter for the rule
}
```

## 2. API Integration (RTK Query)

Inject the following endpoint into your base API to fetch rules. It is recommended to cache this data as it changes infrequently.

```typescript
// services/api/cartRulesApi.ts
import { api } from './baseApi';
import { databases, APPWRITE_CONFIG } from '../appwrite';
import { Query } from 'appwrite';

export const cartRulesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCartRules: builder.query<CartRule[], void>({
      queryFn: async () => {
        try {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            'cart_rules',
            [
              Query.equal('status', 'active'),
              Query.orderAsc('priority'),
              Query.limit(100)
            ]
          );
          return { data: response.documents as unknown as CartRule[] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ['CartRules'],
    }),
  }),
});
```

## 3. Calculation Engine logic

The FE should apply rules in order of priority. Below is the standard implementation pattern for the cart calculation engine.

### Step 1: Create a Selector or Utility
```typescript
export const calculateCartTotals = (items: CartItem[], rules: CartRule[]) => {
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  let shippingCost = 29.90; // Standard baseline
  let discount = 0;
  let validationErrors: string[] = [];
  let appliedBenefits: string[] = [];

  // Rules are already sorted by priority from API
  rules.forEach(rule => {
    switch (rule.type) {
      case CartRuleType.SHIPPING:
        if (subtotal >= (rule.value || 0)) {
          shippingCost = 0;
        }
        break;

      case CartRuleType.RESTRICTION:
        if (subtotal < (rule.value || 0)) {
          validationErrors.push(`מינימום להזמנה באתר: ₪${rule.value}`);
        }
        break;

      case CartRuleType.DISCOUNT:
        // Logic for automatic % or fixed discounts
        break;
        
      case CartRuleType.BENEFIT:
        if (subtotal >= (rule.value || 0)) {
          appliedBenefits.push(rule.name);
        }
        break;
    }
  });

  return {
    subtotal,
    shippingCost,
    discount,
    total: subtotal + shippingCost - discount,
    validationErrors,
    appliedBenefits
  };
};
```

## 4. Integration Checklist

1. **Permission Check**: Ensure the Appwrite console has `Read` permissions enabled for `role:all` on the `cart_rules` collection.
2. **Priority Handling**: Always respect the `priority` field. A "Restriction" rule might block checkout before a "Shipping" rule is even relevant.
3. **UI Feedback**: Use the `description` field from the rule to show helpful tooltips or banners (e.g., "הוסף עוד ₪50 למשלוח חינם!").
4. **Checkout Validation**: Re-run the Cart Rules logic on the final "Place Order" click to ensure rules haven't changed during the session.

---
*Generated for Storefront FE Integration - v1.0*
