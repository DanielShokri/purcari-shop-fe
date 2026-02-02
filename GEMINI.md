# Purcari Israel - Project Context

## 1. Project Overview
**Purcari Israel** is a premium ecommerce storefront for Purcari Winery, tailored specifically for the Israeli market. It is a **React** application built with **Vite** and backed by **Convex** for the database and authentication.

### Key Characteristics
*   **Language:** Hebrew (עברית) - **RTL (Right-to-Left)** layout is mandatory.
*   **Currency:** Israeli Shekel (₪).
*   **Design:** Premium, dark-themed (Primary: `#1a1a1a`, Secondary: `#8c2438`, Accent: `#d4af37`).
*   **Backend:** Convex (Database, Auth, Server Functions).
*   **Authentication:** Convex Auth with Password provider + custom user profiles.
*   **State Management:** Redux Toolkit (for cart, UI) + Convex React hooks (for data fetching).

## 2. Tech Stack & Dependencies
*   **Framework:** React 18 + TypeScript
*   **Build Tool:** Vite 6
*   **Styling:** Tailwind CSS v4 + Framer Motion
*   **State:** `@reduxjs/toolkit`, `react-redux`
*   **Backend:** `convex` + `@convex-dev/auth`
*   **Auth:** Convex Auth with Password provider
*   **Routing:** `react-router-dom` v6
*   **Forms:** `react-hook-form` + `zod`
*   **Icons:** `lucide-react`

## 3. Architecture & Structure

The project follows a feature-based folder structure:

```text
/
├── apps/
│   ├── admin/              # Admin dashboard application
│   └── storefront/         # Main storefront application (primary)
├── convex/                 # Backend functions & schema
│   ├── auth.ts             # Convex Auth configuration
│   ├── schema.ts           # Database schema (Convex)
│   ├── users.ts            # User queries & mutations
│   ├── orders.ts           # Order queries & mutations
│   ├── products.ts         # Product queries & mutations
│   └── ...                 # Other backend modules
├── .planning/              # Documentation & planning
└── ...                     # Root config files
```

### Storefront Structure (`apps/storefront/src/`)

```text
apps/storefront/src/
├── components/         # UI Components (split by domain)
│   ├── dashboard/      # Dashboard components (OrdersTab, ProfileTab, etc.)
│   ├── header/         # Header components
│   ├── login/          # Auth form components
│   └── ...             # Other domain components
├── pages/              # Route-level page components
│   ├── LoginPage.tsx   # Login/Signup page
│   ├── DashboardPage.tsx # User dashboard
│   ├── ShopPage.tsx    # Product listing
│   └── ...             # Other pages
├── services/
│   └── api/            # API definitions (if any additional)
├── store/              # Redux setup
│   ├── hooks.ts        # Typed hooks (useAppDispatch, useAppSelector)
│   └── slices/         # Redux slices (cartSlice, uiSlice)
├── schemas/            # Validation schemas (Zod)
└── types.ts            # Shared TypeScript interfaces
```

### Convex Structure (`convex/`)

```text
convex/
├── auth.ts             # Convex Auth setup with Password provider
├── schema.ts           # Database schema (users, orders, products, etc.)
├── users.ts            # User-related queries & mutations
├── orders.ts           # Order-related queries & mutations
├── products.ts         # Product queries
├── cartRules.ts        # Cart calculation rules
├── coupons.ts          # Coupon validation
└── _generated/         # Auto-generated Convex types
```

## 4. Key Workflows & Patterns

### Authentication (Convex Auth)

Authentication is handled by Convex Auth with the Password provider:

**Auth Configuration (`convex/auth.ts`):**
*   Password provider validates email format and password requirements (min 4 chars)
*   Profile callback extracts and validates email and name from signup params
*   `createOrUpdateUser` callback creates/updates user documents in the database
*   Users are looked up by `email` (not `tokenIdentifier`) in all queries

**User Schema (`convex/schema.ts`):**
```typescript
users: defineTable({
  // Required fields (always populated by auth)
  name: v.string(),
  email: v.string(),
  
  // Optional fields
  phone: v.optional(v.string()),
  image: v.optional(v.string()),
  role: v.optional(v.union("admin", "editor", "viewer")),
  status: v.optional(v.union("active", "inactive", "suspended")),
  cart: v.optional(v.object({...})),
  createdAt: v.optional(v.string()),
  updatedAt: v.optional(v.string()),
})
.index("email", ["email"])
.index("phone", ["phone"])
```

**Frontend Auth Flow (`apps/storefront/components/login/AuthForm.tsx`):**
*   Uses `useAuthActions()` hook for signIn/signOut
*   Uses `useQuery(api.users.get)` to get current user
*   Uses `useMutation(api.users.createOrUpdateUserProfile)` for additional profile data
*   Phone number stored separately via mutation (not part of Password provider)

### Data Fetching (Convex)

Convex queries and mutations are auto-generated and used via React hooks:
*   **Pattern:** Define functions in `convex/*.ts` files
*   **Usage:** Use auto-generated hooks in components (e.g., `useQuery(api.users.get)`)
*   **Auth Queries:** Require authentication (via `ctx.auth.getUserIdentity()`)

### Convex Configuration

*   **Database:** Convex Cloud
*   **Auth Tables:** Uses standard `authTables` from `@convex-dev/auth` (authAccounts, authSessions, authVerificationTokens)
*   **Environment:** `VITE_CONVEX_URL` (set in .env)

### RTL & Styling

*   **Crucial:** Use **Logical Properties** for Tailwind classes to ensure correct RTL behavior.
    *   ✅ Use: `ms-4` (margin-start), `pe-4` (padding-end), `start-0` (left in LTR, right in RTL).
    *   ❌ Avoid: `ml-4`, `pr-4`, `left-0`.
*   **Text:** All UI text must be in **Hebrew**. Variable names remain English.

### Type System (`apps/storefront/src/types.ts`)

*   **Product:** Contains `productName` (English) and `productNameHe` (Hebrew). Use Hebrew fields for display.
*   **AuthUser:** User type from Convex with fields like `_id`, `name`, `email`, `phone`, `role`, `status`.
*   **Cart/Order:** Strict typing for checkout flow and order validation.
*   **Order:** Contains `customerEmail`, `customerName`, `items`, `total`, `status`, `createdAt`.

### Cart Rules & Calculation Engine

*   **Dynamic Rules:** Fetched via `cartRulesApi` from the `cart_rules` collection in Convex.
*   **Calculation:** `calculateCartTotals` utility applies rules (shipping, restrictions, benefits, discounts) to cart items.
*   **Selectors:** Redux selectors (e.g., `selectCartSummary`) compute final totals and validation errors.

## 5. Development Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server (Port 5173) |
| `npm run build` | Build both admin and storefront for production |
| `npx convex dev` | Start Convex dev server (for backend functions) |
| `npx convex deploy` | Deploy Convex functions to production |

### Running the Project

1. **Start Convex backend:**
   ```bash
   npx convex dev
   ```

2. **Start frontend:**
   ```bash
   npm run dev
   ```

3. **Access:**
   - Frontend: http://localhost:5173
   - Convex Dashboard: http://localhost:5171 (when running `npx convex dev`)

## 6. Authentication Flow

### Signup
1. User fills email, password, name, phone on `/login`
2. `signIn("password", {email, password, name, flow: "signUp"})` called
3. Convex Auth validates and calls `createOrUpdateUser` callback
4. User document created with `email`, `name`, `createdAt`, `updatedAt`
5. Frontend calls `createOrUpdateUserProfile` mutation to add phone
6. Success toast shown, user redirected to `/dashboard`

### Login
1. User fills email, password on `/login`
2. `signIn("password", {email, password, flow: "signIn"})` called
3. Convex Auth validates credentials
4. `createOrUpdateUser` callback called (updates `updatedAt` if user exists)
5. Success toast shown, user redirected to `/dashboard`

### Protected Routes
- Dashboard (`/dashboard`) requires authentication
- Unauthenticated users redirected to `/login`
- Auth state checked via `useQuery(api.users.get)`

## 7. Important Context Rules

*   **Hebrew First:** When adding content or UI elements, default to Hebrew.
*   **RTL Awareness:** Always check if a styling change impacts directionality.
*   **Strict Types:** Maintain strict TypeScript compliance; avoid `any`.
*   **Convex Schema:** Respect the document structure defined in `convex/schema.ts`.
*   **Auth Patterns:** Use `email` for user lookups (not `tokenIdentifier`).
*   **Error Handling:** User-friendly error messages in Hebrew; use ConvexError for backend errors.
*   **Loading States:** Use defensive checks for query loading states - only show loader when actively fetching.

## 8. Recent Changes & Fixes

### Schema Fix (Email Field Required)
- **Issue:** Users schema had `email` as optional, causing validation errors
- **Fix:** Changed `email: v.optional(v.string())` to `email: v.string()`
- **Reason:** Email is always provided by auth provider and required by downstream queries

### Loading State Fix
- **Issue:** Empty orders/addresses lists showed infinite loader
- **Fix:** Improved loading state logic to distinguish between "not called" and "empty result"
- **Pattern:** `isOrdersLoading = (convexUser && convexUser.email) ? convexOrders === undefined : false`

### User Query Pattern
- All user queries use email-based lookups:
```typescript
ctx.db
  .query("users")
  .withIndex("email", (q) => q.eq("email", identity.email))
  .unique()
```

## 9. Documentation

Additional documentation available in `.planning/`:
- `README.md` - Documentation index
- `AUTH_SYSTEM_COMPLETE.md` - Full auth system guide
- `AUTH_QUICK_REFERENCE.md` - Quick start guide
- `BUG_FIX_EMAIL_FIELD.md` - Email field schema fix
- `BUG_FIX_EMPTY_LOADER.md` - Loading state fix
- `SESSION_SUMMARY.md` - Session reports
