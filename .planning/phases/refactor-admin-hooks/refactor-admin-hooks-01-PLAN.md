---
phase: refactor-admin-hooks
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/admin/hooks/useUsers.ts
  - apps/admin/pages/Users.tsx
autonomous: true

must_haves:
  truths:
    - "Users.tsx is under 150 lines (from 474 lines)"
    - "All user list logic is in useUsers hook"
    - "All dialog management is in useUserDialogs hook"
    - "No parallel state - single source of truth for filters/pagination"
    - "Component uses same pattern as useProductEditor"
  artifacts:
    - path: "apps/admin/hooks/useUsers.ts"
      provides: "Consolidated user list state management"
      exports: ["useUsers", "UseUsersReturn"]
    - path: "apps/admin/hooks/useUserDialogs.ts"
      provides: "Dialog state management for create/edit/delete"
      exports: ["useUserDialogs", "UseUserDialogsReturn"]
    - path: "apps/admin/pages/Users.tsx"
      provides: "Simplified user management page"
      max_lines: 150
  key_links:
    - from: "Users.tsx"
      to: "useUsers"
      via: "hook call"
      pattern: "const { filteredUsers, pagination, filters, handlers } = useUsers()"
    - from: "Users.tsx"
      to: "useUserDialogs"
      via: "hook call"
      pattern: "const { dialogs, openCreate, openEdit, ... } = useUserDialogs()"
---

<objective>
Refactor Users.tsx from 474 lines to under 150 lines by extracting useUsers and useUserDialogs hooks. Consolidate 24 scattered useState calls into manageable, focused hooks following the established useProductEditor pattern.

Purpose: Make user management debuggable and eliminate the 24-useState god component
Output: useUsers hook + useUserDialogs hook + simplified Users.tsx
</objective>

<execution_context>
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/pages/Users.tsx
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/hooks/useProductEditor.ts

Users.tsx is the worst offender in the codebase:
- 474 lines of code
- 24 useState calls scattered throughout
- Mixed concerns: list filtering, pagination, 3 different dialogs (create/edit/delete)
- Helper functions mixed with component logic

Current useState breakdown:
- Filter states: searchTerm, roleFilter, statusFilter, selectedUsers, currentPage (5)
- Create dialog: isCreateDialogOpen, newUserName, newUserEmail, newUserPassword, newUserRole, createError (6)
- Edit dialog: isEditDialogOpen, editingUser, editUserName, editUserEmail, editUserPhone, editUserAddress, editUserRole, editError, isUpdating (9)
- Delete dialog: deleteDialogOpen, userToDelete, isDeleting (3)
- Other: usersPerPage constant

The useProductEditor.ts shows the established pattern:
- Returns { form, editor, state, handlers }
- Single source of truth via react-hook-form
- UI state separate from data state
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create useUsers hook for list/filter/pagination</name>
  <files>apps/admin/hooks/useUsers.ts</files>
  <action>
Create a useUsers hook that consolidates all user list management logic:

1. **Data fetching**:
   - useQuery for api.users.listAll
   - Loading state

2. **Filter state** (useState for UI-only filters):
   - searchTerm: string
   - roleFilter: string ('all' or specific role)
   - statusFilter: string ('all' or specific status)
   
3. **Selection state**:
   - selectedUsers: string[]
   - toggleUserSelection, selectAll, clearSelection handlers

4. **Pagination state**:
   - currentPage: number
   - usersPerPage: constant (10)
   - totalPages: computed
   - paginatedUsers: computed from filtered + pagination

5. **Computed values** (useMemo):
   - filteredUsers: apply search + role + status filters
   - paginatedUsers: slice filtered by pagination
   - totalPages: Math.ceil(filtered.length / perPage)

6. **Handlers**:
   - setSearchTerm, setRoleFilter, setStatusFilter
   - setCurrentPage
   - toggleUserSelection, selectAllUsers, clearSelection

7. **Return structure**:
   ```typescript
   return {
     users,                    // Raw data from Convex
     isLoading,
     state: {
       filteredUsers,
       paginatedUsers,
       totalPages,
       currentPage,
       usersPerPage,
       selectedUsers,
       filters: {
         searchTerm,
         roleFilter,
         statusFilter,
       },
     },
     handlers: {
       setSearchTerm,
       setRoleFilter,
       setStatusFilter,
       setCurrentPage,
       toggleUserSelection,
       selectAllUsers,
       clearSelection,
     },
   }
   ```

Include proper TypeScript interfaces and use @ts-nocheck for Convex types.
  </action>
  <verify>
    - Hook file exists with all exports
    - All filter/pagination logic consolidated
    - No useState for data that should be computed
  </verify>
  <done>useUsers hook created with list/filter/pagination logic</done>
</task>

<task type="auto">
  <name>Task 2: Create useUserDialogs hook for dialog management</name>
  <files>apps/admin/hooks/useUserDialogs.ts</files>
  <action>
Create a useUserDialogs hook that manages all three dialog flows (create, edit, delete):

1. **Create dialog state**:
   - isOpen: boolean
   - formData: { name, email, password, role }
   - error: string | null
   - isSubmitting: boolean

2. **Edit dialog state**:
   - isOpen: boolean
   - userId: string | null
   - formData: { name, email, phone, address, role }
   - error: string | null
   - isSubmitting: boolean

3. **Delete dialog state**:
   - isOpen: boolean
   - userId: string | null
   - isSubmitting: boolean

4. **Actions for Create**:
   - openCreateDialog(): void
   - closeCreateDialog(): void
   - setCreateFormField(field, value): void
   - resetCreateForm(): void
   - submitCreate(): Promise<void>

5. **Actions for Edit**:
   - openEditDialog(user): void - populates form with user data
   - closeEditDialog(): void
   - setEditFormField(field, value): void
   - resetEditForm(): void
   - submitEdit(): Promise<void>

6. **Actions for Delete**:
   - openDeleteDialog(userId): void
   - closeDeleteDialog(): void
   - confirmDelete(): Promise<void>

7. **Return structure**:
   ```typescript
   return {
     create: {
       isOpen,
       formData,
       error,
       isSubmitting,
       open: openCreateDialog,
       close: closeCreateDialog,
       setField: setCreateFormField,
       reset: resetCreateForm,
       submit: submitCreate,
     },
     edit: {
       isOpen,
       userId,
       formData,
       error,
       isSubmitting,
       open: openEditDialog,
       close: closeEditDialog,
       setField: setEditFormField,
       reset: resetEditForm,
       submit: submitEdit,
     },
     delete: {
       isOpen,
       userId,
       isSubmitting,
       open: openDeleteDialog,
       close: closeDeleteDialog,
       confirm: confirmDelete,
     },
   }
   ```

Use Convex mutations (api.users.create, api.users.update, api.users.remove) for submissions.
Include proper error handling with toaster notifications.
Include @ts-nocheck for Convex types.
  </action>
  <verify>
    - Hook file exists with all dialog management
    - Each dialog has open/close/setField/submit actions
    - Form state is local to hook (not scattered in component)
  </verify>
  <done>useUserDialogs hook created with create/edit/delete dialog management</done>
</task>

<task type="auto">
  <name>Task 3: Refactor Users.tsx to use hooks</name>
  <files>apps/admin/pages/Users.tsx</files>
  <action>
Rewrite Users.tsx to be a thin presentation component using the new hooks:

1. **Replace all imports**:
   ```typescript
   import { useUsers } from '../hooks/useUsers';
   import { useUserDialogs } from '../hooks/useUserDialogs';
   ```

2. **Use the hooks**:
   ```typescript
   const { users, isLoading, state, handlers } = useUsers();
   const { create, edit, delete: deleteDialog } = useUserDialogs();
   ```

3. **Destructure for easy access**:
   ```typescript
   const { 
     filteredUsers, 
     paginatedUsers, 
     totalPages, 
     currentPage, 
     selectedUsers,
     filters 
   } = state;
   
   const { 
     setSearchTerm, 
     setRoleFilter, 
     setStatusFilter,
     setCurrentPage,
     toggleUserSelection,
     selectAllUsers,
     clearSelection,
   } = handlers;
   ```

4. **Remove ALL business logic**:
   - Delete all 24 useState declarations
   - Delete all filter logic (filteredUsers computation)
   - Delete all pagination logic
   - Delete all dialog state management
   - Delete all form handlers
   - Delete all mutation calls
   - Keep only: helper functions for display (getRoleLabel, asUserId)

5. **Update JSX to use hook data**:
   - Pass paginatedUsers to UsersTable
   - Pass filters and handlers to UsersFilterToolbar
   - Pass dialog states to Dialog components
   - Wire up dialog actions from hooks

6. **Target line count: under 150 lines**

7. **Keep helper functions that are pure**:
   - isValidConvexId()
   - asUserId()
   - getRoleLabel()
   - roleOptions (constant)

Use @ts-nocheck at the top for Convex type issues.
  </action>
  <verify>
    - Users.tsx under 150 lines (from 474)
    - No useState for list/filter/pagination/dialogs
    - Uses both hooks exclusively
    - All functionality preserved
    - Build passes
  </verify>
  <done>Users.tsx refactored to pure presentation component</done>
</task>

</tasks>

<verification>
[Phase-level verification]

1. **Line count check**: Users.tsx must be under 150 lines (down from 474)
2. **State consolidation**: Only pure helper functions remain in component
3. **Hook usage**: All state managed by useUsers and useUserDialogs
4. **Pattern consistency**: Follows same structure as useProductEditor
5. **No regressions**: All existing functionality preserved
6. **Build passes**: TypeScript compiles without errors
</verification>

<success_criteria>
[Measurable completion criteria]

- Users.tsx: 474 lines → under 150 lines ✓
- useState count: 24 → 0 in component ✓
- useUsers hook exists with list/filter/pagination ✓
- useUserDialogs hook exists with create/edit/delete ✓
- All existing functionality works (filters, pagination, dialogs) ✓
- Component is debuggable and testable ✓
</success_criteria>

<output>
After completion, create `.planning/phases/refactor-admin-hooks/refactor-admin-hooks-01-SUMMARY.md`

Include:
- What was refactored
- Before/after metrics (lines, useState count)
- New hook APIs
- How to use the new pattern
- Pattern established for future list+dialog components
</output>
