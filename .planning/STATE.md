# Project State: Purcari Wine E-commerce

**Last updated:** February 15, 2026 (17:10 UTC)

---

## Current Position

**Active phase:** Phase 03 - Rivhit Payment Integration
**Current plan:** 03-01 (completed)
**Plans completed:** 1 of 2

**Current blockers:**
- None

**Recently completed:**
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

### Claude's Discretion

| Area | Current thinking |
|------|------------------|
| Event naming convention | Use past tense: `page_viewed`, `product_viewed`, `cart_item_added` |
| Rivhit document type | Use Invoice-Receipt (305) as default for e-commerce |
| IPN data storage | Store raw body as string for debugging |
| Node action pattern | External API calls in "use node" action files, mutations in separate helper files |

### Deferred

| Idea | Reason for deferral |
|------|---------------------|
| GA4 integration | Can be added later without affecting internal dashboard |
| Funnel tracking | Requires checkout flow instrumentation first |
| A/B testing | Not enough traffic to justify complexity |

---

## Pending Todos

- [x] Rivhit payment types and schema
- [x] createPaymentPage action
- [x] IPN webhook handler
- [x] HTTP routes for Rivhit callbacks
- [ ] Checkout flow integration (Plan 03-02)
- [ ] Payment status UI in storefront

---

## Context

### Technical Context
- Monorepo with pnpm workspace
- Convex backend with reactive queries
- React + Vite frontend
- Chakra UI v3 with RTL Hebrew support
- Rivhit payment gateway for Israeli market
- Analytics system complete with aggregates

### Business Context
- Wine e-commerce for Israeli market
- Admin dashboard for store management
- Rivhit integration for Israeli payment processing and invoicing
- Conversion tracking important for ROI

---

## Next Actions

1. Configure Rivhit API token via `npx convex env set` (see 03-USER-SETUP.md)
2. Continue with Plan 03-02: Checkout flow integration
3. Test payment flow end-to-end

---

## Performance Metrics

| Phase-Plan | Duration | Tasks | Files |
|------------|----------|-------|-------|
| 03-01      | 3 min    | 2     | 5     |
