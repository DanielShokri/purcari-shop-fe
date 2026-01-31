# Phase 1 Plan: Infrastructure & Schema Setup

## Goal
Initialize the Convex environment and establish the data schema required for the migration.

## Tasks
- [ ] **Task 1: Project Initialization**
  - Run `npx convex dev` to link the project.
  - Install required dependencies: `convex`, `@convex-dev/auth`.
- [ ] **Task 2: Define Schema**
  - Create `convex/schema.ts`.
  - Implement table definitions for: `users`, `userAddresses`, `products`, `categories`, `orders`, `orderItems`, `coupons`, `couponUsage`, `cartRules`, `analyticsEvents`, `notifications`.
  - Add necessary indexes (especially for search and foreign keys).
- [ ] **Task 3: Auth Configuration**
  - Create `convex/auth.ts`.
  - Configure the password provider.
- [ ] **Task 4: Environment Setup**
  - Update `.env.local` (and other relevant `.env` files in `apps/storefront` and `apps/admin`) with `VITE_CONVEX_URL`.

## Verification
- Verify schema deployment in the Convex Dashboard.
- Ensure `npx convex dev` runs without errors.
- Confirm environment variables are accessible in the frontend apps.
