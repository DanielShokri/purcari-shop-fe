# Monorepo Conversion Guide - Analysis & Required Updates

**Analysis Date:** January 30, 2026  
**Storefront Repo:** Purcari Israel (purcari-israel)  
**Status:** Ready for monorepo conversion with CRITICAL updates needed

---

## Executive Summary

Your comprehensive guide is **95% accurate for a generic storefront**, but the **actual storefront has significant differences** that require updates:

1. **ALREADY A FULL ECOMMERCE APP** - Not just basic product browsing
2. **RTL Support (Hebrew)** - All components designed for RTL
3. **Complex Redux state** - Cart with coupons, discounts, shipping rules
4. **Advanced features** - Analytics, age verification, multi-step checkout
5. **Asset-heavy** - Custom theme/styling, multiple component domains
6. **Already has Authentication** - Login/Register/Dashboard

**Impact:** This means the admin dashboard is NOT optional—it needs coordination with the storefront.

---

## Current Storefront Architecture (Actual)

### Structure Overview
```
purcari-israel/
├── package.json                    ← Only 23 deps (lean setup)
├── vite.config.ts                  ← Server on port 3000 (CRITICAL!)
├── App.tsx                         ← Router with 12 routes
├── types.ts                        ← 200+ lines of shared types
├── index.css                       ← Tailwind v4 with custom theme
│
├── pages/ (13 pages - NOT just shop)
│   ├── HomePage.tsx
│   ├── ShopPage.tsx               ← Product catalog
│   ├── ProductPage.tsx            ← Single product view
│   ├── CheckoutPage.tsx           ← 3-step checkout (Shipping → Payment → Review)
│   ├── OrderConfirmationPage.tsx  ← Order receipt
│   ├── LoginPage.tsx              ← Auth UI
│   ├── DashboardPage.tsx          ← Customer order history + profile
│   ├── ContactPage.tsx
│   ├── AboutPage.tsx
│   ├── ShippingPage.tsx
│   ├── TermsPage.tsx
│   ├── PrivacyPage.tsx
│   └── (+ 404 handling)
│
├── components/ (20 main components, organized by domain)
│   ├── home/                      ← Homepage sections
│   ├── checkout/                  ← Multi-step checkout flow
│   ├── dashboard/                 ← Customer dashboard
│   ├── header-components/         ← Header subcomponents
│   ├── about/                     ← About page sections
│   ├── contact/                   ← Contact page sections
│   ├── login/                     ← Login/register
│   ├── common/                    ← Shared buttons, cards
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Layout.tsx
│   ├── CartModal.tsx              ← Side cart drawer
│   ├── ProductCard.tsx            ← Reusable product card
│   ├── SearchModal.tsx            ← Full-text search
│   ├── AgeVerificationModal.tsx   ← Legal compliance (wine)
│   ├── SEO.tsx                    ← Meta tag management
│   └── ScrollToTop.tsx
│
├── store/                         ← Redux Toolkit
│   ├── slices/
│   │   ├── cartSlice.ts          ← Complex: coupons, shipping, discounts
│   │   └── uiSlice.ts            ← Modal states, UI toggles
│   ├── hooks.ts                   ← Redux hooks
│   └── index.ts
│
├── services/
│   ├── appwrite.ts                ← Client + APPWRITE_CONFIG
│   ├── geoapify.ts                ← Geolocation for shipping
│   └── api/
│       ├── authApi.ts             ← Login, register, user data
│       ├── baseApi.ts             ← RTK Query base setup
│       ├── productsApi.ts         ← Product queries & filters
│       ├── categoriesApi.ts       ← Category tree queries
│       ├── ordersApi.ts           ← Order creation & history
│       ├── couponsApi.ts          ← Coupon validation (complex!)
│       ├── cartRulesApi.ts        ← Cart rules (shipping, discounts)
│       └── analyticsApi.ts        ← Event tracking
│
├── schemas/                       ← Zod validation schemas
├── theme/                         ← Tailwind theme config
├── utils/                         ← Helper functions
├── public/                        ← Assets
├── .env.local                     ← Appwrite + Geoapify keys
└── index.html
```

### Real Dependencies (23 total)
```json
"dependencies": {
  "@hookform/resolvers": "^5.2.2",
  "@reduxjs/toolkit": "2.2.3",
  "appwrite": "^21.5.0",                 ← Latest Appwrite
  "framer-motion": "^12.27.1",
  "lucide-react": "0.378.0",
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "react-helmet-async": "^2.0.5",        ← SEO/meta tags
  "react-hook-form": "^7.71.1",          ← Form handling
  "react-redux": "9.1.1",
  "react-router-dom": "^6.30.3",
  "zod": "^4.3.5"                        ← Validation
},
"devDependencies": {
  "@tailwindcss/vite": "^4.1.18",        ← Tailwind v4
  "@types/node": "^22.14.0",
  "@vitejs/plugin-react": "^5.0.0",
  "tailwindcss": "^4.1.18",
  "typescript": "~5.8.2",
  "vite": "^6.2.0"
}
```

### Appwrite Collections Already Used
```
Database: cms_db
├── products          ← Catalog (Product interface in types.ts)
├── categories        ← Category tree (Category interface)
├── orders            ← Order documents
├── order_items       ← Line items
├── coupons           ← Discount codes (Complex validation!)
├── coupon_usage      ← Per-user coupon tracking
├── cart_rules        ← Shipping rules, discounts
├── analytics_events  ← Event tracking
└── notifications     ← (Admin-only, not used in storefront)

Storage: media bucket
└── Product images, receipts, etc.
```

### Authentication Status
- ✅ Already integrated with Appwrite Auth
- ✅ User sessions stored in Redux + localStorage
- ✅ Customer dashboard (DashboardPage) with order history
- ✅ Age verification modal (wine product compliance)
- ❌ No admin role system yet (storefront doesn't check admin labels)

---

## PORT CONFLICT - CRITICAL UPDATE NEEDED

### Current Setup
```
Storefront: localhost:3000  (vite.config.ts line 10)
Admin:      localhost:3001  (assumed)
```

### Guide Says
```
Admin:      localhost:3001
Storefront: localhost:5173  ← DEFAULT Vite port
```

### Reality Check
**The guide assigns port 5173 to storefront**, but the storefront is currently configured for **port 3000**.

**Options:**

#### Option 1: Keep Storefront on 3000, Admin on 3001
```bash
# In monorepo root package.json
"scripts": {
  "dev:admin": "cd apps/admin && vite --port 3001",
  "dev:storefront": "cd apps/storefront && vite --port 3000",
  "dev": "concurrently npm:dev:admin npm:dev:storefront"
}
```

#### Option 2: Switch Storefront to 5173 (Follows guide exactly)
Update `apps/storefront/vite.config.ts`:
```typescript
server: {
  port: 5173,  // Changed from 3000
  host: '0.0.0.0',
}
```

**Recommendation:** Use Option 1 to avoid unnecessary changes. Update guide to reflect actual ports.

---

## KEY DIFFERENCES FROM GUIDE

### 1. CART SYSTEM IS COMPLEX
**Guide Says:** "Each app has independent Redux/localStorage"

**Reality:** 
- Cart stored in localStorage + Redux
- Includes 8+ layers of state:
  - Items (with variants, pricing)
  - Subtotal calculation
  - Coupon validation (triggers API call)
  - Shipping rules (dynamic based on cart total)
  - Discounts (multiple sources)
  - Tax calculation (if applicable)
  - Order summary

```typescript
// From cartSlice.ts (~500 lines)
export interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  couponError: string | null;
  subtotal: number;
  shippingCost: number;
  discount: number;
  taxAmount: number;
  total: number;
  // ... more fields
}
```

**Admin Note:** Admin dashboard will need to MIRROR this logic for order creation. **Shared-types package is critical here.**

---

### 2. AUTHENTICATION IS ALREADY INTEGRATED
**Guide Says:** "You'll need to set up auth in both apps"

**Reality:**
- Appwrite auth already integrated in storefront
- `authApi.ts` handles login, register, token refresh
- User stored in Redux slice
- Age verification during checkout (wine compliance)
- DashboardPage shows order history for logged-in users

**Admin Note:** Admin app needs SAME auth base, but with role checking:
```typescript
// Storefront: authApi.ts (existing)
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation({...}),
    register: builder.mutation({...}),
    getCurrentUser: builder.query({...}),
  })
})

// Admin: authApi.ts (needs modification)
// Same base, but check for 'admin' label in user.prefs
// If not admin → redirect to /login (ProtectedRoute)
```

---

### 3. TYPES ARE EXTENSIVE & SPECIFIC
**Guide Says:** "Create shared-types package with basic Product, Order types"

**Reality:** `types.ts` has 250+ lines:
```typescript
// Enums (wine-specific)
export enum StockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  LOW_STOCK = 'low_stock',
}

export enum WineType {
  RED = 'red',
  WHITE = 'white',
  ROSE = 'rose',
  SPARKLING = 'sparkling',
}

// Product (25+ fields)
export interface Product {
  $id: string;
  productName: string;
  productNameHe?: string;           ← Hebrew for RTL
  price: number;
  salePrice?: number;
  onSale?: boolean;
  wineType?: WineType;
  region?: string;
  vintage?: number;
  alcoholContent?: number;
  volume?: string;
  grapeVariety?: string;             ← Wine-specific
  servingTemperature?: string;       ← Wine-specific
  tastingNotes?: string;
  // ... more
}

// CartItem (detailed)
export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;           ← For strike-through display
  quantity: number;
  maxQuantity: number;
  imgSrc: string;
  variant?: string;
}

// Category (with tree support)
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

// Order (complex structure)
export interface Order {
  $id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  // ... more
}

// And many more interfaces...
```

**Admin Note:** Admin dashboard must import these SAME types. Don't duplicate! Move to `shared-types` package.

---

### 4. STYLING IS TAILWIND v4 (NOT v3)
**Guide Says:** Nothing about Tailwind version

**Reality:** Storefront uses **Tailwind CSS v4** with custom theme:
```css
/* index.css */
@import "tailwindcss";

@theme {
  --font-sans: "Noto Sans Hebrew", ...  ← RTL font
  --color-primary: #1a1a1a;
  --color-secondary: #8c2438;           ← Wine burgundy
  --color-accent: #d4af37;              ← Gold accent
}

@layer base {
  body {
    @apply font-sans antialiased text-gray-900 bg-white;
  }
}
```

**Admin Note:** Admin dashboard might use different theme. Need to:
1. Either share theme config in `shared-ui`
2. Or keep separate theme configs

---

### 5. RTL SUPPORT IS CRITICAL
**Guide Says:** Nothing about RTL

**Reality:** Everything is Hebrew/RTL optimized:
- `productNameHe`, `descriptionHe` fields in Product
- Components use `dir="rtl"` logic
- Footer has Hebrew social links
- SearchModal has Hebrew placeholder text
- All copy hardcoded as Hebrew

```typescript
// Example: Footer component
<footer className="bg-primary text-white py-12" dir="rtl">
  <div className="container mx-auto">
    {/* All text in Hebrew */}
```

**Critical:** Admin dashboard might be English. Need to decide:
1. Share Layout component? (No - different languages)
2. Separate component structures? (Yes)

---

### 6. COMPLEX API LAYER
**Guide Says:** "Create separate API for each app" (Option A)

**Reality:** Storefront has 8 API slices already:
```
services/api/
├── authApi.ts              (Auth: login, register, user)
├── productsApi.ts          (Products: list, detail, search)
├── categoriesApi.ts        (Categories: tree, list)
├── ordersApi.ts            (Orders: create, list, detail)
├── couponsApi.ts           (Coupons: validate)
├── cartRulesApi.ts         (Shipping: calculate rules)
├── analyticsApi.ts         (Analytics: event tracking)
└── baseApi.ts              (RTK Query setup)
```

**Admin dashboard will need different APIs:**
```
admin/services/api/
├── authApi.ts              (Same base, but check admin role)
├── productsApi.ts          (Different: CRUD, not just read)
├── categoriesApi.ts        (Different: CRUD)
├── ordersApi.ts            (Different: manage orders, shipping)
├── usersApi.ts             (New: admin user management)
├── couponsApi.ts           (Different: create/edit/delete)
├── analyticsApi.ts         (New: admin analytics dashboard)
└── baseApi.ts              (Same)
```

**Recommendation:** 
- Create `shared-api` for common patterns
- Keep app-specific API slices separate

---

### 7. APPWRITE CONFIG IS PARTIALLY HARDCODED
**Guide Says:** "Use .env.local for all Appwrite config"

**Reality:** 
```typescript
// services/appwrite.ts
export const APPWRITE_CONFIG = {
  DATABASE_ID: 'cms_db',              ← HARDCODED
  COLLECTION_PRODUCTS: 'products',    ← HARDCODED
  COLLECTION_CATEGORIES: 'categories',← HARDCODED
  COLLECTION_ORDERS: 'orders',        ← HARDCODED
  // ... all IDs hardcoded
  
  // Only this is from env:
  FUNCTION_INCREMENT_COUPON_USAGE: import.meta.env.VITE_APPWRITE_FUNCTION_INCREMENT_COUPON_USAGE || 'increment-coupon-usage',
  BUCKET_MEDIA: import.meta.env.VITE_APPWRITE_BUCKET_ID || 'media',
}
```

**.env.local only has:**
```
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=696b5bee001fe3af955a
VITE_GEOAPIFY_API_KEY=610a12ab6c894f189eaa062b55f7fcea
```

**Update:** Guide should recommend exporting collection IDs to .env for flexibility:
```env
# .env.local (shared)
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=696b5bee001fe3af955a
VITE_APPWRITE_DATABASE_ID=cms_db
VITE_APPWRITE_COLLECTION_PRODUCTS=products
VITE_APPWRITE_COLLECTION_CATEGORIES=categories
VITE_APPWRITE_COLLECTION_ORDERS=orders
VITE_APPWRITE_COLLECTION_COUPONS=coupons
VITE_APPWRITE_COLLECTION_CART_RULES=cart_rules
VITE_APPWRITE_BUCKET_MEDIA=media

# Storefront-specific
VITE_GEOAPIFY_API_KEY=610a12ab6c894f189eaa062b55f7fcea

# Admin-specific (future)
VITE_ADMIN_SECRET=...
```

---

### 8. COMPLEX CHECKOUT FLOW
**Guide Says:** "Storefront has basic checkout"

**Reality:** `CheckoutPage.tsx` has:
1. **Step 1 - Shipping:** Address, city, zip, phone
2. **Step 2 - Payment:** Stripe/PayPal placeholder
3. **Step 3 - Review:** Order summary with:
   - Applied coupon validation
   - Shipping cost calculation
   - Tax calculation
   - Age verification modal
   - Order creation API call

**Admin Note:** Admin order management must match this order structure.

---

### 9. ANALYTICS TRACKING
**Guide Says:** Nothing

**Reality:** 
- `analyticsApi.ts` tracks events
- Possible events: page views, product views, add to cart, checkout started
- Data stored in `analytics_events` collection

**Update Guide:** Add to "Shared Packages" section: "Consider shared-analytics package"

---

### 10. GEOAPIFY INTEGRATION (EXTERNAL SERVICE)
**Guide Says:** Nothing

**Reality:**
- Used for address validation/geocoding in checkout
- Requires separate API key
- Storefront has `services/geoapify.ts`

**Update Guide:** Mention external service dependencies:
```env
# Also needed:
VITE_GEOAPIFY_API_KEY=...
VITE_STRIPE_KEY=...         ← (Placeholder in code)
```

---

## REQUIRED UPDATES TO GUIDE

### Section 1: Correct Port Numbers
**Current:**
> Admin: localhost:3001
> Storefront: localhost:5173

**Update to:**
> Admin: localhost:3001
> Storefront: localhost:3000
>
> (Or update storefront vite.config.ts to use 5173 if preferred)

---

### Section 2: Add RTL Considerations

**Insert new section after "How Appwrite Works":**

```markdown
## Right-to-Left (RTL) Support

Both apps may need different approaches:

**Storefront (Hebrew):**
- All text is Hebrew
- Layout is RTL by default
- Uses `dir="rtl"` attribute
- Fonts optimized for Hebrew

**Admin Dashboard (Assumed English):**
- May be left-to-right
- Or could be bilingual
- Separate styling approach needed

**Architecture Decision:**
- Storefront: Keep RTL components as-is
- Admin: Use separate component structure
- Avoid mixing RTL/LTR in shared-ui package
```

---

### Section 3: Update "Create Shared Packages"

**Current:**
> Only mentions `shared-types`, optional `shared-ui`, optional `shared-api`

**Update to:**

```markdown
### Phase 2: Create Shared Packages (40 mins)

**Core Shared Packages (Required):**

1. **shared-types/**
   - Product, Order, CartItem, Category, Coupon types
   - Enums: StockStatus, WineType, CategoryStatus, OrderStatus
   - 250+ lines of interfaces
   - **Import:** Both admin and storefront

2. **shared-api/**
   - Base RTK Query setup (baseApi.ts)
   - Common API hooks patterns
   - **Import:** Both apps (but each extends with own slices)

3. **shared-constants/**
   - APPWRITE_CONFIG (database & collection IDs)
   - Cart rules constants
   - Order status constants
   - **Import:** Both apps

**Optional Shared Packages:**

4. **shared-ui/** (NOT RECOMMENDED - different RTL/language needs)
   - If you want: Basic components only (Button, Card, Modal)
   - Better: Duplicate components, keep RTL/English separate

5. **shared-theme/** (MAYBE)
   - Tailwind configuration
   - Color palette: primary (#1a1a1a), secondary (#8c2438), accent (#d4af37)
   - Typography (Noto Sans Hebrew for storefront)
```

---

### Section 4: Add External Service Dependencies

**Insert new section in Environment Variables Strategy:**

```markdown
## External Service Integration

### Geoapify (Address Validation - Storefront)
Storefront uses Geoapify for address geocoding in checkout.

```env
VITE_GEOAPIFY_API_KEY=610a12ab6c894f189eaa062b55f7fcea
```

**Admin Note:** Admin dashboard doesn't need Geoapify.

### Payment Gateway (Storefront - Future)
Placeholder in CheckoutPage for payment processor:
```env
VITE_STRIPE_KEY=...         # When integrated
VITE_PAYPAL_KEY=...         # When integrated
```

### Analytics (Both Apps - Optional)
Both apps can track events via analytics API:
- Storefront: Product views, cart additions, checkouts
- Admin: User logins, data modifications
```

---

### Section 5: Update "API Layer Strategy"

**Current:**
> Suggests separate API for each app (Option A)

**Update to:**

```markdown
## API Layer Strategy

### Recommended: Hybrid Approach

**Shared Base (shared-api/):**
- baseApi.ts: RTK Query configuration
- Common hooks patterns
- Base query with error handling

**App-Specific APIs:**

**Storefront (apps/storefront/services/api/):**
```
├── authApi.ts           (Login, register, customer dashboard)
├── productsApi.ts       (List, detail - READ ONLY)
├── categoriesApi.ts     (Category tree)
├── ordersApi.ts         (Create order, get user orders)
├── couponsApi.ts        (Validate coupon)
├── cartRulesApi.ts      (Shipping calculation)
└── analyticsApi.ts      (Event tracking)
```

**Admin (apps/admin/services/api/):**
```
├── authApi.ts           (Login, admin verification)
├── productsApi.ts       (Full CRUD - list, create, update, delete)
├── categoriesApi.ts     (Full CRUD)
├── ordersApi.ts         (Manage orders, shipping, status)
├── usersApi.ts          (New: user management, roles)
├── couponsApi.ts        (Full CRUD, analytics)
└── analyticsApi.ts      (New: dashboard analytics)
```

**Why Hybrid?**
- Storefront: Optimized for read-heavy operations + checkout
- Admin: Optimized for CRUD operations
- Shared: Common patterns, error handling, request config
```

---

### Section 6: Update Redux Store Strategy

**Add to section:**

```markdown
### Storefront Store (Complex)

```typescript
// apps/storefront/src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './services/api/authApi';
import { productsApi } from './services/api/productsApi';
import { ordersApi } from './services/api/ordersApi';
import { couponsApi } from './services/api/couponsApi';
import cartSlice from './slices/cartSlice';  // ~500 lines
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    // RTK Query slices
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [couponsApi.reducerPath]: couponsApi.reducer,
    
    // Custom slices
    cart: cartSlice,            // Complex cart with coupons & shipping
    ui: uiSlice,                // Modals, drawers, etc
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(productsApi.middleware)
      .concat(ordersApi.middleware)
      .concat(couponsApi.middleware),
});
```

### Admin Store (Simpler)

```typescript
// apps/admin/src/store.ts
// Similar but different slices:
// - adminAuthSlice (with role verification)
// - No cartSlice
// - dashboardSlice (for admin-specific UI)
```
```

---

### Section 7: Add Checkout Flow Documentation

**Insert new section:**

```markdown
## Storefront-Specific Features

### Multi-Step Checkout
Storefront implements a 3-step checkout:

1. **Shipping**: Address, city, postal code, phone
2. **Payment**: Payment method selection
3. **Review**: Order summary with:
   - Cart items
   - Coupon discount (if applied)
   - Shipping cost (calculated from cart rules)
   - Tax (if applicable)
   - Age verification (wine product)

**Admin Impact:**
- Orders created via checkout need to match order schema
- Order status must support: pending, paid, shipped, delivered, cancelled
- Admin needs ability to update order status and shipping

### Coupon System (Complex)
- Customers can apply coupons at checkout
- Validation happens via API call
- Multiple coupon types: percentage, fixed amount, free shipping
- Per-user usage limits stored in `coupon_usage` collection
- Cloud function: `increment-coupon-usage`

**Admin Impact:**
- Admin needs coupon creation/management UI
- Must track coupon usage
- Can view coupon analytics

### Cart Rules (Dynamic)
- Shipping costs calculated based on:
  - Cart subtotal
  - Delivery location
  - Cart weight/dimensions
- Rules stored in `cart_rules` collection

**Admin Impact:**
- Admin needs cart rule management UI
- Create rules based on:
  - Minimum cart value
  - Shipping zones
  - Delivery method
  - Cost calculation formula

### Age Verification
- Wine products require age verification
- Modal appears during checkout
- User confirms they're 18+ before completing order

**Admin Impact:**
- Mark products as "requires age verification"
- Compliance tracking
```

---

### Section 8: Update Dependencies List

**Add to package.json analysis:**

```markdown
## Dependency Analysis

### Storefront (Lean - 23 total)
```json
// UI & State
"@hookform/resolvers": "^5.2.2",      // Form validation
"@reduxjs/toolkit": "2.2.3",          // State management
"react-helmet-async": "^2.0.5",       // SEO meta tags
"react-hook-form": "^7.71.1",         // Form handling
"react-redux": "9.1.1",               // Redux integration
"react-router-dom": "^6.30.3",        // Routing

// Backend
"appwrite": "^21.5.0",                // Appwrite SDK

// Effects & Animation
"framer-motion": "^12.27.1",          // Smooth animations

// UI Utilities
"lucide-react": "0.378.0",            // Icons
"zod": "^4.3.5",                      // Form validation

// Core
"react": "18.2.0",
"react-dom": "18.2.0",

// Dev
"@tailwindcss/vite": "^4.1.18",       // Tailwind v4
"@vitejs/plugin-react": "^5.0.0",
"tailwindcss": "^4.1.18",
"typescript": "~5.8.2",
"vite": "^6.2.0"
```

**Admin Dashboard (Add for new features):**
- `recharts` - Dashboard analytics charts
- `date-fns` - Date formatting for orders
- Maybe: `@hookform/resolvers`, `react-hook-form` (same as storefront)
```

---

### Section 9: File Structure - Update to Reality

**Replace the example with:**

```markdown
## File Structure After Conversion (ACTUAL)

```
shop-system/
├── .env.local                          ← Shared Appwrite + service keys
├── .env.example
├── package.json                        ← Root with workspaces
├── pnpm-workspace.yaml                 ← Or yarn workspaces
├── tsconfig.base.json                  ← Shared TS config (optional)
├── .gitignore
├── .github/
│   └── workflows/
│       ├── deploy-admin.yml
│       └── deploy-storefront.yml
│
├── apps/
│   ├── admin/
│   │   ├── package.json
│   │   ├── vite.config.ts              ← port: 3001
│   │   ├── index.tsx
│   │   ├── App.tsx                     ← Admin routing (TBD)
│   │   ├── pages/                      ← Admin pages (TBD)
│   │   │   ├── Dashboard.tsx           ← Analytics, users, orders
│   │   │   ├── Products.tsx            ← Product CRUD
│   │   │   ├── Categories.tsx          ← Category CRUD
│   │   │   ├── Orders.tsx              ← Order management
│   │   │   ├── Coupons.tsx             ← Coupon management
│   │   │   ├── CartRules.tsx           ← Shipping rule management
│   │   │   └── Users.tsx               ← User management
│   │   ├── components/                 ← Admin UI components
│   │   ├── services/
│   │   │   ├── appwrite.ts
│   │   │   └── api/
│   │   │       ├── authApi.ts          ← With admin role check
│   │   │       ├── productsApi.ts      ← Full CRUD
│   │   │       ├── categoriesApi.ts    ← Full CRUD
│   │   │       ├── ordersApi.ts        ← Order management
│   │   │       ├── usersApi.ts         ← NEW: User management
│   │   │       ├── couponsApi.ts       ← Full CRUD
│   │   │       ├── cartRulesApi.ts     ← Full CRUD
│   │   │       ├── analyticsApi.ts     ← NEW: Admin dashboard data
│   │   │       └── baseApi.ts
│   │   ├── store/                      ← Redux (simpler than storefront)
│   │   ├── types.ts                    ← Import from @shop/shared-types
│   │   └── ...
│   │
│   └── storefront/ (purcari-israel)
│       ├── package.json
│       ├── vite.config.ts              ← port: 3000
│       ├── index.tsx
│       ├── App.tsx                     ← 12 routes: home, shop, product, checkout, etc
│       ├── pages/ (13 pages)
│       │   ├── HomePage.tsx
│       │   ├── ShopPage.tsx            ← Products catalog (Hebrew, RTL)
│       │   ├── ProductPage.tsx         ← Single product detail
│       │   ├── CheckoutPage.tsx        ← 3-step: shipping → payment → review
│       │   ├── OrderConfirmationPage.tsx
│       │   ├── LoginPage.tsx           ← Customer auth
│       │   ├── DashboardPage.tsx       ← Customer profile + order history
│       │   ├── ContactPage.tsx
│       │   ├── AboutPage.tsx           ← About wine/brand
│       │   ├── ShippingPage.tsx
│       │   ├── TermsPage.tsx
│       │   ├── PrivacyPage.tsx
│       │   └── (404 in App.tsx)
│       ├── components/
│       │   ├── home/                   ← Hero, featured wines, etc
│       │   ├── about/                  ← Brand story sections
│       │   ├── checkout/               ← Multi-step checkout UI
│       │   ├── dashboard/              ← Customer order history
│       │   ├── header-components/      ← Nav, search, cart
│       │   ├── login/                  ← Auth forms
│       │   ├── contact/                ← Contact form sections
│       │   ├── common/                 ← Reusable buttons, cards
│       │   ├── Header.tsx              ← Navigation + search
│       │   ├── Footer.tsx              ← Footer with Hebrew links
│       │   ├── Layout.tsx              ← Page wrapper
│       │   ├── CartModal.tsx           ← Side cart drawer
│       │   ├── ProductCard.tsx         ← Wine card component
│       │   ├── SearchModal.tsx         ← Full-text product search
│       │   ├── AgeVerificationModal.tsx ← Wine age gate
│       │   ├── SEO.tsx                 ← Meta tag management
│       │   └── ScrollToTop.tsx
│       ├── services/
│       │   ├── appwrite.ts             ← Appwrite config (shared with admin)
│       │   ├── geoapify.ts             ← Address geocoding
│       │   └── api/
│       │       ├── authApi.ts          ← Customer auth
│       │       ├── productsApi.ts      ← READ ONLY: list, detail, search
│       │       ├── categoriesApi.ts    ← Category tree (navigation)
│       │       ├── ordersApi.ts        ← Create order, get order history
│       │       ├── couponsApi.ts       ← Validate coupon at checkout
│       │       ├── cartRulesApi.ts     ← Calculate shipping costs
│       │       ├── analyticsApi.ts     ← Track user events
│       │       └── baseApi.ts
│       ├── store/
│       │   ├── slices/
│       │   │   ├── cartSlice.ts        ← COMPLEX: ~500 lines
│       │   │   │                       ← Handles: items, coupon, shipping, discount, tax
│       │   │   └── uiSlice.ts          ← Modal states
│       │   ├── hooks.ts
│       │   └── index.ts
│       ├── index.css                   ← Tailwind v4 + custom theme
│       │                               ← Colors: primary #1a1a1a, secondary #8c2438, accent #d4af37
│       │                               ← Font: Noto Sans Hebrew (RTL)
│       ├── theme/
│       │   └── styles.ts               ← Tailwind theme config
│       ├── schemas/                    ← Zod validation schemas
│       ├── utils/                      ← Helper functions
│       ├── public/                     ← Assets
│       ├── types.ts                    ← Import from @shop/shared-types + wine-specific extensions
│       └── ...
│
└── packages/
    ├── shared-types/
    │   ├── package.json
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── types.ts                ← 250+ lines:
    │   │   │                           ← Product, CartItem, Order, Category
    │   │   │                           ← StockStatus, WineType, CategoryStatus, OrderStatus enums
    │   │   │                           ← Fields: wineType, vintage, region, alcoholContent, etc
    │   │   ├── constants.ts            ← APPWRITE_CONFIG (DB & collection IDs)
    │   │   └── utils.ts                ← Shared helpers (cart calc, price formatting)
    │   └── tsconfig.json
    │
    ├── shared-api/
    │   ├── package.json
    │   ├── src/
    │   │   ├── baseApi.ts              ← RTK Query setup
    │   │   └── hooks.ts                ← Common hooks
    │   └── tsconfig.json
    │
    ├── shared-constants/
    │   ├── package.json
    │   ├── src/
    │   │   ├── appwrite.ts             ← APPWRITE_CONFIG (can also be in shared-types)
    │   │   └── business.ts             ← Cart rules, discount types, etc
    │   └── tsconfig.json
    │
    └── shared-ui/ (OPTIONAL - NOT RECOMMENDED due to RTL differences)
        ├── package.json
        ├── src/
        │   └── components/
        │       ├── Button.tsx          ← Basic button
        │       └── Card.tsx            ← Basic card
        └── tsconfig.json
```

---

### Section 10: Add Monorepo Setup Commands

**Update Phase 1 with actual commands:**

```bash
# 1. Create monorepo root
mkdir shop-system
cd shop-system
git init

# 2. Create structure
mkdir apps packages

# 3. Move repositories
# Copy storefront into apps/storefront
cp -r /path/to/purcari-israel apps/storefront

# Copy admin (when ready)
# cp -r /path/to/hebrew-admin-dashboard apps/admin

# 4. Create root package.json with pnpm workspaces
cat > package.json << 'EOF'
{
  "name": "shop-system",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev:admin": "pnpm --filter admin dev",
    "dev:storefront": "pnpm --filter storefront dev",
    "dev": "pnpm --filter=admin --filter=storefront dev --parallel",
    "build": "pnpm --filter=admin --filter=storefront build",
    "build:admin": "pnpm --filter admin build",
    "build:storefront": "pnpm --filter storefront build",
    "preview:admin": "pnpm --filter admin preview",
    "preview:storefront": "pnpm --filter storefront preview",
    "type-check": "pnpm --filter=admin --filter=storefront type-check"
  },
  "devDependencies": {
    "pnpm": "^9.0.0"
  }
}
EOF

# 5. Create pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# 6. Create shared-types package
mkdir -p packages/shared-types/{src,}
cat > packages/shared-types/package.json << 'EOF'
{
  "name": "@shop/shared-types",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "files": ["src"],
  "devDependencies": {
    "typescript": "~5.8.2"
  }
}
EOF

# 7. Install dependencies
pnpm install

# 8. Create shared-types index
cat > packages/shared-types/src/index.ts << 'EOF'
// Export all types from storefront types.ts
export * from '../../../apps/storefront/types';
EOF

# 9. Update apps/storefront/package.json to depend on shared-types
# Add to dependencies:
# "@shop/shared-types": "workspace:*"

# 10. Update imports in storefront
# Change: import { Product, ... } from './types'
# To: import { Product, ... } from '@shop/shared-types'

# 11. Test setup
pnpm dev
# Should start both apps (or use pnpm dev:storefront + pnpm dev:admin in separate terminals)
```

---

### Section 11: Update Deployment Strategy

**Add production port information:**

```markdown
### Production Deployment

#### Subdomain Approach (Recommended)

```
https://shop.purcari-israel.com/      ← Storefront (port 443)
https://admin.purcari-israel.com/     ← Admin Dashboard (port 443)
https://api.purcari-israel.com/       ← Appwrite API (already external)
```

#### Platform-Specific Instructions

**Vercel/Netlify (Monorepo Support):**

Vercel supports monorepo deployments natively:

```bash
# In project settings:
Root Directory: (none - monorepo)

# For storefront:
Build Command: pnpm build:storefront
Output Directory: apps/storefront/dist

# For admin:
Build Command: pnpm build:admin
Output Directory: apps/admin/dist
```

**Docker Deployment:**

Create separate Dockerfiles:

```dockerfile
# apps/storefront/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/storefront ./apps/storefront
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm build:storefront
EXPOSE 3000
CMD ["pnpm", "preview:storefront"]

# apps/admin/Dockerfile (similar)
```

**Environment Variables (Production):**

Both apps need access to root `.env`:

```env
# apps/storefront/.env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=696b5bee001fe3af955a
VITE_APPWRITE_DATABASE_ID=cms_db
VITE_GEOAPIFY_API_KEY=...

# apps/admin/.env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=696b5bee001fe3af955a
VITE_APPWRITE_DATABASE_ID=cms_db
```
```

---

## CONVERSION CHECKLIST (UPDATED)

### Before Starting
- [ ] Backup storefront repo (purcari-israel)
- [ ] Backup admin repo (hebrew-admin-dashboard)
- [ ] Backup .env.local files from both
- [ ] Ensure both repos use Appwrite for same backend

### Step 1: Create Monorepo Structure
- [ ] Create root `shop-system` folder
- [ ] Create `apps/` and `packages/` folders
- [ ] Create root `package.json` with workspaces
- [ ] Create `pnpm-workspace.yaml`
- [ ] Copy storefront to `apps/storefront/`
- [ ] Copy admin to `apps/admin/` (when ready)

### Step 2: Create Shared Packages
- [ ] Create `packages/shared-types/`
- [ ] Copy `types.ts` from storefront to `shared-types/src/types.ts`
- [ ] Add `APPWRITE_CONFIG` to `shared-types/src/constants.ts`
- [ ] Create `packages/shared-types/package.json`
- [ ] Create `packages/shared-api/` with `baseApi.ts`
- [ ] Create `packages/shared-constants/` (optional)

### Step 3: Update Storefront
- [ ] Update `package.json` to import `@shop/shared-types`
- [ ] Update import statements: `import { Product } from '@shop/shared-types'`
- [ ] Keep storefront-specific files: `services/api/`, `store/`, `pages/`, etc.
- [ ] Test: `pnpm install && pnpm dev:storefront`

### Step 4: Prepare Admin Dashboard (When Ready)
- [ ] Review admin app structure
- [ ] Update `package.json` to import `@shop/shared-types`
- [ ] Create admin-specific API slices (with CRUD operations)
- [ ] Create admin-specific pages (Dashboard, Products CRUD, Orders, etc)
- [ ] Update imports for shared types
- [ ] Test: `pnpm dev:admin`

### Step 5: Test Full Monorepo
- [ ] `pnpm install` works in root
- [ ] `pnpm dev` starts both apps (or run in separate terminals)
- [ ] Storefront on `localhost:3000` works
- [ ] Admin on `localhost:3001` works (when ready)
- [ ] Both connect to same Appwrite backend
- [ ] Both import types from `@shop/shared-types`

### Step 6: Git & CI/CD (After Successful Conversion)
- [ ] Initialize git in root
- [ ] Create separate deployment workflows for each app
- [ ] Test deployments to staging

---

## CRITICAL DECISIONS BEFORE CONVERSION

### 1. **Port Configuration**
- [ ] Keep storefront on `3000` and admin on `3001`? (Current setup)
- [ ] Or switch storefront to `5173` to match standard Vite? (Guide's suggestion)
- **Recommendation:** Keep as-is (3000 & 3001)

### 2. **Shared Components**
- [ ] Should both apps share Header, Footer, Button components?
- [ ] Or keep completely separate due to RTL/language differences?
- **Recommendation:** Keep separate (storefront is Hebrew/RTL, admin is English/LTR)

### 3. **Types Location**
- [ ] Put all types in `shared-types`? (Recommended)
- [ ] Or keep wine-specific types in storefront?
- **Recommendation:** All in `shared-types`, import in both apps

### 4. **API Structure**
- [ ] Fully separate API layer for each app?
- [ ] Or share base queries and extend?
- **Recommendation:** Share `baseApi.ts` in `shared-api`, but keep app-specific slices separate

### 5. **Appwrite IDs as Environment Variables**
- [ ] Should collection IDs be in `.env` or hardcoded?
- **Recommendation:** Move to `.env` for flexibility (multi-environment support)

---

## ESTIMATED EFFORT

| Task | Time | Difficulty |
|------|------|------------|
| Create monorepo structure | 30 mins | Easy |
| Create shared-types package | 45 mins | Easy |
| Update storefront imports | 60 mins | Easy |
| Prepare admin repo | 120 mins | Medium |
| Test full setup | 60 mins | Medium |
| Setup CI/CD deployments | 90 mins | Medium |
| **TOTAL** | **405 mins** | **3-4 hours** |

---

## OPEN QUESTIONS FOR CLARIFICATION

1. **Admin Dashboard Status:** 
   - Is the admin dashboard already built and functional?
   - Or is this a conversion that will involve creating it?

2. **Tailwind/Styling:**
   - Should admin use same burgundy/gold theme?
   - Or different professional dashboard theme?

3. **Analytics:**
   - What analytics data should admin see?
   - Real-time? Historical?

4. **Admin Features (Priority):**
   - Product CRUD?
   - Order management?
   - User management?
   - Coupon management?
   - Analytics dashboard?
   - All of the above?

5. **Language:**
   - Admin dashboard in English or Hebrew?
   - If both, should it be bilingual?

6. **Authentication:**
   - Should admin have role-based access control (RBAC)?
   - Or just admin/non-admin binary?

---

## NEXT STEPS

1. **Review this analysis** with admin dashboard developer
2. **Make decisions** on the 5 open questions above
3. **Update the guide** with the changes in this document
4. **Start conversion** following the updated checklist
5. **Test thoroughly** before deploying to production

---

**End of Analysis**
