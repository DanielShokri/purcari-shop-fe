---
phase: 03-rivhit-payment
plan: 01
subsystem: payments
tags: [rivhit, israeli-payments, invoicing, webhooks, convex-http]

# Dependency graph
requires:
  - phase: 02-fix-ts-errors
    provides: Clean TypeScript compilation
provides:
  - paymentTransactions table for tracking payment lifecycle
  - Rivhit Document.Page API client action
  - IPN webhook endpoint for payment notifications
  - Post-payment redirect handler
  - Rivhit shared types for type safety
affects: [03-02-checkout-integration, storefront-checkout]

# Tech tracking
tech-stack:
  added: [rivhit-api, convex-http-actions]
  patterns: [node-action-for-external-api, helper-file-for-mutations]

key-files:
  created:
    - convex/rivhit.ts
    - convex/rivhitHelpers.ts
    - .planning/phases/03-rivhit-payment/03-USER-SETUP.md
  modified:
    - convex/schema.ts
    - convex/http.ts
    - packages/shared-types/src/index.ts

key-decisions:
  - "Split Rivhit code into rivhit.ts (node action) and rivhitHelpers.ts (non-node mutations/queries)"
  - "Use Invoice-Receipt (305) as default document type for e-commerce"
  - "Store IPN data as raw string for debugging"

patterns-established:
  - "Node actions call internal queries/mutations in separate helper files"
  - "IPN webhooks parse both JSON and form-urlencoded bodies"
  - "Payment transactions track full lifecycle with status index"

# Metrics
duration: 3min
completed: 2026-02-15
---

# Phase 03 Plan 01: Rivhit Payment Foundation Summary

**Rivhit payment gateway client with Document.Page API, IPN webhook endpoint, and paymentTransactions tracking table**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-15T17:07:00Z
- **Completed:** 2026-02-15T17:10:19Z
- **Tasks:** 2
- **Files modified:** 5 (+ 1 USER-SETUP.md)

## Accomplishments

- Created paymentTransactions schema with orderId and status indexes
- Added Rivhit payment types to shared-types package
- Built createPaymentPage action that calls Rivhit Document.Page API
- Implemented IPN webhook handler that updates payment/order status
- Added HTTP routes for /rivhit/ipn and /rivhit/redirect

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Rivhit payment types and paymentTransactions schema** - `62d11e1` (feat)
2. **Task 2: Create Rivhit API client action and IPN webhook handler** - `cda52e7` (feat)

## Files Created/Modified

- `convex/rivhit.ts` - Node action for createPaymentPage (calls Rivhit API)
- `convex/rivhitHelpers.ts` - Internal queries/mutations for payment operations
- `convex/http.ts` - Added IPN and redirect HTTP routes
- `convex/schema.ts` - Added paymentTransactions table
- `packages/shared-types/src/index.ts` - Added Rivhit types

## Decisions Made

1. **Split into two files:** Convex requires Node.js code (actions with fetch) to be separate from mutations/queries. Created `rivhit.ts` for the action and `rivhitHelpers.ts` for helpers.
2. **Document type 305:** Using Invoice-Receipt (חשבונית מס / קבלה) as the default - most common for Israeli e-commerce.
3. **Raw IPN storage:** Store full IPN body as string in ipnData field for debugging and audit trail.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Split node/non-node Convex code**
- **Found during:** Task 2
- **Issue:** Convex threw "Only actions can be defined in Node.js" error when mutations were in a `"use node"` file
- **Fix:** Created separate `rivhitHelpers.ts` for mutations and queries, kept action in `rivhit.ts`
- **Files modified:** convex/rivhit.ts, convex/rivhitHelpers.ts, convex/http.ts
- **Verification:** `npx convex dev --once` succeeds
- **Committed in:** cda52e7

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for Convex runtime requirements. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviation.

## User Setup Required

**External services require manual configuration.** See [03-USER-SETUP.md](./03-USER-SETUP.md) for:
- RIVHIT_API_TOKEN environment variable
- RIVHIT_ENVIRONMENT setting (test/production)
- Account setup checklist
- Verification commands

## Next Phase Readiness

- Rivhit API client ready for checkout integration
- paymentTransactions table ready for order flow
- IPN webhook endpoint registered and ready to receive callbacks
- Ready to implement checkout flow in Plan 02

---
*Phase: 03-rivhit-payment*
*Completed: 2026-02-15*

## Self-Check: PASSED

- [x] convex/rivhit.ts exists
- [x] convex/rivhitHelpers.ts exists  
- [x] 03-USER-SETUP.md exists
- [x] commit 62d11e1 found
- [x] commit cda52e7 found
