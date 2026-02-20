---
phase: refactor-admin-hooks
plan: 04
type: execute
wave: 3
depends_on:
  - refactor-admin-hooks-03
files_modified:
  - apps/admin/hooks/useEntityList.ts
  - apps/admin/pages/Coupons.tsx
  - apps/admin/pages/CartRules.tsx
  - apps/admin/pages/Products.tsx
autonomous: true

must_haves:
  truths:
    - "Generic useEntityList hook works for Coupons, CartRules, Products"
    - "Each page is under 80 lines (from 124-149 lines)"
    - "No duplicate filter/pagination logic across pages"
    - "Hook is reusable and type-safe"
    - "Pattern established for future entity lists"
  artifacts:
    - path: "apps/admin/hooks/useEntityList.ts"
      provides: "Reusable entity list management hook"
      exports: ["useEntityList", "UseEntityListOptions", "UseEntityListReturn"]
    - path: "apps/admin/pages/Coupons.tsx"
      provides: "Simplified coupons page"
      max_lines: 80
    - path: "apps/admin/pages/CartRules.tsx"
      provides: "Simplified cart rules page"
      max_lines: 80
    - path: "apps/admin/pages/Products.tsx"
      provides: "Simplified products page"
      max_lines: 80
  key_links:
    - from: "Coupons.tsx, CartRules.tsx, Products.tsx"
      to: "useEntityList"
      via: "hook call"
      pattern: "const { items, state, handlers } = useEntityList<T>(options)"
---

<objective>
Create a generic useEntityList hook that consolidates common list+filter+pagination patterns across Coupons.tsx, CartRules.tsx, and Products.tsx. Reduce duplication and establish a reusable pattern for future entity list pages.

Purpose: Eliminate duplicate filter/pagination code across list pages
Output: Generic useEntityList hook + 3 simplified pages
</objective>

<execution_context>
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/pages/Coupons.tsx
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/pages/CartRules.tsx
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/pages/Products.tsx
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/hooks/useUsers.ts

Three pages share nearly identical patterns:

**Coupons.tsx** (131 lines, 8 useState):
- Search filter, status filter
- Pagination (currentPage, itemsPerPage)
- Delete dialog state
- Filtered + paginated items computed

**CartRules.tsx** (124 lines, 8 useState):
- Search filter, type filter, status filter
- Pagination
- Delete dialog state
- Filtered + paginated items computed

**Products.tsx** (149 lines, 7 useState):
- Search filter, category filter, status filter
- Pagination
- Delete dialog state
- Bulk selection (selectedProducts)
- Filtered + paginated items computed

Common pattern across all three:
1. Fetch items from Convex
2. Filter by search text + field filters
3. Paginate filtered results
4. Handle delete with confirmation dialog
5. Render table with items

Differences:
- Filter fields (status, type, category)
- Entity type (Coupon, CartRule, Product)
- Bulk selection (Products has it, others don't)

Solution: Generic useEntityList<T> hook with configuration options
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create generic useEntityList hook</name>
  <files>apps/admin/hooks/useEntityList.ts</files>
  <action>
Create a generic useEntityList<T> hook that handles common entity list patterns:

1. **Generic type parameter**:
   ```typescript
   interface UseEntityListOptions<T> {
     query: any;                    // Convex query function
     queryArgs?: any;               // Arguments for query
     filters?: FilterConfig<T>[];   // Filter configuration
     itemsPerPage?: number;         // Default: 10
     enableSelection?: boolean;     // For bulk operations
   }
   ```

2. **Filter configuration**:
   ```typescript
   interface FilterConfig<T> {
     key: string;
     field: keyof T;                // Which field to filter on
     type: 'search' | 'select' | 'status';
     defaultValue?: string;
   }
   ```

3. **State management**:
   - Dynamic filter state based on filter config
   - currentPage: number
   - selectedItems: string[] (if enableSelection)
   - deleteDialog: { isOpen, item, isDeleting }

4. **Data fetching**:
   - useQuery with provided query function
   - Loading state

5. **Computed values** (useMemo):
   - filteredItems: apply all active filters
   - paginatedItems: slice by pagination
   - totalPages: Math.ceil(filtered.length / perPage)

6. **Handlers**:
   - setFilter(key, value): void
   - setPage(page: number): void
   - toggleSelection(id): void
   - selectAll(): void
   - clearSelection(): void
   - openDeleteDialog(item): void
   - closeDeleteDialog(): void
   - confirmDelete(mutation): Promise<void>

7. **Return structure**:
   ```typescript
   interface UseEntityListReturn<T> {
     items: T[];                    // Raw items from Convex
     isLoading: boolean;
     state: {
       filteredItems: T[];
       paginatedItems: T[];
       totalPages: number;
       currentPage: number;
       itemsPerPage: number;
       filters: Record<string, string>;  // Current filter values
       selectedItems: string[];     // If enableSelection
       deleteDialog: {
         isOpen: boolean;
         item: T | null;
         isDeleting: boolean;
       };
     };
     handlers: {
       setFilter: (key: string, value: string) => void;
       setPage: (page: number) => void;
       toggleSelection: (id: string) => void;
       selectAll: () => void;
       clearSelection: () => void;
       openDeleteDialog: (item: T) => void;
       closeDeleteDialog: () => void;
       confirmDelete: (mutation: any) => Promise<void>;
     };
   }
   ```

8. **Implementation**:
   ```typescript
   export function useEntityList<T extends { _id: string }>(
     options: UseEntityListOptions<T>
   ): UseEntityListReturn<T> {
     // Dynamic filter state using useState with Record
     // Filter application logic
     // Pagination logic
     // Selection logic (if enabled)
     // Delete dialog logic
   }
   ```

Include TypeScript generics for type safety.
Include @ts-nocheck for Convex types.
Document usage examples for each entity type.
  </action>
  <verify>
    - Generic hook file exists
    - Type-safe with generics
    - Handles filters dynamically
    - Works with selection enabled/disabled
    - Delete dialog included
  </verify>
  <done>Generic useEntityList hook created for reusable list management</done>
</task>

<task type="auto">
  <name>Task 2: Refactor Coupons.tsx to use useEntityList</name>
  <files>apps/admin/pages/Coupons.tsx</files>
  <action>
Rewrite Coupons.tsx using useEntityList hook:

1. **Configure the hook**:
   ```typescript
   const { 
     items: coupons, 
     isLoading, 
     state, 
     handlers 
   } = useEntityList<Coupon>({
     query: api.coupons.list,
     filters: [
       { key: 'search', type: 'search' },
       { key: 'status', type: 'select', field: 'status', defaultValue: 'all' },
     ],
     itemsPerPage: 10,
   });
   
   const { paginatedItems, totalPages, filters, deleteDialog } = state;
   const { setFilter, setPage, openDeleteDialog, closeDeleteDialog, confirmDelete } = handlers;
   ```

2. **Remove ALL list management logic**:
   - Delete useState declarations (8 of them)
   - Delete filteredCoupons computation
   - Delete paginatedCoupons computation
   - Delete delete dialog state
   - Delete handleDelete, handleConfirmDelete functions

3. **Keep only presentation**:
   - useNavigate for routing
   - Loading state
   - PageHeader
   - CouponsFilterToolbar with filter handlers
   - CouponsTable with paginated items
   - DeleteConfirmationDialog

4. **Target line count: under 80 lines**

5. **Update imports**:
   ```typescript
   import { useEntityList } from '../hooks/useEntityList';
   import { Coupon } from '@shared/types';
   ```

Use @ts-nocheck at the top for Convex type issues.
  </action>
  <verify>
    - Coupons.tsx under 80 lines (from 131)
    - Uses useEntityList<Coupon>
    - Filters work correctly
    - Pagination works
    - Delete works
    - Build passes
  </verify>
  <done>Coupons.tsx refactored to use generic hook</done>
</task>

<task type="auto">
  <name>Task 3: Refactor CartRules.tsx to use useEntityList</name>
  <files>apps/admin/pages/CartRules.tsx</files>
  <action>
Rewrite CartRules.tsx using useEntityList hook:

1. **Configure the hook**:
   ```typescript
   const { 
     items: cartRules, 
     isLoading, 
     state, 
     handlers 
   } = useEntityList<CartRule>({
     query: api.cartRules.list,
     filters: [
       { key: 'search', type: 'search' },
       { key: 'type', type: 'select', field: 'ruleType', defaultValue: 'all' },
       { key: 'status', type: 'select', field: 'status', defaultValue: 'all' },
     ],
     itemsPerPage: 10,
   });
   ```

2. **Remove list management logic** (same pattern as Coupons)

3. **Keep presentation logic only**

4. **Target line count: under 80 lines**

5. **Use CartRule type from @shared/types**

Use @ts-nocheck at the top for Convex type issues.
  </action>
  <verify>
    - CartRules.tsx under 80 lines (from 124)
    - Uses useEntityList<CartRule>
    - Type and status filters work
    - Pagination works
    - Build passes
  </verify>
  <done>CartRules.tsx refactored to use generic hook</done>
</task>

<task type="auto">
  <name>Task 4: Refactor Products.tsx to use useEntityList with selection</name>
  <files>apps/admin/pages/Products.tsx</files>
  <action>
Rewrite Products.tsx using useEntityList hook with selection enabled:

1. **Configure the hook**:
   ```typescript
   const { 
     items: products, 
     isLoading, 
     state, 
     handlers 
   } = useEntityList<Product>({
     query: api.products.list,
     filters: [
       { key: 'search', type: 'search' },
       { key: 'category', type: 'select', field: 'category', defaultValue: 'all' },
       { key: 'status', type: 'select', field: 'status', defaultValue: 'all' },
     ],
     itemsPerPage: 10,
     enableSelection: true,  // Products has bulk selection
   });
   
   const { 
     paginatedItems, 
     totalPages, 
     filters, 
     selectedItems,  // Now available
     deleteDialog 
   } = state;
   
   const { 
     setFilter, 
     setPage, 
     toggleSelection,  // Now available
     selectAll,        // Now available
     clearSelection,   // Now available
     openDeleteDialog, 
     closeDeleteDialog, 
     confirmDelete 
   } = handlers;
   ```

2. **Remove list management logic**:
   - Delete useState declarations
   - Delete filteredProducts computation
   - Delete paginatedProducts computation
   - Delete selectedProducts state and handlers
   - Delete delete dialog state

3. **Keep presentation logic**:
   - Category filtering (need category list for dropdown)
   - ProductsFilterToolbar with filters + selection handlers
   - ProductsTable with selection support
   - DeleteConfirmationDialog

4. **Target line count: under 80 lines**

5. **Note**: Category filter needs categories data for dropdown - fetch separately or include in hook config

Use @ts-nocheck at the top for Convex type issues.
  </action>
  <verify>
    - Products.tsx under 80 lines (from 149)
    - Uses useEntityList<Product> with enableSelection
    - Category filter works
    - Bulk selection works
    - Pagination works
    - Build passes
  </verify>
  <done>Products.tsx refactored to use generic hook with selection</done>
</task>

</tasks>

<verification>
[Phase-level verification]

1. **Line counts**: All 3 pages under 80 lines
2. **No duplication**: Common logic in useEntityList hook
3. **Generic hook**: Works with Coupons, CartRules, Products
4. **Type safety**: Generic<T> preserves entity types
5. **No regressions**: All functionality preserved
6. **Build passes**: TypeScript compiles without errors
</verification>

<success_criteria>
[Measurable completion criteria]

- useEntityList<T> hook created with generics ✓
- Coupons.tsx: 131 → under 80 lines ✓
- CartRules.tsx: 124 → under 80 lines ✓
- Products.tsx: 149 → under 80 lines ✓
- All useState removed from components ✓
- Selection support works in Products ✓
- Reusable pattern established ✓
</success_criteria>

<output>
After completion, create `.planning/phases/refactor-admin-hooks/refactor-admin-hooks-04-SUMMARY.md`

Include:
- What was refactored
- Before/after metrics for all 3 pages
- useEntityList API documentation
- Usage examples for future entity lists
- Pattern for adding new list pages
</output>
