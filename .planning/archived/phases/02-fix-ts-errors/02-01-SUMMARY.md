---
phase: 02-fix-ts-errors
plan: 01
subsystem: types

tags: [typescript, shared-types, cart-rules, product]

requires: []

provides:
  - Clean type definitions without duplicate declarations
  - Consistent number types for Product fields
  - Proper discriminated union support for CartRule configs

affects:
  - packages/storefront
  - packages/admin
  - Any component using Product or CartRule types

tech-stack:
  added: []
  patterns:
    - Type aliases over enums for string literal unions
    - Consistent primitive types (number vs bigint)

key-files:
  created: []
  modified:
    - packages/shared-types/src/index.ts

key-decisions:
  - "Type aliases preferred over enums for CartRuleType and CartRuleStatus for better discriminated union support"
  - "Changed bigint to number for Product.quantityInStock and Product.vintage to match component expectations"

patterns-established: []

duration: 2 min
completed: 2026-02-13
---

# Phase 02 Plan 01: Fix TypeScript Errors in Shared Types Summary

**Cleaned shared-types by removing duplicate declarations and fixing bigint type inconsistencies**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-13T13:37:16Z
- **Completed:** 2026-02-13T13:38:47Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- Removed duplicate enum declarations for CartRuleType and CartRuleStatus
- Changed Product.quantityInStock from `number | bigint` to `number`
- Changed Product.vintage from `number | bigint` to `number`
- Removed duplicate CartRule interface declaration
- Verified TypeScript compilation passes with `npx tsc --noEmit`

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove duplicate enum declarations** - `7c326f8` (fix)
2. **Task 2: Change Product bigint types to number** - `afe0b43` (fix)
3. **Task 3: Remove duplicate CartRule interface** - `43bc42c` (fix)

**Plan metadata:** `[to be committed]` (docs: complete plan)

## Files Created/Modified

- `packages/shared-types/src/index.ts` - Removed duplicate type declarations and fixed bigint types

## Decisions Made

- Type aliases preferred over enums for CartRuleType and CartRuleStatus because they provide better discriminated union support for CartRuleConfig
- Changed bigint to number for Product.quantityInStock and Product.vintage because frontend components expect number types (used as React children and passed to functions)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all TypeScript errors resolved successfully.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Shared types are now clean and consistent
- TypeScript compilation passes without errors
- Frontend and backend can safely use these types
- Ready for Phase 02 Plan 02

---
*Phase: 02-fix-ts-errors*
*Completed: 2026-02-13*
