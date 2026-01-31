# Migration Roadmap: Appwrite to Convex

## Overview
This roadmap outlines the transition from Appwrite to Convex for the Purcari Israel project.

## Phase 1: Infrastructure & Schema (Days 1-2)
- [ ] Initialize Convex project (`npx convex dev`)
- [ ] Implement `convex/schema.ts` with all tables (products, orders, users, etc.)
- [ ] Configure `convex/auth.ts` with Password provider
- [ ] Set up environment variables (`VITE_CONVEX_URL`)

## Phase 2: Core Functions & Data (Days 3-5)
- [ ] Implement CRUD functions for Users and Addresses
- [ ] Implement CRUD and Search functions for Products
- [ ] Implement CRUD functions for Categories
- [ ] Implement CRUD functions for Orders and Order Items
- [ ] Implement initial Coupon management functions

## Phase 3: Frontend Integration (Days 6-10)
- [ ] **Storefront Migration:**
  - [ ] Replace `ApiProvider` with `ConvexAuthProvider`
  - [ ] Replace RTK Query hooks with `useQuery` / `useMutation` (Auth, Products, Orders)
- [ ] **Admin Migration:**
  - [ ] Replace RTK Query hooks in admin dashboard
  - [ ] Implement admin role protection in Convex functions

## Phase 4: Business Logic & Side Effects (Days 11-13)
- [ ] Port complex Coupon validation logic to Convex Actions
- [ ] Implement transactional Order creation (stock check -> order -> inventory update)
- [ ] Implement atomic increment for coupon usage
- [ ] Handle cart persistence strategy

## Phase 5: Verification & Cutover (Days 14-18)
- [ ] Comprehensive unit testing for Convex functions
- [ ] End-to-end testing of critical flows (checkout, admin management)
- [ ] Data validation dry-runs
- [ ] Final production deployment and Appwrite decommissioning
