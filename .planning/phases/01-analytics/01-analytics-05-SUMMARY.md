---
phase: 01-analytics
plan: "05"
subsystem: analytics
tags: [analytics, identity-stitching, event-tracking, convex, guest-to-user, retention]

# Dependency graph
requires:
  - phase: 01-analytics-04
    provides: Basic analytics infrastructure with aggregates and trackEvent mutation
provides:
  - Identity stitching via anonymousId linking to userId
  - Enhanced useAnalytics hook with identify() and UUID generation
  - Standard event tracking across storefront (product_viewed, cart_item_added, etc.)
  - 180-day data retention via daily cron job
  - by_anon_id and by_userId_event indexes for efficient queries
affects: [dashboard-analytics, abandoned-cart-recovery, personalization, user-behavior-analysis]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - UUID v4 for anonymous ID generation (collision-resistant)
    - Identity stitching pattern (link anon events on auth)
    - Cron job for data retention (Convex cronJobs API)

key-files:
  created:
    - convex/crons.ts
  modified:
    - convex/schema.ts
    - convex/analytics/events.ts
    - convex/analytics/index.ts
    - convex/analytics.ts
    - convex/analytics/queries.ts
    - apps/storefront/hooks/useAnalytics.ts
    - apps/storefront/pages/ProductPage.tsx
    - apps/storefront/pages/CheckoutPage.tsx
    - apps/storefront/pages/OrderConfirmationPage.tsx
    - apps/storefront/components/ProductCard.tsx
    - apps/storefront/components/CartModal.tsx
    - apps/storefront/components/SearchModal.tsx
    - apps/storefront/components/login/AuthForm.tsx

key-decisions:
  - "Used convex_anon_id localStorage key for consistency with Convex patterns"
  - "UUID v4 generation inline in useAnalytics (no external uuid package needed)"
  - "Identity stitching uses by_anon_id index for O(log n) lookups vs table scan"
  - "Cron job runs at 2:00 AM UTC daily to minimize user impact"
  - "Batch delete limit of 1000 events per cron run to avoid timeouts"

patterns-established:
  - "Event naming: past tense verbs (product_viewed, cart_item_added, checkout_started)"
  - "All events include anonymousId for identity stitching support"
  - "identify() called after successful auth to link browsing history"

# Metrics
duration: ~45min
completed: 2026-02-12
---

# Phase 1 Plan 5: Convex-Native Analytics & Identity Stitching Summary

**Identity stitching system linking anonymous guest browsing to authenticated users, with standard event tracking across product/cart/checkout flows and 180-day retention cron job**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-02-12T17:40:00Z
- **Completed:** 2026-02-12T18:23:33Z
- **Tasks:** 7
- **Files modified:** 14

## Accomplishments

- Schema indexes (`by_anon_id`, `by_userId_event`) enabling efficient identity stitching queries
- `track` and `linkIdentity` mutations with optimized index usage
- Enhanced `useAnalytics` hook with `identify()`, `useTrackCheckoutStart`, `useTrackSearch`
- Standard event tracking in ProductPage, ProductCard, CartModal, CheckoutPage, OrderConfirmationPage, SearchModal
- 180-day data retention via daily cron job at 2:00 AM UTC
- AuthForm integration calling `identify()` after login/registration

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema Update with Identity Indexes** - `641d2d7` (feat)
2. **Task 2: Global Tracking Mutation (track)** - `a7a268b` (feat)
3. **Task 3: Identity Stitching Mutation (linkIdentity)** - `a7a268b` (feat - combined with Task 2)
4. **Task 4: Frontend useAnalytics Hook** - `768f013` (feat)
5. **Task 5: Standard Event Tracking** - `5b7ebfa` (feat)
6. **Task 6: 180-Day Data Retention Cron** - `1a56be4` (feat)
7. **Task 7: Login/Register Identify Integration** - `b186ac5` (feat)

**Deviation fix:** `77fdae1` (fix: remove duplicate helper function declarations)

## Files Created/Modified

- `convex/schema.ts` - Added by_anon_id and by_userId_event indexes
- `convex/analytics/events.ts` - Added track, linkIdentity, pruneOldEvents mutations
- `convex/analytics/index.ts` - Updated exports for new mutations
- `convex/analytics.ts` - Updated re-exports
- `convex/crons.ts` - **NEW** - Daily cron job for 180-day pruning
- `convex/analytics/queries.ts` - Fixed duplicate helper functions
- `apps/storefront/hooks/useAnalytics.ts` - Enhanced with identify(), UUID generation, new hooks
- `apps/storefront/pages/ProductPage.tsx` - product_viewed with price/category, cart_item_added with cartTotal
- `apps/storefront/pages/CheckoutPage.tsx` - checkout_started on page load
- `apps/storefront/pages/OrderConfirmationPage.tsx` - order_completed with items array
- `apps/storefront/components/ProductCard.tsx` - cart_item_added on quick add
- `apps/storefront/components/CartModal.tsx` - checkout_started when clicking checkout
- `apps/storefront/components/SearchModal.tsx` - search_performed with query and results count
- `apps/storefront/components/login/AuthForm.tsx` - identify() call after successful auth

## Decisions Made

1. **localStorage key `convex_anon_id`** - Consistent with Convex naming patterns, replaces previous `purcari_anonymous_id`
2. **UUID v4 inline generation** - No external dependency needed, uses crypto.randomUUID with fallback
3. **Index-based identity stitching** - Uses `by_anon_id` index for O(log n) lookups instead of table scan
4. **Cron at 2:00 AM UTC** - Off-peak hours for Israeli users, minimal impact on real-time analytics
5. **Batch limit 1000** - Prevents cron timeout, handles remaining in next run

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed duplicate helper function declarations in queries.ts**
- **Found during:** Post-Task 7 verification
- **Issue:** `countAuthenticatedUsersInRange` and `countUniqueVisitorsInRange` declared twice
- **Fix:** Kept optimized versions using `by_timestamp` index, removed redundant declarations
- **Files modified:** `convex/analytics/queries.ts`
- **Verification:** `npx convex dev --once` passes
- **Committed in:** `77fdae1`

**2. [Rule 3 - Blocking] Migrated string timestamps to numbers**
- **Found during:** Post-Task 7 verification
- **Issue:** 64 existing analytics events had timestamps stored as strings, failing schema validation
- **Fix:** Temporarily widened schema to accept union, ran `migrateTimestamps` mutation, reverted to strict number type
- **Files modified:** `convex/schema.ts` (temporary), data migration via mutation
- **Verification:** `npx convex dev --once` passes with strict schema
- **Committed in:** Not committed (data-only migration)

---

**Total deviations:** 2 auto-fixed (2 blocking issues)
**Impact on plan:** Both fixes essential for deployment. No scope creep.

## Issues Encountered

- Pre-existing timestamp schema mismatch required data migration before schema could be deployed with new indexes

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Analytics system fully operational with identity stitching
- Ready for dashboard visualization of user journeys
- Ready for abandoned cart recovery based on linked user events
- Ready for personalization using authenticated user behavior history

---
*Phase: 01-analytics*
*Completed: 2026-02-12*

## Self-Check: PASSED

All commit hashes verified. All key files exist.
