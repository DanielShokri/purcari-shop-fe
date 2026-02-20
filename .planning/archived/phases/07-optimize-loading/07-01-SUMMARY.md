---
phase: 07-optimize-loading
plan: 01
subsystem: admin-hooks
tags: [convex, react-hooks, caching, performance]

# Dependency graph
requires:
  - phase: 06-refactor-admin-hooks
    provides: useEntityList, useOrders, useUsers, useCategories hooks
provides:
  - useCachedQuery hook with cache detection
  - Updated hooks with hasEverLoaded and isRefreshing
affects: [07-02, 07-03]

# Tech tracking
tech-stack:
  added: [useCachedQuery hook]
  patterns: [cache-aware loading states]

key-files:
  created: [apps/admin/hooks/useCachedQuery.ts]
  modified:
    - apps/admin/hooks/useEntityList.ts
    - apps/admin/hooks/useOrders.ts
    - apps/admin/hooks/useUsers.ts
    - apps/admin/hooks/useCategories.ts

key-decisions:
  - "useCachedQuery wraps useQuery with cache state tracking"
  - "hasEverLoaded tracks if data has been loaded at least once"
  - "isRefreshing = true when fetching but data already exists"

patterns-established:
  - "Cache-aware loading: isLoading only on first visit"
  - "Return visits show data instantly from Convex cache"

requirements-completed: []

# Metrics
duration: 4 min
completed: 2026-02-20T13:02:48Z
---

# Phase 07 Plan 01: Cache-Aware Loading Hooks Summary

**Smart loading hooks that eliminate unnecessary spinners on page navigation using Convex cache detection**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-20T12:58:45Z
- **Completed:** 2026-02-20T13:02:48Z
- **Tasks:** 5
- **Files modified:** 5

## Accomplishments
- Created useCachedQuery hook that tracks cache state
- Updated useEntityList with hasEverLoaded and isRefreshing
- Updated useOrders with hasEverLoaded and isRefreshing
- Updated useUsers with hasEverLoaded and isRefreshing
- Updated useCategories with hasEverLoaded and isRefreshing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useCachedQuery hook with cache detection** - `6fe065e` (feat)
2. **Task 2: Update useEntityList to track cache state** - `b746b7f` (feat)
3. **Task 3: Update useOrders to track cache state** - `3d471fc` (feat)
4. **Task 4: Update useUsers to track cache state** - `af8104a` (feat)
5. **Task 5: Update useCategories to track cache state** - `e84b448` (feat)

**Plan metadata:** `22e0b5f` (docs: complete plan)

## Files Created/Modified
- `apps/admin/hooks/useCachedQuery.ts` - New hook with cache detection logic
- `apps/admin/hooks/useEntityList.ts` - Updated with useCachedQuery
- `apps/admin/hooks/useOrders.ts` - Updated with useCachedQuery
- `apps/admin/hooks/useUsers.ts` - Updated with useCachedQuery
- `apps/admin/hooks/useCategories.ts` - Updated with useCachedQuery

## Decisions Made
- Used useRef to track previous data for refresh detection
- hasEverLoaded state persists across renders
- isRefreshing = true when data exists but query is pending

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 02: Update list pages (Products, Orders, Users, Categories, Coupons, CartRules) can now use the hasEverLoaded and isRefreshing states from the hooks
- Plan 03: Update Dashboard, Analytics, and detail pages can also leverage the cache-aware loading pattern

---
*Phase: 07-optimize-loading*
*Completed: 2026-02-20*
