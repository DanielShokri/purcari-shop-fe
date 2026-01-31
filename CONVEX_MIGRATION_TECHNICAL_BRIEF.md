# 📋 Technical Brief: Appwrite → Convex Migration Data Mapping

## Overview
This document provides complete technical specifications for migrating the Purcari Israel monorepo (Storefront + Admin) from Appwrite to Convex. Since the project is not yet live with no user data, this is a "clean slate" migration.

---

## 1. Auth & User Preferences

### Current Appwrite Auth Implementation

**Files affected:**
- `apps/storefront/services/api/authApi.ts` (207 lines)
- `apps/admin/services/api/authApi.ts`
- `packages/shared-services/src/appwrite.ts`

**Entry points:**
- `useLoginMutation()` → `useRegisterMutation()`
- `useGetCurrentUserQuery()`
- `useUpdateProfileMutation()`
- `useGetUserPrefsQuery()` / `useUpdateUserPrefsMutation()`
- `useUpdateAddressMutation()`

### Data Structure (UserPreferences)

The current system uses Appwrite's `account.updatePrefs()` to store user auxiliary data as a nested JSON object:

```typescript
interface UserPreferences {
  addresses?: Address[];  // Array of nested address objects
  phone?: string;
  cart?: SavedCart;       // Optional cart persistence
}

interface Address {
  id: string;            // Generated as `addr_${Date.now()}`
  name: string;          // Display label (defaults to city name)
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;   // Only one default per user
}
```

**Current Appwrite Implementation:**
- Phone and addresses stored in `account.prefs`
- Address array managed via `account.getPrefs()` + `account.updatePrefs()`
- Merge strategy: spread existing prefs and update specific fields
- Multi-address support with one default

### Identity & Authentication

**Recommendation: Convex Auth (Native)**

Native Convex Auth is recommended for this clean slate migration. It provides:
- Built-in session management
- User identity via `tokenIdentifier` 
- Cleaner integration without third-party dependencies
- Full control over user data schema

**Convex Schema Design:**

```typescript
// convex/schema.ts
export default {
  users: defineTable({
    tokenIdentifier: v.string(),  // From Convex Auth
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("admin"), 
      v.literal("editor"), 
      v.literal("viewer")
    )),
    status: v.optional(v.union(
      v.literal("active"), 
      v.literal("inactive"), 
      v.literal("suspended")
    )),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_tokenIdentifier", ["tokenIdentifier"]),

  userAddresses: defineTable({
    userId: v.id("users"),
    name: v.string(),
    street: v.string(),
    apartment: v.optional(v.string()),
    city: v.string(),
    postalCode: v.string(),
    country: v.string(),
    isDefault: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_default", ["userId", "isDefault"]),
};
```

**Migration Notes:**
- Move `addresses` to separate `userAddresses` table for better scalability
- Keep `phone` on users table (frequently queried)
- Add `createdAt` / `updatedAt` timestamps for audit trail
- Remove cart persistence from preferences (manage separately in Redux)

### Example: Storefront Auth Hook Migration

**Before (Appwrite):**
```typescript
// apps/storefront/services/api/authApi.ts:L45
const { data: user } = useGetCurrentUserQuery();
const [login] = useLoginMutation();

await login({ email, password }).unwrap();
```

**After (Convex):**
```typescript
// Use @convex-dev/auth hooks
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const user = useQuery(api.users.current);
const { signIn } = useAuthActions();

await signIn('password', { email, password });
```

---

## 2. E-commerce Schema Specifics

### Appwrite → Convex Collection Mapping

**Export Appwrite data before migration:**
```bash
#!/bin/bash
# scripts/export-appwrite.sh

for collection in products categories orders order_items coupons coupon_usage cart_rules analytics_events notifications; do
  echo "Exporting $collection..."
  npx appwrite-cli databases listDocuments \
    --databaseId cms_db \
    --collectionId $collection \
    --limit 10000 > data/$collection.json
done
```

**Create import script:**
```typescript
// convex/migrations/importAppwrite.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const importProducts = mutation({
  args: { data: v.array(v.any()) },
  handler: async (ctx, { data }) => {
    let imported = 0;
    for (const product of data) {
      // Remove Appwrite metadata
      const { $id, $createdAt, $updatedAt, $permissions, ...fields } = product;
      
      try {
        await ctx.db.insert("products", {
          ...fields,
          createdAt: $createdAt || new Date().toISOString(),
          updatedAt: $updatedAt || new Date().toISOString(),
        });
        imported++;
      } catch (err) {
        console.error(`Failed to import product ${$id}:`, err);
      }
    }
    return { imported, total: data.length };
  },
});
```

### Collections Overview

| Collection | Purpose | Related To |
|------------|---------|-----------|
| `products` | Product catalog (wine inventory) | categories, orders |
| `categories` | Product categories/subcategories | products |
| `orders` | Order headers (customer + totals) | orderItems, coupons |
| `orderItems` | Order line items | orders, products |
| `coupons` | Coupon definitions | couponUsage, cartRules |
| `couponUsage` | Per-user coupon tracking | coupons, users |
| `cartRules` | Automatic discounts/restrictions | orders, products |
| `analyticsEvents` | Event tracking (views, clicks) | users, products |
| `notifications` | Admin notifications | users (admin only) |

### Product Schema

**Appwrite Fields → Convex Types:**

**Key differences:**
- No `$id` (Convex generates `_id` automatically)
- No `$createdAt` / `$updatedAt` (store explicitly as strings)
- Images: Keep URLs (no binary migration needed)
- Relations: Use `v.id("tableName")` for strict foreign keys

```typescript
products: defineTable({
  // Required fields
  productName: v.string(),
  productNameHe: v.optional(v.string()),
  price: v.float64(),
  quantityInStock: v.int64(),
  sku: v.string(),
  category: v.string(),  // category ID reference
  
  // Optional fields
  description: v.optional(v.string()),
  descriptionHe: v.optional(v.string()),
  shortDescription: v.optional(v.string()),
  shortDescriptionHe: v.optional(v.string()),
  salePrice: v.optional(v.float64()),
  onSale: v.optional(v.boolean()),
  
  // Wine-specific fields
  wineType: v.optional(v.union(
    v.literal("Red"),
    v.literal("White"),
    v.literal("Rosé"),
    v.literal("Sparkling")
  )),
  region: v.optional(v.string()),
  vintage: v.optional(v.int32()),
  alcoholContent: v.optional(v.float64()),
  volume: v.optional(v.string()),    // e.g., "750ml"
  grapeVariety: v.optional(v.string()),
  servingTemperature: v.optional(v.string()),
  tastingNotes: v.optional(v.string()),
  
  // Media
  featuredImage: v.optional(v.string()),  // Full URL
  images: v.optional(v.array(v.string())), // URL array
  
  // Catalog management
  isFeatured: v.optional(v.boolean()),
  tags: v.optional(v.array(v.string())),
  relatedProducts: v.optional(v.array(v.string())), // Product IDs
  
  // Status & tracking
  status: v.optional(v.union(
    v.literal("draft"),
    v.literal("active"),
    v.literal("hidden"),
    v.literal("discontinued")
  )),
  stockStatus: v.optional(v.union(
    v.literal("in_stock"),
    v.literal("out_of_stock"),
    v.literal("low_stock")
  )),
  
  dateAdded: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
})
  .searchIndex("search_he", { searchField: "productNameHe" })
  .searchIndex("search_en", { searchField: "productName" })
  .index("by_category", ["category"])
  .index("by_status", ["status"]),
```

### Order Schema

**Appwrite Current Approach:** Flattened fields for shipping/payment (denormalized)

**Data Flow:**
```
CreateOrderPayload
  ├─ customerName, customerEmail, customerPhone
  ├─ shippingAddress (nested) → flattened to shippingStreet, shippingCity, etc.
  ├─ payment (nested) → flattened to paymentMethod, paymentTransactionId, etc.
  └─ items: OrderItem[] → creates separate documents in order_items collection
```

**Convex Order Table:**

```typescript
orders: defineTable({
  // Customer info
  customerId: v.optional(v.id("users")), // If logged in
  customerName: v.string(),
  customerEmail: v.string(),
  customerPhone: v.optional(v.string()),
  customerAvatar: v.optional(v.string()),
  
  // Totals
  subtotal: v.float64(),
  tax: v.float64(),
  shippingCost: v.float64(),
  total: v.float64(),
  
  // Flattened shipping address (denormalized for performance)
  shippingStreet: v.string(),
  shippingApartment: v.optional(v.string()),
  shippingCity: v.string(),
  shippingPostalCode: v.string(),
  shippingCountry: v.string(),
  
  // Flattened payment info (denormalized for audit)
  paymentMethod: v.string(),
  paymentCardExpiry: v.optional(v.string()),
  paymentTransactionId: v.string(),
  paymentChargeDate: v.string(),
  
  // Order management
  status: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("cancelled"),
    v.literal("shipped")
  ),
  
  // Coupon tracking
  appliedCouponCode: v.optional(v.string()),
  appliedCouponDiscount: v.optional(v.float64()),
  
  createdAt: v.string(),
  updatedAt: v.string(),
})
  .index("by_customerEmail", ["customerEmail"])
  .index("by_customerId", ["customerId"])
  .index("by_status", ["status"]),

orderItems: defineTable({
  orderId: v.id("orders"),
  productId: v.id("products"),
  productName: v.string(),
  productImage: v.optional(v.string()),
  variant: v.optional(v.string()),
  quantity: v.int64(),
  price: v.float64(),
  total: v.float64(),
})
  .index("by_orderId", ["orderId"]),
```

### Coupon Schema

```typescript
coupons: defineTable({
  // Identity & status
  code: v.string(),
  status: v.union(
    v.literal("active"),
    v.literal("paused"),
    v.literal("expired"),
    v.literal("scheduled")
  ),
  description: v.optional(v.string()),
  
  // Discount type & value
  discountType: v.union(
    v.literal("percentage"),      // % off subtotal
    v.literal("fixed_amount"),    // ₪X off
    v.literal("free_shipping"),   // Free shipping
    v.literal("free_product"),    // Free item
    v.literal("buy_x_get_y")      // Buy quantity X, get Y free
  ),
  discountValue: v.float64(),
  
  // For buy_x_get_y type
  buyQuantity: v.optional(v.int64()),
  getQuantity: v.optional(v.int64()),
  
  // Validity & limits
  startDate: v.string(),          // ISO 8601
  endDate: v.optional(v.string()),
  minimumOrder: v.optional(v.float64()),
  maximumDiscount: v.optional(v.float64()),
  
  // Usage constraints
  usageLimit: v.optional(v.int64()),       // Global limit
  usageLimitPerUser: v.optional(v.int64()), // Per-user limit
  usageCount: v.int64(),                    // Current usage
  
  // Restrictions
  categoryIds: v.optional(v.array(v.string())),
  productIds: v.optional(v.array(v.string())),
  userIds: v.optional(v.array(v.string())),
  firstPurchaseOnly: v.optional(v.boolean()),
  excludeOtherCoupons: v.optional(v.boolean()),
  
  createdAt: v.string(),
  updatedAt: v.string(),
})
  .index("by_code", ["code"])
  .index("by_status", ["status"]),

couponUsage: defineTable({
  couponId: v.id("coupons"),
  couponCode: v.string(),
  userId: v.optional(v.id("users")),
  userEmail: v.string(),
  usageCount: v.int64(),
  lastUsedAt: v.optional(v.string()),
  createdAt: v.string(),
})
  .index("by_couponCode_userEmail", ["couponCode", "userEmail"]),
```

---

## 3. Coupon Validation Logic

### Current Implementation Location

**Files to replace:**
- `apps/storefront/services/api/couponsApi.ts:L20-280` (320 lines of validation logic)
  - `useLazyValidateCouponQuery()` hook
  - Client-side validation checks
  - Cloud function call: `useIncrementCouponUsageMutation()`

**Used in:**
- `apps/storefront/store/slices/cartSlice.ts:L442` (`useCouponFlow()` hook)
- `apps/storefront/components/checkout/OrderSummarySidebar.tsx` (validation UI)

### Validation Sequence

The coupon validation is implemented in [apps/storefront/services/api/couponsApi.ts](apps/storefront/services/api/couponsApi.ts) and must be moved to a server-side Convex action for security.

**Validation Flow:**

```
Input: { code, cartItems, subtotal, userEmail?, userId? }
    ↓
1. [Lookup] Find coupon by code (case-insensitive)
    ↓
2. [Status] Check coupon.status === 'active'
    ↓
3. [Date] Verify startDate ≤ now ≤ endDate
    ↓
4. [Global Usage] Verify usageCount < usageLimit
    ↓
5. [Per-User Usage] Query couponUsage table
    ↓
6. [Minimum Order] Verify subtotal ≥ minimumOrder
    ↓
7. [First Purchase] If firstPurchaseOnly, check user has no prior orders
    ↓
8. [User Restrictions] If userIds specified, verify userId in userIds
    ↓
9. [Product Restrictions] If productIds specified, verify cartItems match
    ↓
10. [Category Restrictions] If categoryIds specified, verify product categories
    ↓
11. [Calculate Discount] Apply discount type logic
    ↓
12. [Cap Discount] Apply maximumDiscount ceiling
    ↓
Output: { valid, coupon, discountAmount, error? }
```

### Discount Calculation Logic

```typescript
function calculateDiscount(
  coupon: Coupon,
  cartItems: CartItem[],
  subtotal: number
): number {
  let discount = 0;

  switch (coupon.discountType) {
    case 'percentage':
      discount = subtotal * (coupon.discountValue / 100);
      break;

    case 'fixed_amount':
      discount = coupon.discountValue;
      break;

    case 'free_shipping':
      discount = 29.90; // STANDARD_SHIPPING_COST
      break;

    case 'free_product':
      discount = coupon.discountValue;
      break;

    case 'buy_x_get_y':
      if (coupon.buyQuantity && coupon.getQuantity) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const sets = Math.floor(totalItems / (coupon.buyQuantity + coupon.getQuantity));
        const avgPrice = subtotal / totalItems;
        discount = sets * coupon.getQuantity * avgPrice;
      }
      break;
  }

  // Apply caps
  if (coupon.maximumDiscount) {
    discount = Math.min(discount, coupon.maximumDiscount);
  }
  
  // Never discount more than subtotal
  discount = Math.min(discount, subtotal);

  return Math.round(discount * 100) / 100; // Round to 2 decimals
}
```

### Convex Action Pattern

```typescript
// convex/coupons.ts
export const validateCoupon = action(async (ctx, input: ValidateCouponInput) => {
  const { code, cartItems, subtotal, userEmail, userId } = input;
  
  // Queries and validation logic here...
  
  return {
    valid: boolean,
    coupon?: Coupon,
    discountAmount?: number,
    error?: string,
  };
});

export const incrementCouponUsage = action(async (ctx, input: {
  couponCode: string;
  userEmail: string;
  userId?: string;
}) => {
  // Atomic increment of couponUsage.usageCount
});
```

### Frontend Hook Migration

**Before:**
```typescript
// apps/storefront/pages/CheckoutPage.tsx
const [validateCoupon] = useLazyValidateCouponQuery();
const result = await validateCoupon({ code, cartItems, subtotal }).unwrap();
```

**After:**
```typescript
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

const validateCoupon = useAction(api.coupons.validate);
const result = await validateCoupon({ code, cartItems, subtotal });
```
```

---

## 4. Hebrew Search & Localization

### Current Implementation

**File location:** `apps/storefront/services/api/productsApi.ts:L93-120` (28 lines)

The Appwrite implementation uses **client-side search** due to Appwrite's limitations with Hebrew text.

**Hook:** `useSearchProductsQuery(searchTerm)`

**Used in:**
- `apps/storefront/pages/ShopPage.tsx` (product listing with search)
- `apps/storefront/components/search/SearchBar.tsx` (autocomplete)

```typescript
// Current: Client-side filtering
const term = searchTerm.toLowerCase();
const filtered = response.documents.filter((doc: any) =>
  doc.productName?.toLowerCase().includes(term) ||
  doc.productNameHe?.includes(searchTerm) ||      // Hebrew support
  doc.description?.toLowerCase().includes(term) ||
  doc.descriptionHe?.includes(searchTerm) ||       // Hebrew support
  doc.sku?.toLowerCase().includes(term) ||
  doc.tags?.some((tag: string) => tag.toLowerCase().includes(term))
);
```

### Search Fields

The following fields require full-text search support:

**Hebrew Fields (Priority):**
- `productNameHe`
- `descriptionHe`
- `shortDescriptionHe`

**English Fields:**
- `productName`
- `description`
- `shortDescription`
- `sku`
- `tags[]`

### Convex Search Index Configuration

```typescript
// convex/schema.ts
products: defineTable({
  // ... other fields ...
})
  .searchIndex("search_productNameHe", {
    searchField: "productNameHe",
    filterFields: ["category", "wineType", "status", "onSale"],
  })
  .searchIndex("search_productName", {
    searchField: "productName",
    filterFields: ["category", "wineType", "status", "onSale"],
  })
```

### Search Behavior

**Current:** Substring matching (infix), supports both "search-as-you-type" and full-term search

**Recommended for Convex:**
- Use native search index for prefix + full-term matching
- For autocomplete/type-ahead: 2+ character minimum, server-side validation
- Convex handles Hebrew correctly with Unicode support

### Query Implementation

```typescript
// convex/products.ts
export const searchProducts = query(async (ctx, args: {
  term: string;
  category?: string;
  limit?: number;
}) => {
  if (args.term.length < 2) {
    return [];
  }

  // Search Hebrew field as priority
  const results = await ctx.db
    .query("products")
    .withSearchIndex("search_productNameHe", (q) =>
      q.search("productNameHe", args.term)
    )
    .filter((q) => {
      if (args.category) return q.eq(q.field("category"), args.category);
      return q.eq(q.field("status"), "active");
    })
    .take(args.limit ?? 20);

  return results;
});
```

---

## 5. File Storage Strategy

### Appwrite Storage Details

**Bucket:** `media` (ID: `VITE_APPWRITE_BUCKET_ID`)

**URL generation pattern:**
```typescript
// From: apps/admin/.cursor/rules/appwrite.mdc:L147
const url = storage.getFileView({
  bucketId: APPWRITE_CONFIG.BUCKET_MEDIA,
  fileId: file.$id  // e.g., "product_001.jpg"
});
// Returns: https://cloud.appwrite.io/v1/storage/buckets/{bucketId}/files/{fileId}/view?...
```

**Database references:**
- `products.featuredImage` → Full URL string
- `products.images[]` → Array of URL strings
- `orderItems.productImage` → Full URL string

### Current Pattern

Files are stored in Appwrite's storage bucket, but the **database stores full preview URLs**, not raw fileIds.

**Evidence from codebase:**
```typescript
// apps/admin/services/api/productsApi.ts
featuredImage: newProduct.featuredImage || null,

// apps/storefront/services/api/ordersApi.ts
productImage: item.productImage || null,
```

**URL Generation (Appwrite):**
```typescript
const url = storage.getFileView({
  bucketId: APPWRITE_CONFIG.BUCKET_MEDIA,
  fileId: file.$id
});
```

### Storage Options for Convex

Since you store URLs (not fileIds), you have maximum flexibility:

**Option A: Convex File Storage**
- Store binaries in Convex Storage API
- Database stores `storageId` references
- Generate public URLs on-the-fly
- **Pros:** Single source of truth, no CDN setup
- **Cons:** Requires Convex Pro plan for large files

```typescript
// Migration strategy
products: defineTable({
  featuredImageStorageId: v.optional(v.string()),
  // Generate URL via: storage.getUrl(storageId)
})
```

**Option B: External CDN (Recommended for E-commerce)**
- Migrate binaries to Cloudinary, S3, or similar
- Database stores CDN URLs directly (current pattern)
- **Pros:** Offloads bandwidth, faster delivery, transformation options
- **Cons:** Additional service dependency

```typescript
// Migration strategy
const NEW_CDN_BASE = "https://res.cloudinary.com/purcari/image/upload/";
// Update URLs during migration: newCdnUrl = generateCloudinaryUrl(oldFileId)
```

### File Size Considerations

- Wine product images: Typically 1-5MB
- Product catalog size: Estimate based on current inventory
- Archive binary files or use separate CDN bucket for old images

### Migration Approach

**Recommended: Option B + URL Rewrite**

1. Export all Appwrite files
2. Upload to Cloudinary/S3 with same naming scheme
3. Update database URLs to new CDN endpoints
4. Keep Appwrite URLs as fallback during rollover
5. Implement URL transformation in Convex (for dynamic sizing)

---

## 6. RTK Query Footprint

### Base API Architecture

**Package structure:**
```
packages/
├── shared-api/src/
│   ├── baseApi.ts          # ← Delete this entirely
│   └── index.ts
├── shared-services/src/
│   ├── appwrite.ts         # ← Delete (Convex replaces it)
│   └── index.ts
├── shared-types/src/       # ← Keep (reuse types)
└── shared-constants/src/   # ← Keep
```

**Current Implementation** ([packages/shared-api/src/baseApi.ts](packages/shared-api/src/baseApi.ts)):

```typescript
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),  // No HTTP layer
  tagTypes: [
    'Products', 'Categories', 'Cart', 'Orders', 'User', 'Users',
    'Search', 'Coupons', 'CartRules', 'Analytics', 'Notifications',
  ],
  endpoints: () => ({}),
});
```

**Key Point:** Uses `fakeBaseQuery()` for direct Appwrite SDK calls, not HTTP. Each endpoint calls Appwrite directly within the `queryFn`.

### API Slices to Replace

**Total RTK Query slices to replace:** 11 (admin) + 7 (storefront) = **18 slices**

**Files to delete:**
```
apps/admin/services/api/
  ├── authApi.ts            # 5 endpoints
  ├── productsApi.ts        # 4 endpoints
  ├── ordersApi.ts          # 5 endpoints
  ├── couponsApi.ts         # 6 endpoints
  ├── categoriesApi.ts      # 4 endpoints
  ├── usersApi.ts           # 4 endpoints
  ├── dashboardApi.ts       # 3 endpoints
  ├── analyticsApi.ts       # 2 endpoints
  ├── notificationsApi.ts   # 2 endpoints
  ├── cartRulesApi.ts       # 4 endpoints
  ├── searchApi.ts          # 1 endpoint
  └── index.ts              # Re-exports (delete)

apps/storefront/services/api/
  ├── authApi.ts            # 9 endpoints
  ├── productsApi.ts        # 5 endpoints
  ├── ordersApi.ts          # 4 endpoints
  ├── couponsApi.ts         # 2 endpoints
  ├── cartRulesApi.ts       # 1 endpoint
  ├── categoriesApi.ts      # 2 endpoints
  └── analyticsApi.ts       # 4 endpoints
```

#### Admin App: [apps/admin/services/api/index.ts](apps/admin/services/api/index.ts)

| Slice | Endpoints | Operation |
|-------|-----------|-----------|
| `authApi` | login, register, logout, getCurrentUser | Authentication |
| `productsApi` | getProducts, createProduct, updateProduct, deleteProduct | CRUD |
| `ordersApi` | getOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder | CRUD + status |
| `couponsApi` | getCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon, generateCouponCode | CRUD |
| `categoriesApi` | getCategories, createCategory, updateCategory, deleteCategory | CRUD |
| `usersApi` | getUsers, getUserById, updateUser, deleteUser | User management |
| `dashboardApi` | getDashboardStats, getRevenueData, getOrderStats | Analytics aggregations |
| `analyticsApi` | getAnalyticsEvents, getAnalyticsSummary | Event tracking |
| `notificationsApi` | getNotifications, markNotificationAsRead | Admin notifications |
| `cartRulesApi` | getCartRules, createCartRule, updateCartRule, deleteCartRule | Automatic rules |
| `searchApi` | search (global search across products/orders/users) | Full-text search |

#### Storefront App: [apps/storefront/services/api/]

| Slice | Endpoints | Operation |
|-------|-----------|-----------|
| `authApi` | register, login, logout, getCurrentUser, updateProfile, getUserPrefs, updateUserPrefs, updateAddress, requestPasswordReset, resetPassword | Auth + prefs |
| `productsApi` | getProducts, getProductsByCategory, getProductById, searchProducts, validateStockForCheckout | Product queries |
| `ordersApi` | createOrder, getOrders, getOrderById, getUserOrders | Order management |
| `couponsApi` | validateCoupon, incrementCouponUsage | Coupon validation |
| `cartRulesApi` | getActiveCartRules | Rule fetching |
| `categoriesApi` | getCategories, getCategoriesWithChildren | Category hierarchy |
| `analyticsApi` | trackPageView, trackProductView, trackAddToCart, trackCheckout | Event tracking |

### Cache Invalidation Strategy

**Current Pattern:** `providesTags` / `invalidatesTags`

```typescript
// When updating products, invalidate 'Products' tag
invalidatesTags: ['Products']

// Granular invalidation
invalidatesTags: (_result, _error, id) => [{ type: 'Orders', id }, 'Orders']
```

**No Optimistic Updates Found:** The codebase does NOT use `onQueryStarted` side effects for optimistic updates. All mutations use standard server-driven patterns.

### Special Cases

**Side Effects to Replicate:**

1. **Cart Persistence**
   ```typescript
   // Currently: Redux thunk updates localStorage + Appwrite prefs
   await account.updatePrefs({ ...currentPrefs, cart });
   ```
   → Migrate to: Convex mutation with localStorage sync in Redux middleware

2. **Coupon Increment**
   ```typescript
   // Currently: Cloud Function call
   await functions.createExecution(FUNCTION_INCREMENT_COUPON_USAGE, ...)
   ```
   → Migrate to: Convex action with atomic increment

3. **Order Validation**
   ```typescript
   // Currently: Client-side stock validation before submission
   validateStockForCheckout(cartItems)
   ```
   → Migrate to: Server action validation + atomic order creation

---

## 7. Migration Architecture Overview

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (React + Redux)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  RTK Query → Convex API Client (replace Appwrite)    │   │
│  └────────────────────┬─────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
   ┌──────────────┐          ┌──────────────┐
   │  Convex DB   │          │  Convex Auth │
   │              │          │              │
   │  Tables:     │          │  - Sessions  │
   │  - users     │          │  - Tokens    │
   │  - products  │          │  - Prefs     │
   │  - orders    │          └──────────────┘
   │  - coupons   │
   │  - etc.      │
   └──────────────┘

   ┌──────────────────────────────────────┐
   │  External Services (Optional)        │
   ├──────────────────────────────────────┤
   │  - CDN (Cloudinary/S3) for images     │
   │  - Payment gateway (kept as-is)      │
   │  - Email service (kept as-is)        │
   └──────────────────────────────────────┘
```

### Convex Directory Structure (Recommended)

```
convex/
├── schema.ts              # Schema definitions
├── auth.ts                # Authentication functions
├── users.ts               # User queries/mutations
├── products.ts            # Product catalog
├── orders.ts              # Orders + orderItems
├── coupons.ts             # Coupons + validation + usage tracking
├── categories.ts          # Categories
├── cartRules.ts           # Cart rules
├── analytics.ts           # Analytics events
├── notifications.ts       # Admin notifications
├── search.ts              # Search aggregation
├── utils/
│   ├── validation.ts      # Input validation
│   ├── pricing.ts         # Discount/tax calculations
│   └── errors.ts          # Error definitions
└── migrations/
    └── seed.ts            # Data seed/import script
```

### Tag Types Mapping

**RTK Query Tags → Convex Cache Invalidation:**

| Tag | Convex Approach |
|-----|-----------------|
| `Products` | Invalidate `products` table queries |
| `Orders` | Invalidate `orders` + `orderItems` queries |
| `Coupons` | Invalidate `coupons` + `couponUsage` queries |
| `User` | Invalidate `users` + `userAddresses` queries |
| `Cart` | Redux local state (no server cache) |
| `Search` | Direct query execution (no caching) |

---

## 8. Data Migration Execution Plan & Testing

### Pre-Migration Validation

**Step 1: Audit Appwrite Data Volume**
```bash
# Check data size before export
echo "Products:" && wc -l data/products.json
echo "Orders:" && wc -l data/orders.json
echo "Coupons:" && wc -l data/coupons.json
```

**Step 2: Create Backup**
```bash
# Keep copy of original Appwrite exports
cp -r data data.backup
git commit -am "Backup: Appwrite exports before Convex migration"
```

**Step 3: Dry-run Import**
```bash
# Test import logic on sample data
# Verify field mappings work correctly
# Check for data type mismatches
```

### Rollback Strategy

**If Convex migration fails:**
1. Keep Appwrite running in parallel for 1-2 weeks
2. Route traffic back to Appwrite via feature flag
3. Revert RTK Query hooks to Appwrite implementation
4. Restore from `data.backup/` if needed

**Convex deployment can be rolled back:**
- Convex provides automatic backups
- Use `convex dashboard` to restore database snapshots
- No data loss if schema migrations fail

## 8. Data Migration Execution Plan

### Phase 1: Schema Setup (Days 1-2)

**Checklist:**
- [ ] `npx convex dev` initialized
- [ ] `convex/schema.ts` deployed (all 9 tables)
- [ ] Field indexes created for common queries:
  - `products.by_category`, `by_status`, `by_sku`
  - `orders.by_customerEmail`, `by_customerId`, `by_status`
  - `coupons.by_code`, `by_status`
  - `userAddresses.by_userId`, `by_userId_default`
- [ ] Search indices created:
  - `search_he` (productNameHe)
  - `search_en` (productName)
- [ ] `convex/auth.ts` configured with Password provider
- [ ] `.env.local` updated with `VITE_CONVEX_URL`

**Verification:**
```bash
convex dashboard  # Verify schema in UI
```

### Phase 2: Core Mutations & Queries (Days 3-5)

**Create Convex functions:**
- [ ] `convex/users.ts` – 3 queries (current, list, get), 2 mutations (update, setRole)
- [ ] `convex/addresses.ts` – 3 queries (list, get), 3 mutations (add, update, remove)
- [ ] `convex/products.ts` – 4 queries (list, get, search, byCategory), 3 mutations (create, update, delete)
- [ ] `convex/categories.ts` – 2 queries (list, get), 2 mutations (create, update)
- [ ] `convex/orders.ts` – 3 queries (list, getById, byCustomer), 2 mutations (create, updateStatus)
- [ ] `convex/orderItems.ts` – 1 query (byorder), 1 mutation (create)
- [ ] `convex/coupons.ts` – 3 queries, 3 mutations + 2 actions (validate, increment usage)

**Test each function:**
```bash
convex test convex/users.ts
convex test convex/products.ts
```

### Phase 3: RTK Query Replacement (Days 6-10)

**Per-app migration:**

**Storefront (`apps/storefront/`):**
- [ ] Update `index.tsx` → Replace `<ApiProvider>` with `<ConvexAuthProvider>`
- [ ] Update `store/index.ts` → Remove `api.reducer` + `api.middleware`
- [ ] Replace imports in `services/api/` → Use `useQuery(api.*)` and `useMutation(api.*)`
- [ ] Update hooks in pages:
  - `ShopPage.tsx`: `useGetProductsQuery()` → `useQuery(api.products.list)`
  - `ProductPage.tsx`: `useGetProductByIdQuery()` → `useQuery(api.products.get)`
  - `CheckoutPage.tsx`: `useCreateOrderMutation()` → `useMutation(api.orders.create)`
  - `DashboardPage.tsx`: `useGetUserPrefsQuery()` → `useQuery(api.users.current)`

**Admin (`apps/admin/`):**
- [ ] Update `App.tsx` → Replace RTK provider setup
- [ ] Update store configuration (auth middleware)
- [ ] Replace all API endpoints in pages/components

**Parallel testing:**
```bash
pnpm dev:storefront  # Test each page as you migrate
pnpm dev:admin       # Test admin dashboard
```

### Phase 4: Side Effects & Business Logic (Days 11-13)

**Complex logic migration:**
- [ ] **Coupon validation** (`convex/coupons.ts`)
  - Implement full 12-step validation sequence
  - Create `incrementCouponUsage` action (atomic counter)
  - Test with edge cases: expired, usage limits, first-purchase-only

- [ ] **Transactional order creation** (`convex/orders.ts`)
  - Stock validation → Order insert → OrderItems insert → Stock decrement
  - Convex auto-rolls back if any step fails
  - Coupon increment on order success

- [ ] **Cart persistence** (optional)
  - If cross-device persistence needed: Create `convex/cart.ts` mutation
  - Otherwise: Keep localStorage only, no Convex sync

**Integration tests:**
```typescript
// Test: Valid coupon applies discount
const result = await validateCoupon({ code: 'SUMMER20', subtotal: 500 });
assert(result.valid === true);
assert(result.discountAmount === 100);

// Test: Order creation decrements stock
const order = await createOrder({ items: [...], ... });
const product = await getProduct(order.items[0].productId);
assert(product.quantityInStock < originalQty);
```

### Phase 5: Testing & Cutover (Days 14-18)

**Testing checklist:**
- [ ] **Unit tests** for all Convex functions
  ```bash
  pnpm test:convex
  ```
- [ ] **E2E tests** (critical user flows)
  - Register → Login → Browse products → Add to cart → Apply coupon → Checkout
  - Admin: Login → Create product → Create coupon → View orders
- [ ] **Data validation** (Appwrite vs. Convex)
  ```bash
  # Compare row counts
  SELECT COUNT(*) FROM products  -- Appwrite
  # vs.
  convex dashboard  -- Convex table stats
  ```
- [ ] **Load testing** (simulate 100+ concurrent users)
  ```bash
  k6 run scripts/load-test.js
  ```
- [ ] **RTL + Hebrew search** verification
  - Search for Hebrew product names
  - Verify search-as-you-type works
- [ ] **Admin role protection**
  - Non-admin cannot access `/admin` routes
  - Admin-only mutations reject non-admins

**Cutover steps:**
1. Deploy Convex to production
2. Update DNS/deployment to point to storefront + admin (now using Convex)
3. Monitor logs for errors (24 hours)
4. Keep Appwrite running as fallback for 1 week
5. After 1 week: Decommission Appwrite

**Monitoring post-go-live:**
- [ ] Error rates < 0.1%
- [ ] API response times < 200ms
- [ ] Search results return in < 500ms
- [ ] Order creation succeeds 99.9%
- [ ] No auth failures

---

## Troubleshooting & Common Issues

### Issue: "User not authenticated" after login
**Cause:** Session not persisted or auth context not configured  
**Solution:**
```typescript
// Ensure ConvexAuthProvider wraps entire app
<ConvexAuthProvider client={convex}>
  <YourApp />
</ConvexAuthProvider>
```

### Issue: Search returns no results for Hebrew text
**Cause:** Search index not built or field name mismatch  
**Solution:**
```bash
convex dashboard  # Check if search_he index shows "Ready"
# Verify schema has searchIndex("search_he", { searchField: "productNameHe" })
```

### Issue: Order creation rolls back unexpectedly
**Cause:** Stock validation failing or product not found  
**Solution:**
Add detailed error logging:
```typescript
try {
  const product = await ctx.db.get(productId);
  if (!product) throw new Error(`Product ${productId} not found`);
  if (product.quantityInStock < quantity) {
    throw new Error(`Insufficient stock: ${product.quantityInStock} < ${quantity}`);
  }
} catch (err) {
  console.error('[OrderCreation] Validation failed:', err);
  throw err;
}
```

### Issue: Images return 404 after migration
**Cause:** Appwrite URLs no longer valid  
**Solution:**
If migrating to CDN, update URLs during seed:
```typescript
const mapImageUrl = (appwriteUrl: string) => {
  const fileId = appwriteUrl.split('/').pop();
  return `https://cdn.purcari.com/products/${fileId}`;
};
```

### Issue: Performance degradation after cutover
**Cause:** Missing indexes on frequently queried fields  
**Solution:**
Add indexes to schema:
```typescript
orders: defineTable({
  // ...
})
  .index("by_customerEmail", ["customerEmail"])
  .index("by_customerId", ["customerId"])
  .index("by_status", ["status"])
```

---

## Appendix: Key Type Mappings

### Appwrite → Convex Type Conversions

| Appwrite | Convex | Notes |
|----------|--------|-------|
| `string` | `v.string()` | Default |
| `integer` | `v.int64()` | 64-bit integers |
| `float` | `v.float64()` | High precision |
| `boolean` | `v.boolean()` | True/false |
| `datetime` | `v.string()` | ISO 8601 format |
| `json` | `v.any()` | Use sparingly; prefer typed objects |
| `array` | `v.array(v.string())` | Typed arrays |
| `relationship` | `v.id("tableName")` | Foreign key references |
| `$id`, `$createdAt` | Fields in Convex | `_id` auto-generated, add createdAt explicitly |

### Hebrew Text Handling

Convex handles UTF-8 natively, so Hebrew text in both database and search works without special configuration.

**Best Practice:**
- Store both English and Hebrew versions (`productName` + `productNameHe`)
- Create separate search indexes for each language
- Use language preference in frontend to determine which field to display

---

## Next Steps - Quick Start

### Day 1: Initialize
```bash
# 1. Create Convex project
cd /path/to/purcari-israel
npx convex dev

# 2. Install dependencies
pnpm add convex @convex-dev/auth

# 3. Set environment
echo 'VITE_CONVEX_URL=https://your-project.convex.cloud' >> .env.local

# 4. Export Appwrite data
sh scripts/export-appwrite.sh
```

### Days 2-3: Schema & Auth
```bash
# 1. Create schema.ts (copy from brief)
touch convex/schema.ts

# 2. Set up auth
touch convex/auth.ts

# 3. Deploy
convex deploy
```

### Days 4-10: Functions & Frontend
```bash
# 1. Create function files
touch convex/{users,products,orders,coupons,categories,addresses}.ts

# 2. Test functions
pnpm convex test convex/products.ts

# 3. Replace RTK Query hooks in app
# (Follow migration examples in this brief)

# 4. Test locally
pnpm dev:storefront
pnpm dev:admin
```

### Days 11-18: Integration & Cutover
```bash
# 1. Run integration tests
pnpm test:e2e

# 2. Load test
k6 run scripts/load-test.js

# 3. Deploy to production
convex deploy --prod

# 4. Monitor
convex dashboard  # Check metrics
```

### Reference Files from Brief
- **Schema:** Section 2 (E-commerce Schema Specifics)
- **Auth:** Section 1 (Auth & User Preferences)
- **Coupons:** Section 3 (Coupon Validation Logic)
- **Search:** Section 4 (Hebrew Search & Localization)
- **Hooks:** Section 6 (RTK Query Footprint) + migration examples

### Key Documentation
- [Convex Docs](https://docs.convex.dev)
- [@convex-dev/auth Reference](https://docs.convex.dev/auth/getting-started)
- [Convex CLI Commands](https://docs.convex.dev/cli)

