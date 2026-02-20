---
phase: refactor-admin-hooks
plan: 02
subsystem: ui

tags:
  - react-hooks
  - state-management
  - convex
  - orders

requires:
  - phase: refactor-product-editor
    provides: useProductEditor hook pattern to follow

provides:
  - useOrders hook consolidating order list state management
  - Simplified Orders.tsx presentation component
  - Pattern for combining chip + dropdown + date filters
  - Status counts computation in hook, not component

affects:
  - refactor-admin-hooks-03 (if exists)
  - Any future order management features

tech-stack:
  added: []
  patterns:
    - "useOrders hook following state/handlers return structure"
    - "Computed values via useMemo in hooks"
    - "Date filtering helper extracted to hook"

key-files:
  created:
    - apps/admin/hooks/useOrders.ts
  modified:
    - apps/admin/pages/Orders.tsx

key-decisions:
  - "Consolidated 10 useState calls into single useOrders hook"
  - "Extracted isWithinDateRange() date filtering logic to hook"
  - "Status counts computed in hook via useMemo, not in component"
  - "Orders.tsx reduced to pure presentation component"

patterns-established:
  - "useOrders hook: state/handlers structure like useProductEditor"
  - "Filter reset on change: setCurrentPage(1) in handlers"
  - "Complex filtering (chip + dropdown + date) in useMemo"
  - "Dialog state managed in hook, passed as deleteDialog object"

duration: 2min
completed: 2026-02-20T07:50:57Z
---

# Phase refactor-admin-hooks Plan 02: Extract useOrders Hook Summary

**Extracted useOrders hook consolidating 10 useState calls and complex filtering, reducing Orders.tsx from 251 lines to 48 lines (81% reduction)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-20T07:49:26Z
- **Completed:** 2026-02-20T07:50:57Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `useOrders` hook (293 lines) with complete order management logic
- Refactored `Orders.tsx` from 251 lines to 48 lines (81% reduction)
- Eliminated 10 useState calls from component
- Extracted `isWithinDateRange()` date filtering function to hook
- Status counts now computed in hook via useMemo
- Component now pure presentation layer using hook API

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useOrders hook** - `7276202` (feat)
2. **Task 2: Refactor Orders.tsx to use hook** - `1407643` (refactor)

**Plan metadata:** (to be committed)

## Files Created/Modified

- `apps/admin/hooks/useOrders.ts` - New hook consolidating order list state (293 lines)
  - Data fetching with useQuery for api.orders.listAll
  - Filter state: activeChip, searchTerm, statusFilter, dateFilter
  - Selection state: selectedOrders with toggle/selectAll/clear handlers
  - Pagination: currentPage, totalPages, paginatedOrders
  - Delete dialog state: deleteDialogOpen, orderToDelete, isCancelling
  - Computed values: statusCounts, filteredOrders via useMemo
  - Date filtering helper: isWithinDateRange() function
  - Full handlers API: 13 handlers for all UI interactions
  - Toaster notifications for success/error on mutations

- `apps/admin/pages/Orders.tsx` - Simplified presentation component (48 lines, was 251)
  - Uses useOrders hook exclusively
  - Destructures state and handlers from hook
  - Renders UI components with data from hook
  - No state management, no business logic

## useOrders Hook API

```typescript
const { orders, isLoading, state, handlers } = useOrders();

// State structure
state: {
  filteredOrders: Order[],
  paginatedOrders: Order[],
  selectedOrders: string[],
  statusCounts: Record<string, number>,
  deleteDialog: { isOpen, order, isCancelling },
  filters: { activeChip, searchTerm, statusFilter, dateFilter },
  pagination: { currentPage, totalPages, ordersPerPage }
}

// Handlers
handlers: {
  setActiveChip, setSearchTerm, setStatusFilter, setDateFilter,
  setCurrentPage, toggleOrderSelection, selectAllOrders, clearSelection,
  openDeleteDialog, closeDeleteDialog, confirmDelete, updateOrderStatus
}
```

## Pattern Consistency

The useOrders hook follows the same pattern as useProductEditor and useCartRuleEditor:

1. **State/Handlers split**: Return object has `state` and `handlers` properties
2. **Computed values**: useMemo for filteredOrders, statusCounts, pagination
3. **Filter reset**: setCurrentPage(1) when filters change
4. **Dialog management**: Boolean state + data state + loading state
5. **Toaster integration**: Success/error notifications for mutations

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Before/After Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Orders.tsx lines | 251 | 48 | -81% |
| useState in component | 10 | 0 | -100% |
| Business logic in component | All | None | Moved to hook |
| Component responsibility | Logic + UI | UI only | Separation |

## Self-Check: PASSED

- [x] useOrders hook exists at apps/admin/hooks/useOrders.ts
- [x] Orders.tsx under 100 lines (48 lines)
- [x] Build passes without errors
- [x] All exports present (useOrders, UseOrdersReturn interfaces)
- [x] Commits recorded (7276202, 1407643)

## Next Phase Readiness

- useOrders hook ready for use in other order management components
- Pattern established for future admin page hooks
- Ready for additional order-related features (bulk actions, export, etc.)

---
*Phase: refactor-admin-hooks*
*Completed: 2026-02-20*
