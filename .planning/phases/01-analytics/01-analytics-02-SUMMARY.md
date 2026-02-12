---
phase: 01-analytics
plan: 02
subsystem: analytics
tags:
  - convex
  - aggregate
  - analytics
  - typescript
  - table-aggregate

# Dependency graph
requires:
  - phase: 01-analytics-01
    provides: "@convex-dev/aggregate package and convex.config.ts"
provides:
  - "Three TableAggregate instances (dailyViews, activeUsers, productViews)"
  - "Date bucketing utilities for time-series aggregation"
  - "Typed aggregate exports through analytics module"
affects:
  - 01-analytics-03
  - 01-analytics-04

# Tech tracking
tech-stack:
  added:
    - "TableAggregate class from @convex-dev/aggregate"
  patterns:
    - "Time-series aggregation with UTC date bucketing"
    - "Composite key aggregates for multi-dimensional metrics"
    - "Filter aggregates by event type using null returns"

key-files:
  created:
    - convex/analytics/aggregates.ts
  modified:
    - convex/analytics/index.ts

key-decisions:
  - "Using UTC for all date operations to ensure consistent behavior across timezones"
  - "Composite keys [date, dimension] enable efficient filtering by date range AND category"
  - "Returning null from sortKey filters out events that shouldn't be aggregated"

patterns-established:
  - "Date utility functions: getDayKey, getWeekKey, getMonthKey for consistent bucketing"
  - "Aggregate pattern: sortKey filters by event type, sumValue counts occurrences"
  - "User identification: check both userId and anonymousId for complete tracking"

# Metrics
duration: 1min
completed: 2026-02-12
---

# Phase 01 Plan 02: TableAggregate Instances Summary

**Three TableAggregate instances (dailyViews, activeUsers, productViews) with UTC date bucketing utilities for scalable O(log N) analytics queries.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-12T11:26:04Z
- **Completed:** 2026-02-12T11:27:42Z
- **Tasks:** 5
- **Files modified:** 2

## Accomplishments

- Created date utility functions (getDayKey, getWeekKey, getMonthKey, getStartOfDay, getEndOfDay)
- Implemented dailyViewsAggregate for tracking page views per day
- Implemented activeUsersAggregate with composite [date, userId] key for DAU/WAU/MAU metrics
- Implemented productViewsAggregate with composite [date, productId] key for per-product analytics
- Updated analytics module index.ts to export all aggregates and utilities
- All aggregates use UTC handling for consistent timezone behavior

## Task Commits

Each task was committed atomically:

1. **Tasks 1-4: Create date utilities and TableAggregate instances** - `76abb55` (feat)
   - getDayKey, getWeekKey, getMonthKey utilities
   - dailyViewsAggregate, activeUsersAggregate, productViewsAggregate
2. **Task 5: Update analytics module index exports** - `8c3fd53` (feat)
   - Export all aggregates and utilities through analytics module

**Plan metadata:** [to be committed with docs]

## Files Created/Modified

- `convex/analytics/aggregates.ts` - Date utilities and three TableAggregate instances
- `convex/analytics/index.ts` - Module exports for aggregates and utilities

## Decisions Made

1. **UTC for all date operations** - Using UTC ensures consistent behavior regardless of server or client timezone
2. **Composite keys for multi-dimensional metrics** - [date, userId] and [date, productId] enable efficient queries filtered by both dimensions
3. **Null filtering in sortKey** - Events that don't match criteria return null and are excluded from aggregation
4. **Both userId and anonymousId** - Checking both captures both authenticated and anonymous user activity

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript compilation verified, all component types properly generated.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- TableAggregate instances are ready for use in mutations
- Next plan (01-analytics-03) can proceed with trackEvent mutation
- Aggregate infrastructure is fully typed and exported
- Date utilities available for consistent bucketing

## Self-Check: PASSED

- [x] convex/analytics/aggregates.ts exists
- [x] convex/analytics/index.ts exports all aggregates
- [x] dailyViews component type exists in _generated/api.d.ts
- [x] activeUsers component type exists in _generated/api.d.ts
- [x] productViews component type exists in _generated/api.d.ts
- [x] Commit 76abb55 exists (aggregates creation)
- [x] Commit 8c3fd53 exists (index exports)

---
*Phase: 01-analytics*
*Completed: 2026-02-12*
