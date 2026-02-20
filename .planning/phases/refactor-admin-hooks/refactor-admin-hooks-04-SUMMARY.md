---
phase: refactor-admin-hooks
plan: 04
subsystem: ui

tags: [react, hooks, typescript, convex, generic, refactoring]

requires:
  - phase: refactor-admin-hooks-03
    provides: useCategories hook pattern
  - phase: refactor-admin-hooks-01
    provides: useUsers hook pattern for list management

provides:
  - Generic useEntityList<T> hook for entity list management
  - Pattern for consolidating filter/pagination/selection logic
  - Server-side and client-side filtering support
  - Simplified Coupons, CartRules, and Products pages

affects:
  - refactor-admin-hooks-05
  - Any future entity list pages

tech-stack:
  added:
    - useEntityList hook with generic TypeScript support
  patterns:
    - "Generic hooks with <T extends { _id: string }> for type safety"
    - "Dynamic filter configuration with server-side (queryArg) and client-side support"
    - "State/handlers return structure for complex hook APIs"

key-files:
  created:
    - apps/admin/hooks/useEntityList.ts (298 lines)
  modified:
    - apps/admin/pages/Coupons.tsx (132→74 lines, 44% reduction)
    - apps/admin/pages/CartRules.tsx (125→74 lines, 41% reduction)
    - apps/admin/pages/Products.tsx (150→44 lines, 71% reduction)

key-decisions:
  - "Added queryArg option to FilterConfig to support server-side filtering (Products category filter)"
  - "Made selection optional via enableSelection flag to support pages with/without bulk operations"
  - "Used dynamic Record<string, string> for filter state to support any number of filters"
  - "Kept delete dialog state in hook for consistency across all entity pages"

patterns-established:
  - "useEntityList<T>: Generic hook for entity lists with filtering, pagination, selection, delete"
  - "FilterConfig with queryArg for hybrid server/client filtering"
  - "Return { items, isLoading, state, handlers } structure for complex state management"

duration: 4min
completed: 2026-02-20
---

# Phase refactor-admin-hooks Plan 04: Generic Entity List Hook Summary

**Generic useEntityList<T> hook consolidating filter/pagination/selection patterns across Coupons, CartRules, and Products pages, reducing total lines from 407 to 192 (53% reduction)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-20T07:56:09Z
- **Completed:** 2026-02-20T08:00:14Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments

- Created generic useEntityList<T> hook (298 lines) with TypeScript generics
- Supports both client-side and server-side filtering via queryArg option
- Optional bulk selection with enableSelection flag
- Delete dialog management with confirmDelete handler
- Refactored Coupons.tsx: 132→74 lines (44% reduction)
- Refactored CartRules.tsx: 125→74 lines (41% reduction)
- Refactored Products.tsx: 150→44 lines (71% reduction)
- Eliminated 23 useState declarations across 3 pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Create generic useEntityList hook** - `48671df` (feat)
2. **Task 2: Refactor Coupons.tsx** - `a7a1697` (refactor)
3. **Task 3: Refactor CartRules.tsx** - `bc7bd02` (refactor)
4. **Task 4: Refactor Products.tsx** - `6545929` (refactor)

**Plan metadata:** `TBD` (docs: complete plan)

## Files Created/Modified

- `apps/admin/hooks/useEntityList.ts` - Generic hook for entity list management
- `apps/admin/pages/Coupons.tsx` - Simplified to 74 lines using useEntityList
- `apps/admin/pages/CartRules.tsx` - Simplified to 74 lines using useEntityList
- `apps/admin/pages/Products.tsx` - Simplified to 44 lines using useEntityList with server-side filtering

## useEntityList API

```typescript
interface UseEntityListOptions<T> {
  query: any;
  queryArgs?: Record<string, any>;
  filters: FilterConfig<T>[];
  itemsPerPage?: number;
  enableSelection?: boolean;
}

interface FilterConfig<T> {
  key: string;
  field?: keyof T;
  type: 'search' | 'select' | 'status';
  defaultValue?: string;
  queryArg?: string; // For server-side filtering
}

// Usage: Client-side filtering (Coupons, CartRules)
const { items, state, handlers } = useEntityList<Coupon>({
  query: api.coupons.list,
  filters: [
    { key: 'search', type: 'search' },
    { key: 'status', type: 'select', field: 'status', defaultValue: 'all' },
  ],
  itemsPerPage: 10,
});

// Usage: Server-side filtering (Products)
const { items, state, handlers } = useEntityList<Product>({
  query: api.products.list,
  filters: [
    { key: 'search', type: 'search' },
    { key: 'category', type: 'select', defaultValue: 'all', queryArg: 'category' },
  ],
});
```

## Decisions Made

- **queryArg for server-side filtering**: Added optional `queryArg` property to FilterConfig to support Convex queries that filter server-side (e.g., products by category). When set, filter value is passed to the query; when omitted, filtering happens client-side.
- **enableSelection flag**: Made bulk selection optional since not all entity pages need it. Keeps hook API clean for simple lists.
- **Dynamic filter state**: Used `Record<string, string>` instead of fixed properties to support any number of filters without changing hook interface.
- **Delete dialog in hook**: Centralized delete dialog state and handlers in the hook for consistency across all entity pages.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added queryArg support for server-side filtering**
- **Found during:** Task 4 (Products.tsx refactoring)
- **Issue:** Products.tsx was using server-side category filtering via `useQuery(api.products.list, { category: ... })`, but useEntityList only supported client-side filtering
- **Fix:** Added optional `queryArg` property to FilterConfig interface. When set, the filter value is included in the query arguments passed to Convex; when omitted, filtering happens client-side on the returned results
- **Files modified:** apps/admin/hooks/useEntityList.ts
- **Verification:** Products page correctly filters by category server-side while still supporting client-side search
- **Committed in:** 6545929 (Task 4 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for supporting Products page requirements. No scope creep - enhanced hook to handle both filtering patterns.

## Issues Encountered

None - all pages refactored successfully.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- useEntityList pattern ready for any new entity list pages
- Future pages only need: configure filters, use hook, render presentation
- Pattern established for both client-side and server-side filtering

## Self-Check: PASSED

✓ useEntityList.ts exists (298 lines)
✓ Coupons.tsx exists (74 lines, under 80)
✓ CartRules.tsx exists (74 lines, under 80)
✓ Products.tsx exists (44 lines, under 80)
✓ All 4 commits present in git log

---
*Phase: refactor-admin-hooks*
*Completed: 2026-02-20*
