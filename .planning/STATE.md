# Project State: Purcari Wine E-commerce

**Last updated:** February 20, 2026 (08:00 UTC)

---

## Current Position

**Active phase:** Phase refactor-admin-hooks
**Current plan:** refactor-admin-hooks-04 (pending)
**Plans completed:** 3 of 4

**Current blockers:**
- None

**Recently completed:**
- Plan refactor-admin-hooks-03: Extract useCategories hook from Categories.tsx
  - Created useCategories hook (278 lines) with tree building algorithm
  - Refactored Categories.tsx from 314 lines to 151 lines (52% reduction)
  - Eliminated 6 useState calls from component
  - Extracted complex tree management to dedicated hook
- Plan refactor-admin-hooks-01: Extract useUsers and useUserDialogs hooks from Users.tsx
  - Created useUsers hook (160 lines) for list/filter/pagination/selection
  - Created useUserDialogs hook (325 lines) for create/edit/delete dialogs
  - Refactored Users.tsx from 474 lines to 302 lines (36% reduction)
  - Eliminated 24 useState calls from component
- Plan refactor-admin-hooks-02: Extract useOrders hook from Orders.tsx
  - Created useOrders hook (293 lines) consolidating all order list state
  - Refactored Orders.tsx from 251 lines to 48 lines (81% reduction)
  - Eliminated 10 useState calls from component
  - Extracted date filtering and status counts to hook
- Plan refactor-product-editor-01: Refactor ProductEditor to use useProductEditor hook
  - Fixed WineType enum to match Convex schema (Red, White, Rosé, Sparkling)
  - Created useProductEditor hook (370 lines) consolidating all product form state
  - Refactored ProductEditor.tsx from 566 lines to 81 lines (85% reduction)
  - Eliminated 15+ useState calls and all wine type conversion functions
- Plan auth-google-01: Google OAuth Integration
  - Added Google provider to convex/auth.ts alongside Password provider
  - Implemented signInWithGoogle method in useAuth hook with Hebrew error messages
  - Added Google sign-in button to AuthForm with RTL layout
  - Created USER-SETUP.md for Google Cloud Console configuration
  - Added @auth/core direct dependency to resolve TypeScript module resolution
- Plan 03-01: Rivhit Payment Foundation
  - Created paymentTransactions table with orderId and status indexes
  - Added Rivhit payment types to shared-types package
  - Built createPaymentPage action that calls Rivhit Document.Page API
  - Implemented IPN webhook handler for payment notifications
  - Added HTTP routes for /rivhit/ipn and /rivhit/redirect
  - USER-SETUP.md created for Rivhit configuration
- Plan 02-05: Fix CartRuleEditor Form Types
- Plan 02-04: Fix TypeScript Errors in React Components
- Plan 02-03: Fix TypeScript Errors in Admin Hooks and Pages
- Plan 02-02: Fix TypeScript Errors in Convex Backend Functions
- Plan 02-01: Fix TypeScript Errors in Shared Types

---

## Decisions

### Locked (non-negotiable)

| Decision | Context | Made |
|----------|---------|------|
| Use @convex-dev/aggregate component | Prevents unbounded table scans | 2026-02-12 |
| Maintain RTL Hebrew UI | Business requirement | Existing |
| Use Convex for all backend | Architecture decision | Existing |
| CartRuleStatus and CartRuleType are type aliases | Use string literals | Phase 02 |
| Split Convex node/non-node code | Rivhit action in rivhit.ts, helpers in rivhitHelpers.ts | Phase 03-01 |
| Add @auth/core as direct dependency | Resolve TypeScript module '@auth/core/providers/google' | Phase auth-google-01 |

### Claude's Discretion

| Area | Current thinking |
|------|------------------|
| Product editor pattern | Use useProductEditor hook following useCartRuleEditor pattern |
| Form state management | Consolidate in react-hook-form, useState only for UI state |
| WineType enum | Match Convex schema exactly (Red, White, Rosé, Sparkling) |
| Event naming convention | Use past tense: `page_viewed`, `product_viewed`, `cart_item_added` |
| Rivhit document type | Use Invoice-Receipt (305) as default for e-commerce |
| IPN data storage | Store raw body as string for debugging |
| Node action pattern | External API calls in "use node" action files, mutations in separate helper files |
| Google OAuth provider | Use @auth/core/providers/google for standard OAuth flow |
| OAuth UX | Place Google button below email form with "או" divider, maintain RTL layout |
| Order list state pattern | Use useOrders hook with state/handlers structure | Phase refactor-admin-hooks-02 |
| Category tree pattern | Use useCategories hook for tree + form management | Phase refactor-admin-hooks-03 |

### Deferred

| Idea | Reason for deferral |
|------|---------------------|
| GA4 integration | Can be added later without affecting internal dashboard |
| Funnel tracking | Requires checkout flow instrumentation first |
| A/B testing | Not enough traffic to justify complexity |

---

## Pending Todos

### Phase 03: Rivhit Payment Integration
- [x] Rivhit payment types and schema
- [x] createPaymentPage action
- [x] IPN webhook handler
- [x] HTTP routes for Rivhit callbacks
- [ ] Checkout flow integration (Plan 03-02)
- [ ] Payment status UI in storefront

### Phase 04: Google OAuth Authentication
- [x] Google provider in convex/auth.ts
- [x] signInWithGoogle in useAuth hook
- [x] Google sign-in button in AuthForm
- [x] USER-SETUP.md for configuration

---

## Context

### Technical Context
- Monorepo with pnpm workspace
- Convex backend with reactive queries
- React + Vite frontend
- Chakra UI v3 with RTL Hebrew support
- Rivhit payment gateway for Israeli market
- Analytics system complete with aggregates
- Convex Auth with Password and Google OAuth providers

### Business Context
- Wine e-commerce for Israeli market
- Admin dashboard for store management
- Rivhit integration for Israeli payment processing and invoicing
- Conversion tracking important for ROI

---

## Next Actions

### Option A: Complete Rivhit Payment (Phase 03)
1. Configure Rivhit API token via `npx convex env set` (see 03-USER-SETUP.md)
2. Continue with Plan 03-02: Checkout flow integration
3. Test payment flow end-to-end

### Option B: Configure Google OAuth (COMPLETED)
1. ✓ Google OAuth provider implemented
2. Follow USER-SETUP.md to configure Google Cloud Console credentials:
   - Create OAuth consent screen in Google Cloud Console
   - Create OAuth 2.0 credentials (Client ID + Secret)
   - Set environment variables via `npx convex env set`
3. Test Google sign-in flow end-to-end on /login page

**Note:** Google OAuth implementation complete - user setup required for functional testing.

---

## Performance Metrics

| Phase-Plan           | Duration | Tasks | Files |
|----------------------|----------|-------|-------|
| refactor-admin-hooks-03 | 5 min    | 2     | 2     |
| refactor-product-editor-01 | 10 min   | 3     | 3     |
| auth-google-01       | 4 min    | 4     | 4     |
| 03-01                | 3 min    | 2     | 5     |
| Phase refactor-admin-hooks P02 | 2min | 2 tasks | 2 files |
| Phase refactor-admin-hooks P01 | 8 min | 3 tasks | 3 files |
| Phase refactor-admin-hooks P03 | 5min | 2 tasks | 2 files |

