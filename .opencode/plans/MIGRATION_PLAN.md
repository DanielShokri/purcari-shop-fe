# Migration Plan: Appwrite to Convex

## Goal
Migrate the Storefront and Admin applications from Appwrite to Convex, involving a complete schema definition and data structure alignment.

## Steps

### 1. Schema Definition (Convex)
- Create `convex/schema.ts` based on the mapped data structures.
- Define `users` table with nested `addresses` and `cart`.
- Define `products` table with Hebrew support (`productNameHe`) and Search Indexes (`search_he`, `search_en`).
- Define `orders` table with un-flattened `shippingAddress` and `paymentInfo`.
- Define `coupons` and `coupon_usage` tables for tracking discounts and usage limits.
- Define `categories` table.
- Define `auth_sessions` for Convex Auth.

### 2. Type Generation
- Ensure Convex types are generated and accessible to the frontend apps.
- Update `packages/shared-types` if necessary to align with Convex auto-generated types (or create adapters).

### 3. Backend Implementation (Mutations & Queries)
- **Auth:** Implement Convex Auth handlers.
- **Products:** Create queries for listing, filtering, and searching (using the new indexes).
- **Orders:** Implement `createOrder` mutation with transaction logic (stock check, coupon validation, usage increment).
- **Coupons:** Port the validation logic and the increment cloud function to Convex mutations.

### 4. Frontend Integration
- Replace Appwrite SDK calls in `apps/storefront/services/api/` with Convex React hooks (`useQuery`, `useMutation`).
- Update `authApi.ts`, `productsApi.ts`, `ordersApi.ts`, `couponsApi.ts`.

### 5. Data Migration (If applicable)
- Since this is a "clean slate" migration, we assume no production data needs moving. If seed data is needed, we will create a seed script.

## Verification
- Run `npx convex dev` to validate the schema.
- Check the Convex Dashboard for correct table creation and index status.
