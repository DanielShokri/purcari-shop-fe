---
phase: 07-optimize-loading
plan: 02
subsystem: ui
tags: [react, convex, cache, loading-state]

# Dependency graph
requires:
  - phase: 07-optimize-loading
    provides: useCachedQuery hook with hasEverLoaded state
provides:
  - All admin list pages use cache-aware loading
  - LoadingState component with variant prop
affects: [admin-pages, loading-performance]

# Tech tracking
tech-stack:
  added: []
  patterns: [cache-aware-loading, hasEverLoaded-pattern]

key-files:
  created: []
  modified:
    - apps/admin/components/shared/LoadingState.tsx
    - apps/admin/pages/Products.tsx
    - apps/admin/pages/Orders.tsx
    - apps/admin/pages/Users.tsx
    - apps/admin/pages/Categories.tsx
    - apps/admin/pages/Coupons.tsx
    - apps/admin/pages/CartRules.tsx

key-decisions:
  - "LoadingState variant prop: 'full' for first load, 'subtle' for background refresh"
  - "Only show spinner when isLoading AND !hasEverLoaded - return visits show cached data instantly"

patterns-established:
  - "Cache-aware loading: if (isLoading && !hasEverLoaded) return <LoadingState />"

requirements-completed: []

# Metrics
duration: 5 min
completed: 2026-02-20T13:11:34Z
---

# Phase 07 Plan 02: Cache-Aware Loading States Summary

**Smart loading states across all admin list pages - return visits show data instantly without spinner**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-20T13:07:06Z
- **Completed:** 2026-02-20T13:11:34Z
- **Tasks:** 7
- **Files modified:** 7

## Accomplishments
- Enhanced LoadingState component with variant prop ('full' or 'subtle')
- Updated all 6 admin list pages to use cache-aware loading pattern
- Return visits to any page now show data instantly from Convex cache

## Task Commits

Each task was committed atomically:

1. **Task 1: Enhance LoadingState component** - `968616e` (feat)
2. **Task 2: Update Products page** - `bc3da9f` (feat)
3. **Task 3: Update Orders page** - `249c7d3` (feat)
4. **Task 4: Update Users page** - `15d871a` (feat)
5. **Task 5: Update Categories page** - `35836b7` (feat)
6. **Task 6: Update Coupons page** - `5eadee5` (feat)
7. **Task 7: Update CartRules page** - `bbb2340` (feat)

**Plan metadata:** (to be created)

## Files Created/Modified
- `apps/admin/components/shared/LoadingState.tsx` - Added variant prop for full/subtle loading states
- `apps/admin/pages/Products.tsx` - Uses hasEverLoaded for cache-aware loading
- `apps/admin/pages/Orders.tsx` - Uses hasEverLoaded for cache-aware loading
- `apps/admin/pages/Users.tsx` - Uses hasEverLoaded for cache-aware loading
- `apps/admin/pages/Categories.tsx` - Uses hasEverLoaded for cache-aware loading
- `apps/admin/pages/Coupons.tsx` - Uses hasEverLoaded for cache-aware loading
- `apps/admin/pages/CartRules.tsx` - Uses hasEverLoaded for cache-aware loading

## Decisions Made
- LoadingState variant="full" (default): Big centered spinner for first load
- LoadingState variant="subtle": Small inline indicator for background refresh scenarios
- Only show spinner when `isLoading && !hasEverLoaded` - this means:
  - First visit (cold cache): isLoading=true, hasEverLoaded=false → show spinner
  - Return visit (warm cache): isLoading=false OR hasEverLoaded=true → show data immediately

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- All admin list pages now use cache-aware loading
- LoadingState component supports both full and subtle variants
- Ready for Phase 07 Plan 03 (if any) or next phase

---
*Phase: 07-optimize-loading*
*Completed: 2026-02-20*
