---
phase: refactor-admin-hooks
plan: 02
type: execute
wave: 1
depends_on:
  - refactor-admin-hooks-01
files_modified:
  - apps/admin/hooks/useOrders.ts
  - apps/admin/pages/Orders.tsx
autonomous: true

must_haves:
  truths:
    - "Orders.tsx is under 100 lines (from 250 lines)"
    - "All order list logic is in useOrders hook"
    - "Status counts computed in hook, not component"
    - "No parallel state - single source of truth"
    - "Component uses same pattern as useUsers"
  artifacts:
    - path: "apps/admin/hooks/useOrders.ts"
      provides: "Consolidated order list state management"
      exports: ["useOrders", "UseOrdersReturn"]
    - path: "apps/admin/pages/Orders.tsx"
      provides: "Simplified order management page"
      max_lines: 100
  key_links:
    - from: "Orders.tsx"
      to: "useOrders"
      via: "hook call"
      pattern: "const { filteredOrders, pagination, statusCounts, handlers } = useOrders()"
---

<objective>
Refactor Orders.tsx from 250 lines to under 100 lines by extracting useOrders hook. Consolidate 10 useState calls and complex filtering logic into a focused hook following the established useProductEditor/useUsers pattern.

Purpose: Simplify order management and establish consistent hook pattern
Output: useOrders hook + simplified Orders.tsx
</objective>

<execution_context>
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/pages/Orders.tsx
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/hooks/useUsers.ts

Orders.tsx has similar patterns to Users.tsx but simpler:
- 250 lines of code
- 10 useState calls
- Complex date filtering logic
- Status counts computation
- Chip-based filtering combined with dropdown filters

Current useState breakdown:
- activeChip: string ('all' or specific status) - chip filter
- searchTerm: string
- statusFilter: string ('all' or specific) - dropdown filter
- dateFilter: string ('all', 'today', 'week', 'month')
- selectedOrders: string[]
- currentPage: number
- deleteDialogOpen: boolean
- orderToDelete: any
- isCancelling: boolean

Key complexity: isWithinDateRange() function with date math
Key complexity: Combining chip filter + dropdown filter + date filter

Depends on: refactor-admin-hooks-01 (establishes useUsers pattern to follow)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create useOrders hook</name>
  <files>apps/admin/hooks/useOrders.ts</files>
  <action>
Create a useOrders hook that consolidates all order management logic:

1. **Data fetching**:
   - useQuery for api.orders.listAll with status filter from activeChip
   - Loading state
   - Convex mutation for updateOrderStatus

2. **Filter state** (useState):
   - activeChip: string ('all' or OrderStatus)
   - searchTerm: string
   - statusFilter: string ('all' or OrderStatus) - dropdown
   - dateFilter: string ('all' | 'today' | 'week' | 'month')
   
3. **Selection state**:
   - selectedOrders: string[]
   - toggleOrderSelection, selectAll, clearSelection handlers

4. **Pagination state**:
   - currentPage: number
   - ordersPerPage: constant (10)
   - totalPages: computed
   - paginatedOrders: computed

5. **Delete dialog state**:
   - deleteDialogOpen: boolean
   - orderToDelete: Order | null
   - isCancelling: boolean

6. **Computed values** (useMemo):
   - statusCounts: Record<string, number> - counts per status for chips
   - filteredOrders: apply search + status dropdown + status chip + date filters
   - paginatedOrders: slice filtered by pagination

7. **Date filtering helper** (extract from component):
   ```typescript
   const isWithinDateRange = (dateStr: string, range: string): boolean => {
     // Move existing logic here
   };
   ```

8. **Handlers**:
   - setActiveChip, setSearchTerm, setStatusFilter, setDateFilter
   - setCurrentPage
   - toggleOrderSelection, selectAllOrders, clearSelection
   - openDeleteDialog, closeDeleteDialog, confirmDelete
   - updateOrderStatus

9. **Return structure**:
   ```typescript
   return {
     orders,
     isLoading,
     state: {
       filteredOrders,
       paginatedOrders,
       totalPages,
       currentPage,
       ordersPerPage,
       selectedOrders,
       statusCounts,
       deleteDialog: {
         isOpen: deleteDialogOpen,
         order: orderToDelete,
         isCancelling,
       },
       filters: {
         activeChip,
         searchTerm,
         statusFilter,
         dateFilter,
       },
     },
     handlers: {
       setActiveChip,
       setSearchTerm,
       setStatusFilter,
       setDateFilter,
       setCurrentPage,
       toggleOrderSelection,
       selectAllOrders,
       clearSelection,
       openDeleteDialog,
       closeDeleteDialog,
       confirmDelete,
       updateOrderStatus,
     },
   }
   ```

Include proper TypeScript interfaces and use @ts-nocheck for Convex types.
Include toaster notifications for success/error on mutations.
  </action>
  <verify>
    - Hook file exists with all exports
    - Date filtering logic moved from component
    - Status counts computed in hook
    - All filter combinations work correctly
  </verify>
  <done>useOrders hook created with filtering, pagination, and dialog management</done>
</task>

<task type="auto">
  <name>Task 2: Refactor Orders.tsx to use hook</name>
  <files>apps/admin/pages/Orders.tsx</files>
  <action>
Rewrite Orders.tsx to be a thin presentation component using useOrders hook:

1. **Replace all state management with hook**:
   ```typescript
   const { orders, isLoading, state, handlers } = useOrders();
   const navigate = useNavigate();
   
   const { 
     filteredOrders, 
     paginatedOrders, 
     totalPages, 
     currentPage,
     selectedOrders,
     statusCounts,
     deleteDialog,
     filters 
   } = state;
   
   const {
     setActiveChip,
     setSearchTerm,
     setStatusFilter,
     setDateFilter,
     setCurrentPage,
     toggleOrderSelection,
     selectAllOrders,
     clearSelection,
     openDeleteDialog,
     closeDeleteDialog,
     confirmDelete,
     updateOrderStatus,
   } = handlers;
   ```

2. **Remove ALL business logic**:
   - Delete all 10 useState declarations
   - Delete isWithinDateRange() function (moved to hook)
   - Delete filteredOrders computation
   - Delete paginatedOrders computation
   - Delete statusCounts computation
   - Delete all mutation calls
   - Delete handleDelete, handleConfirmDelete functions

3. **Keep only presentation logic**:
   - Loading state rendering
   - Breadcrumbs
   - PageHeader
   - OrdersFilterToolbar with handlers
   - OrderStatusChips with statusCounts
   - OrdersTable with paginatedOrders
   - DeleteConfirmationDialog with deleteDialog state
   - Button to view order details (navigate)

4. **Update component JSX**:
   - Pass state and handlers to child components
   - Wire delete dialog to deleteDialog state and handlers
   - Pass statusCounts to OrderStatusChips

5. **Target line count: under 100 lines**

Use @ts-nocheck at the top for Convex type issues.
  </action>
  <verify>
    - Orders.tsx under 100 lines (from 250)
    - No useState for orders/pagination/filters
    - Uses useOrders hook exclusively
    - Status chips show correct counts
    - Date filtering works
    - All functionality preserved
    - Build passes
  </verify>
  <done>Orders.tsx refactored to pure presentation component</done>
</task>

</tasks>

<verification>
[Phase-level verification]

1. **Line count check**: Orders.tsx must be under 100 lines (down from 250)
2. **State consolidation**: All state in useOrders hook
3. **Date filtering**: Logic moved to hook, works correctly
4. **Status counts**: Computed in hook, displayed in chips
5. **No regressions**: All existing functionality preserved
6. **Build passes**: TypeScript compiles without errors
</verification>

<success_criteria>
[Measurable completion criteria]

- Orders.tsx: 250 lines → under 100 lines ✓
- useState count: 10 → 0 in component ✓
- useOrders hook exists with filters/pagination/dialogs ✓
- Date filtering logic extracted from component ✓
- Status counts computed in hook ✓
- All existing functionality works ✓
</success_criteria>

<output>
After completion, create `.planning/phases/refactor-admin-hooks/refactor-admin-hooks-02-SUMMARY.md`

Include:
- What was refactored
- Before/after metrics (lines, useState count)
- useOrders API
- Pattern consistency with useUsers
</output>
