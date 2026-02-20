---
phase: refactor-admin-hooks
plan: 03
type: execute
wave: 2
depends_on:
  - refactor-admin-hooks-02
files_modified:
  - apps/admin/hooks/useCategories.ts
  - apps/admin/pages/Categories.tsx
autonomous: true

must_haves:
  truths:
    - "Categories.tsx is under 120 lines (from 313 lines)"
    - "Tree building logic is in useCategories hook"
    - "Form handling consolidated in hook"
    - "No useMemo for tree building in component"
    - "Component uses established hook pattern"
  artifacts:
    - path: "apps/admin/hooks/useCategories.ts"
      provides: "Category tree management and form handling"
      exports: ["useCategories", "UseCategoriesReturn"]
    - path: "apps/admin/pages/Categories.tsx"
      provides: "Simplified category management page"
      max_lines: 120
  key_links:
    - from: "Categories.tsx"
      to: "useCategories"
      via: "hook call"
      pattern: "const { tree, form, selection, handlers } = useCategories()"
---

<objective>
Refactor Categories.tsx from 313 lines to under 120 lines by extracting useCategories hook. Consolidate tree building logic, form handling, and selection state into a focused hook following established patterns.

Purpose: Simplify category tree management and make tree logic testable
Output: useCategories hook + simplified Categories.tsx
</objective>

<execution_context>
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/pages/Categories.tsx
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/hooks/useProductEditor.ts

Categories.tsx is complex due to tree management:
- 313 lines of code
- 6 useState calls
- Complex tree building algorithm (buildCategoryTree)
- Form handling for create/edit
- Selection and expansion state
- Category mapping with type transformations

Current complexity:
- Tree building: O(n) algorithm with two-pass approach
- Form handling: react-hook-form for category data
- Selection: selectedCategoryId with derived selectedCategory
- Expansion: expandedCategories Set
- Delete dialog state

Key complexity: buildCategoryTree() function (lines 69-91)
Key complexity: mappedCategories with type casting (lines 56-62)

This is a different pattern from list+filter - it's tree+form management.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create useCategories hook</name>
  <files>apps/admin/hooks/useCategories.ts</files>
  <action>
Create a useCategories hook that manages tree structure, form handling, and selection:

1. **Data fetching**:
   - useQuery for api.categories.list with includeInactive: true
   - useMutation for create, update, delete
   - Loading state

2. **Tree building** (the complex part to extract):
   ```typescript
   const buildCategoryTree = (cats: Category[]): TreeCategory[] => {
     // Move existing algorithm here
     // Two-pass: build map, then assemble tree
     // Sort by displayOrder
   };
   ```

3. **Category mapping**:
   - Map Convex categories to frontend format with $id
   - Handle order/displayOrder transformation
   - Type-safe conversions

4. **Filter state**:
   - searchTerm: string
   - Filter tree by name (keep parent if child matches)

5. **Selection state**:
   - selectedCategoryId: string | null
   - selectedCategory: computed from selectedCategoryId
   - selectCategory, clearSelection handlers

6. **Expansion state**:
   - expandedCategories: Set<string>
   - toggleExpand, expandAll, collapseAll handlers

7. **Form handling** (using react-hook-form):
   - Form for category: name, parentId, displayOrder, status, description
   - Reset form when selectedCategory changes
   - Submit for create vs update

8. **Delete dialog state**:
   - deleteDialogOpen: boolean
   - categoryToDelete: string | null

9. **Computed values** (useMemo):
   - mappedCategories: transformed from Convex data
   - categoryTree: built from mapped + filtered
   - selectedCategory: derived from selectedCategoryId

10. **Handlers**:
    - setSearchTerm
    - selectCategory, clearSelection
    - toggleExpand, expandAll, collapseAll
    - openDeleteDialog, closeDeleteDialog, confirmDelete
    - handleSubmit (form submit for create/update)
    - resetForm

11. **Return structure**:
    ```typescript
    return {
      categories,           // Raw Convex data
      isLoading,
      tree: {
        categoryTree,       // Built tree structure
        expandedCategories,
      },
      selection: {
        selectedCategoryId,
        selectedCategory,
      },
      form: {
        register,
        handleSubmit,
        reset,
        formState,
        control,
        setValue,
      },
      deleteDialog: {
        isOpen: deleteDialogOpen,
        categoryId: categoryToDelete,
      },
      handlers: {
        setSearchTerm,
        selectCategory,
        clearSelection,
        toggleExpand,
        expandAll,
        collapseAll,
        openDeleteDialog,
        closeDeleteDialog,
        confirmDelete,
        onSubmit: handleSubmit(onSubmit),
      },
    }
    ```

Include proper TypeScript interfaces:
- TreeCategory extends Category with children?: TreeCategory[]
- CategoryFormData interface
- Use @ts-nocheck for Convex types
  </action>
  <verify>
    - Hook file exists with tree building logic
    - Form handling with react-hook-form
    - Selection and expansion state managed
    - All handlers exposed
  </verify>
  <done>useCategories hook created with tree management and form handling</done>
</task>

<task type="auto">
  <name>Task 2: Refactor Categories.tsx to use hook</name>
  <files>apps/admin/pages/Categories.tsx</files>
  <action>
Rewrite Categories.tsx to be a thin presentation component using useCategories hook:

1. **Use the hook**:
   ```typescript
   const { 
     isLoading, 
     tree, 
     selection, 
     form, 
     deleteDialog, 
     handlers 
   } = useCategories();
   
   const { categoryTree, expandedCategories } = tree;
   const { selectedCategoryId, selectedCategory } = selection;
   const { register, handleSubmit, formState } = form;
   ```

2. **Remove ALL complex logic**:
   - Delete useState declarations (moved to hook)
   - Delete buildCategoryTree() function (moved to hook)
   - Delete mappedCategories useMemo (moved to hook)
   - Delete selectedCategory useMemo (moved to hook)
   - Delete form reset useEffect (moved to hook)
   - Delete form submit handlers (moved to hook)
   - Delete delete dialog handlers (moved to hook)

3. **Keep only presentation logic**:
   - Loading state
   - Breadcrumbs
   - CategoryTreeToolbar with search handlers
   - CategoryTreeItem with tree, selection, expansion
   - CategoryForm with form handlers
   - DeleteConfirmationDialog with deleteDialog state

4. **Update JSX**:
   - Pass categoryTree to tree components
   - Pass expandedCategories and toggleExpand
   - Pass selectedCategoryId and selectCategory
   - Pass form register/handleSubmit to CategoryForm
   - Wire delete dialog to deleteDialog state

5. **Target line count: under 120 lines**

Use @ts-nocheck at the top for Convex type issues.
  </action>
  <verify>
    - Categories.tsx under 120 lines (from 313)
    - No useMemo for tree building
    - No buildCategoryTree function
    - Uses useCategories hook exclusively
    - Tree renders correctly
    - Form works for create/edit
    - Selection and expansion work
    - Build passes
  </verify>
  <done>Categories.tsx refactored to pure presentation component</done>
</task>

</tasks>

<verification>
[Phase-level verification]

1. **Line count check**: Categories.tsx must be under 120 lines (down from 313)
2. **Tree logic extracted**: buildCategoryTree in hook, not component
3. **Form handling**: Consolidated in hook
4. **No regressions**: Tree renders, form works, selection works
5. **Build passes**: TypeScript compiles without errors
</verification>

<success_criteria>
[Measurable completion criteria]

- Categories.tsx: 313 lines → under 120 lines ✓
- useState count: 6 → 0 in component ✓
- useCategories hook exists with tree building ✓
- Tree building algorithm extracted from component ✓
- Form handling consolidated ✓
- All functionality preserved ✓
</success_criteria>

<output>
After completion, create `.planning/phases/refactor-admin-hooks/refactor-admin-hooks-03-SUMMARY.md`

Include:
- What was refactored
- Before/after metrics (lines, useState count)
- useCategories API
- Tree management pattern established
</output>
