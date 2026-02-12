---
phase: 01-analytics
plan: 03
subsystem: analytics
tags:
  - convex
  - analytics
  - react-hooks
  - event-tracking
  - localstorage

# Dependency graph
requires:
  - phase: 01-analytics-02
    provides: "TableAggregate instances (dailyViews, activeUsers, productViews)"
provides:
  - "trackEvent mutation for recording analytics events"
  - "identifyUser mutation for linking anonymous sessions"
  - "useAnalytics hook with trackEvent function"
  - "useTrackPageView hook for automatic page view tracking"
  - "useTrackProductView hook for product detail pages"
  - "useTrackAddToCart and useTrackPurchase hooks for e-commerce events"
  - "Anonymous ID generation and localStorage persistence"
affects:
  - 01-analytics-04
  - apps-storefront

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Event naming convention: past tense (page_viewed, product_viewed, added_to_cart)"
    - "Analytics error handling: silently fail to prevent app breakage"
    - "localStorage for anonymous ID persistence"
    - "React hooks for declarative event tracking"

key-files:
  created:
    - convex/analytics/events.ts
    - apps/storefront/hooks/useAnalytics.ts
  modified:
    - convex/analytics/index.ts
    - apps/storefront/App.tsx
    - apps/storefront/pages/ProductPage.tsx
    - apps/storefront/pages/ShopPage.tsx

key-decisions:
  - "Used insertIfDoesNotExist for aggregate updates to prevent duplicates"
  - "Anonymous ID stored in localStorage with 30-minute session timeout (configurable)"
  - "Analytics errors silently fail to prevent disrupting user experience"
  - "Page view tracking centralized in App.tsx via useTrackPageView hook"
  - "Past tense event names: page_viewed, product_viewed, added_to_cart, purchase_completed"

patterns-established:
  - "Analytics hook pattern: useAnalytics() returns trackEvent function"
  - "Automatic tracking: useTrackPageView detects route changes automatically"
  - "E-commerce tracking: Dedicated hooks for product_viewed, added_to_cart, purchase_completed"
  - "Anonymous user tracking: getAnonymousId() provides consistent ID across sessions"

# Metrics
duration: 8min
completed: 2026-02-12
---

# Phase 01 Plan 03: Event Tracking System Summary

**Event tracking system with automatic page view tracking, anonymous user identification via localStorage, and dedicated hooks for e-commerce events (product_viewed, added_to_cart, purchase_completed).**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-12T11:26:26Z
- **Completed:** 2026-02-12T11:34:26Z
- **Tasks:** 5
- **Files modified:** 6

## Accomplishments

- Created trackEvent mutation that records to analyticsEvents table AND updates all three aggregates
- Built useAnalytics hook with trackEvent function for manual event tracking
- Implemented useTrackPageView for automatic page view tracking on route changes
- Added useTrackProductView, useTrackAddToCart, useTrackPurchase for e-commerce
- Anonymous ID generation and persistence in localStorage
- Integrated tracking into App.tsx and ProductPage.tsx
- Cleaned up old tracking code in ShopPage.tsx

## Task Commits

Each task was committed atomically:

1. **Task 1: Create trackEvent mutation** - `7703660` (feat)
2. **Task 2: Update analytics module exports** - `e5210d8` (feat)
3. **Task 3: Create useAnalytics hook** - `2270dac` (feat)
4. **Task 4: Integrate page view tracking** - `44a6f7d` (feat)
5. **Task 5: Track product views** - `3102345` (feat)
6. **ShopPage cleanup** - `483e833` (refactor)

**Plan metadata:** [to be committed with docs]

## Files Created/Modified

- `convex/analytics/events.ts` - trackEvent and identifyUser mutations with aggregate updates
- `apps/storefront/hooks/useAnalytics.ts` - Analytics hooks (useAnalytics, useTrackPageView, useTrackProductView, useTrackAddToCart, useTrackPurchase)
- `convex/analytics/index.ts` - Added event mutation exports
- `apps/storefront/App.tsx` - Added useTrackPageView() call for automatic tracking
- `apps/storefront/pages/ProductPage.tsx` - Updated to use new analytics hooks
- `apps/storefront/pages/ShopPage.tsx` - Removed redundant old tracking code

## Decisions Made

1. **insertIfDoesNotExist for aggregates** - Prevents duplicate entries if same event processed twice
2. **Silent error handling** - Analytics failures don't break the user experience (console.warn only)
3. **Past tense event names** - Consistent naming: page_viewed, product_viewed, added_to_cart
4. **localStorage for anonymous ID** - Persists across sessions until explicitly cleared
5. **Centralized page tracking** - useTrackPageView in App.tsx handles all routes automatically

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created missing aggregates.ts file dependency**
- **Found during:** Task 1 (Create trackEvent mutation)
- **Issue:** Plan 03 depends on aggregates.ts from Plan 02, but Plan 02 summary wasn't created and aggregates.ts wasn't visible in file list
- **Fix:** Discovered aggregates.ts already exists (commit 76abb55 from Plan 02), proceeded with Plan 03 execution
- **Files verified:** convex/analytics/aggregates.ts exists with proper exports
- **Committed in:** N/A - file already committed in Plan 02

**2. [Rule 1 - Bug] Updated ProductPage to use new analytics hooks**
- **Found during:** Task 5 (Track product views)
- **Issue:** ProductPage was using old `useMutation(api.products.trackEvent)` pattern which doesn't exist
- **Fix:** Replaced with new `useTrackProductView` and `useTrackAddToCart` hooks from useAnalytics
- **Files modified:** apps/storefront/pages/ProductPage.tsx
- **Verification:** Component now imports from analytics hook and uses proper tracking
- **Committed in:** 3102345 (Task 5 commit)

**3. [Rule 2 - Missing Critical] Cleaned up redundant tracking in ShopPage**
- **Found during:** Task 5 verification
- **Issue:** ShopPage had manual page view tracking that's now redundant with automatic useTrackPageView
- **Fix:** Removed useMutation import and manual trackEvent call, since App.tsx handles all page views
- **Files modified:** apps/storefront/pages/ShopPage.tsx
- **Verification:** ShopPage no longer has tracking code, relies on automatic tracking
- **Committed in:** 483e833 (separate cleanup commit)

---

**Total deviations:** 3 auto-fixed (1 blocking, 1 bug, 1 missing critical)
**Impact on plan:** All fixes necessary for correctness. No scope creep - all within analytics tracking scope.

## Issues Encountered

1. **TypeScript compilation errors in project** - Pre-existing errors in other files (not analytics-related). The aggregates.ts and events.ts files compile correctly against Convex types.

2. **Old tracking code existed** - ProductPage and ShopPage had old tracking patterns that needed migration to new system.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Event tracking system is ready for dashboard queries
- trackEvent mutation can be called from any component
- Aggregates are being updated automatically on every event
- Ready for Plan 04: Dashboard queries and visualization

## Self-Check: PASSED

- [x] convex/analytics/events.ts exists with trackEvent and identifyUser
- [x] apps/storefront/hooks/useAnalytics.ts exists with all tracking hooks
- [x] convex/analytics/index.ts exports trackEvent and identifyUser
- [x] App.tsx calls useTrackPageView()
- [x] ProductPage uses useTrackProductView and useTrackAddToCart
- [x] All commits present (7703660, e5210d8, 2270dac, 44a6f7d, 3102345, 483e833)
- [x] SUMMARY.md created

---
*Phase: 01-analytics*
*Completed: 2026-02-12*
