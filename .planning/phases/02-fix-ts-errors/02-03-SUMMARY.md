---
phase: 02-fix-ts-errors
plan: 03
subsystem: admin-ui
tags: [typescript, convex, react-hook-form, chakra-ui]

# Dependency graph
requires:
  - phase: 02-fix-ts-errors
    provides: "Fixed shared types from Plan 02-01"
provides:
  - Admin hooks with proper TypeScript types
  - Admin pages with correct useQuery arguments
  - Fixed Id generic type constraints
affects:
  - admin-hooks
  - admin-pages

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Use 'as const' for string literal types matching union types"
    - "Always pass second argument to useQuery (empty object when no args)"
    - "Use boolean return type for validation functions with dynamic table names"

key-files:
  created: []
  modified:
    - apps/admin/hooks/useCartRuleEditor.ts
    - apps/admin/pages/CartRules.tsx
    - apps/admin/pages/Coupons.tsx
    - apps/admin/pages/Users.tsx
    - apps/admin/pages/OrderDetails.tsx

key-decisions:
  - "Use handleSubmit wrapper pattern instead of handleSubmit(onSubmit)() for better TypeScript compatibility"
  - "Change isValidConvexId to return boolean instead of type predicate to avoid Id<typeof tableName> constraint issues"

patterns-established:
  - "String literals with 'as const' assertion for union type compatibility"
  - "useQuery always receives second argument even when empty"
  - "Type assertions at call sites for Id validation helpers"

duration: 2min
completed: 2026-02-13
---

# Phase 02 Plan 03: Fix Admin Hooks and Pages TypeScript Errors Summary

**Fixed TypeScript type compatibility in admin hooks and pages for proper integration with shared types and Convex queries**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-13T13:48:47Z
- **Completed:** 2026-02-13T13:51:18Z
- **Tasks:** 4
- **Files modified:** 5

## Accomplishments
- Fixed useCartRuleEditor status type with 'as const' assertion for CartRuleStatus compatibility
- Fixed handleSubmit type mismatch using wrapper pattern for react-hook-form
- Added required second argument to all useQuery calls across admin pages
- Fixed Id generic constraint issues in Users.tsx and OrderDetails.tsx

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix useCartRuleEditor status type** - `7e177ca` (fix)
2. **Task 2: Fix useCartRuleEditor handleSubmit type** - `0aba55d` (fix)
3. **Task 3: Fix useQuery missing arguments** - `e939af6` (fix)
4. **Task 4: Fix Id generic constraint** - `3d04e6f` (fix)

**Plan metadata:** `TBD` (docs: complete plan)

## Files Created/Modified
- `apps/admin/hooks/useCartRuleEditor.ts` - Fixed status type and handleSubmit pattern
- `apps/admin/pages/CartRules.tsx` - Added second argument to useQuery
- `apps/admin/pages/Coupons.tsx` - Added second argument to useQuery
- `apps/admin/pages/Users.tsx` - Fixed useQuery and isValidConvexId constraint
- `apps/admin/pages/OrderDetails.tsx` - Fixed isValidConvexId constraint

## Decisions Made
- Used handleSubmit wrapper pattern: `handleSubmit(async (data) => { await onSubmit(data); })` instead of calling handleSubmit(onSubmit)() directly
- Changed isValidConvexId return type from `id is Id<typeof tableName>` to `boolean` to avoid TypeScript constraint errors with dynamic table names

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Chakra UI type errors (TS2322) related to SelectTriggerProps, DialogCloseTriggerProps, etc. - These are pre-existing issues unrelated to the TypeScript fixes in this plan

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Admin hooks and pages now have proper TypeScript types
- Ready for continued TypeScript error fixes in other parts of the codebase
- Can proceed with Plan 02-04

---
*Phase: 02-fix-ts-errors*
*Completed: 2026-02-13*
