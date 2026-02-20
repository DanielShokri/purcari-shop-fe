---
phase: refactor-product-editor
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/shared-types/src/index.ts
  - apps/admin/hooks/useProductEditor.ts
  - apps/admin/pages/ProductEditor.tsx
  - apps/admin/components/post-editor/WineDetailsCard.tsx
autonomous: true

must_haves:
  truths:
    - "ProductEditor.tsx is under 200 lines (from 566 lines)"
    - "All state management is in useProductEditor hook"
    - "No parallel state between useState and useForm - single source of truth"
    - "WineType enum matches Convex schema exactly (no conversion needed)"
    - "Component uses the same pattern as useCartRuleEditor"
  artifacts:
    - path: "packages/shared-types/src/index.ts"
      provides: "WineType enum matching Convex schema"
      contains: 'RED = "Red"'
    - path: "apps/admin/hooks/useProductEditor.ts"
      provides: "Consolidated state management for product editor"
      exports: ["useProductEditor", "ProductEditorState", "ProductEditorHandlers"]
    - path: "apps/admin/pages/ProductEditor.tsx"
      provides: "Simplified page component"
      max_lines: 200
  key_links:
    - from: "ProductEditor.tsx"
      to: "useProductEditor"
      via: "hook call"
      pattern: "const { form, state, handlers } = useProductEditor({ id })"
    - from: "useProductEditor"
      to: "WineType enum"
      via: "shared-types import"
      pattern: "import { WineType } from '@shared/types'"
---

<objective>
Refactor ProductEditor.tsx from 566 lines to under 200 lines by extracting a useProductEditor hook following the established useCartRuleEditor pattern. Consolidate 15+ scattered useState calls into a single, manageable state object using react-hook-form as the single source of truth. Fix WineType enum to match Convex schema exactly, eliminating the need for conversion functions.

Purpose: Make the component debuggable, testable, and maintainable
Output: Fixed WineType enum + useProductEditor hook + simplified page component
</objective>

<execution_context>
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/pages/ProductEditor.tsx
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/hooks/useCartRuleEditor.ts
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/admin/components/post-editor/PricingCard.tsx
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/packages/shared-types/src/index.ts

The ProductEditor.tsx file currently has:
- 566 lines of code
- 15+ individual useState calls scattered throughout
- Parallel state management (useState + useForm with manual syncing)
- Wine type conversion functions (lines 81-105) - UNNECESSARY!
- Complex useEffect for form reset (lines 172-201)
- All business logic mixed with presentation

**Root cause of wine type conversion:**
The WineType enum in shared-types has WRONG values:
```typescript
// shared-types (WRONG)
WineType.RED = 'red'      // should be 'Red'
WineType.WHITE = 'white'  // should be 'White'
WineType.ROSE = 'rose'    // should be 'Rosé'

// Convex schema (source of truth)
wineType: v.union(
  v.literal("Red"),
  v.literal("White"),
  v.literal("Rosé"),
  v.literal("Sparkling")
)
```

**Solution:** Fix the enum to match Convex, then delete all conversion code.

The useCartRuleEditor.ts shows the established pattern:
- Custom hook returns { form, state, handlers }
- Uses react-hook-form as single source of truth
- Loading states consolidated in state object
- Action handlers extracted from component
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix WineType enum to match Convex</name>
  <files>packages/shared-types/src/index.ts</files>
  <action>
Fix the WineType enum values to match Convex schema exactly. This eliminates the need for all conversion functions.

**Current (WRONG):**
```typescript
export enum WineType {
  RED = 'red',           // ❌ lowercase
  WHITE = 'white',       // ❌ lowercase
  ROSE = 'rose',         // ❌ lowercase, missing accent
  SPARKLING = 'sparkling',  // ❌ lowercase
}
```

**Fix to (match Convex):**
```typescript
export enum WineType {
  RED = 'Red',
  WHITE = 'White',
  ROSE = 'Rosé',
  SPARKLING = 'Sparkling',
}
```

This change means:
1. No conversion functions needed in ProductEditor.tsx
2. WineType.RED can be passed directly to Convex API
3. Convex response can be cast directly to WineType
4. Select dropdowns use WineType enum values directly

Update the enum in packages/shared-types/src/index.ts.
  </action>
  <verify>
    - WineType enum values match Convex schema exactly
    - No conversion functions remain in codebase
    - Build passes
  </verify>
  <done>WineType enum fixed, conversion code can be deleted</done>
</task>

<task type="auto">
  <name>Task 2: Create useProductEditor hook</name>
  <files>apps/admin/hooks/useProductEditor.ts</files>
  <action>
Create a comprehensive useProductEditor hook following the useCartRuleEditor pattern. The hook must:

1. **Consolidate all state** - Replace 15+ useState calls with useForm as single source of truth:
   - productName, description, status → useForm fields
   - category → useForm field
   - tags → useForm field (array)
   - shortDescription → useForm field
   - price, onSale, salePrice → useForm fields
   - sku, quantityInStock, stockStatus, isFeatured → useForm fields
   - wineType, volume, grapeVariety, vintage, servingTemperature → useForm fields
   - featuredImage → useForm field
   - relatedProducts → useForm field (array of IDs)

2. **Keep UI-only state separate**:
   - isSaving, isDeleting (loading states)
   - deleteDialogOpen (modal state)
   - saveError (error display)
   - tagInput (transient input before adding to tags array)

3. **Handle data loading** (similar to useCartRuleEditor lines 77-92):
   - Use useEffect with hasLoadedData flag
   - Reset form when existingProduct loads
   - Transform Convex data to form format

4. **Build submit data** (reverse transformation):
   - Convert form values to Convex API format
   - WineType enum values now match Convex directly (no conversion needed)
   - Handle optional fields (undefined vs empty string)

5. **Return structure matching useCartRuleEditor**:
   ```typescript
   return {
     form,           // react-hook-form instance
     editor,         // Tiptap editor instance
     state: {        // Readonly state
       isEditMode,
       isLoading,
       isSaving,
       isDeleting,
       deleteDialogOpen,
       categories,
       availableProducts,
     },
     handlers: {     // Action handlers
       handleSave,
       handleCancel,
       handleDelete,
       handleConfirmDelete,
       setDeleteDialogOpen,
       handleAddTag,
       handleRemoveTag,
       handleCategoryToggle,
       handleAddRelatedProduct,
       handleRemoveRelatedProduct,
     },
   }
   ```

6. **Include proper types**:
   - ProductForm interface extending Partial<Product>
   - ProductEditorState interface
   - ProductEditorHandlers interface
   - Use proper Id<"categories"> and Id<"products"> types

Use the @ts-nocheck comment at the top (like useCartRuleEditor) for Convex type issues.
  </action>
  <verify>
    - Hook file exists with all exports
    - No useState for product data (all in useForm)
    - Only UI state uses useState (isSaving, isDeleting, deleteDialogOpen, saveError, tagInput)
    - Returns form, editor, state, handlers structure
  </verify>
  <done>
    useProductEditor hook created with consolidated state management
  </done>
</task>

<task type="auto">
  <name>Task 3: Refactor ProductEditor.tsx to use hook</name>
  <files>apps/admin/pages/ProductEditor.tsx</files>
  <action>
Rewrite ProductEditor.tsx to be a thin presentation component using the new hook. The component should:

1. **Import and use the hook**:
   ```typescript
   const { id } = useParams<{ id?: string }>();
   const { 
     form, 
     editor, 
     state, 
     handlers 
   } = useProductEditor({ id });
   
   const { register, control } = form;
   ```

2. **Destructure state**:
   ```typescript
   const { 
     isEditMode, 
     isLoading, 
     isSaving, 
     isDeleting, 
     deleteDialogOpen,
     categories,
     availableProducts,
     relatedProducts,
   } = state;
   ```

3. **Destructure handlers**:
   ```typescript
   const {
     handleSave,
     handleCancel,
     handleDelete,
     handleConfirmDelete,
     setDeleteDialogOpen,
     handleAddTag,
     handleRemoveTag,
     handleCategoryToggle,
     handleAddRelatedProduct,
     handleRemoveRelatedProduct,
   } = handlers;
   ```

4. **Keep only presentation logic**:
   - Loading states (lines 203-209)
   - Breadcrumbs (lines 338-344)
   - Header with title and error display (lines 347-378)
   - Form structure with SimpleGrid (lines 381-541)
   - EditorFooter (lines 545-553)
   - DeleteConfirmationDialog (lines 555-562)

5. **Remove all business logic**:
   - Delete all useState declarations (except what hook returns)
   - Delete all useEffect declarations
   - Delete wine type conversion functions (lines 81-105) - NOT NEEDED anymore!
   - Delete onSubmit, handleSave, handleCancel, handleDelete, etc.
   - Delete category transformation logic
   - Delete related products filtering logic

6. **Update form field bindings**:
   - Use form.register() for all inputs
   - Use form.watch() or form.getValues() where needed
   - Pass form.control to PublishCard
   - Pass handler functions to card components

7. **Update card component props**:
   - PricingCard: read from form.watch('price') etc.
   - WineDetailsCard: read from form.watch('wineType') etc.
   - InventoryCard: read from form.watch('sku') etc.
   - TagsCard: read from form.watch('tags')
   - FeaturedImageCard: read from form.watch('featuredImage')
   - RelatedProductsCard: use relatedProducts from state

8. **Target line count: under 200 lines**

Use @ts-nocheck at the top for Convex type issues.
  </action>
  <verify>
    - ProductEditor.tsx under 200 lines
    - No useState for product data
    - Uses useProductEditor hook
    - All card components still work
    - Build passes
  </verify>
  <done>
    ProductEditor.tsx is a clean presentation component under 200 lines
  </done>
</task>

</tasks>

<verification>
[Phase-level verification]

1. **Line count check**: ProductEditor.tsx must be under 200 lines (down from 566)
2. **State consolidation**: Only UI state uses useState (loading, dialogs, errors)
3. **Single source of truth**: All product data in react-hook-form, no parallel state
4. **Pattern consistency**: useProductEditor follows same structure as useCartRuleEditor
5. **No regressions**: All existing functionality preserved
6. **Build passes**: TypeScript compiles without errors
</verification>

<success_criteria>
[Measurable completion criteria]

- WineType enum values match Convex schema exactly (Red, White, Rosé, Sparkling) ✓
- ProductEditor.tsx: 566 lines → under 200 lines ✓
- useState count: 15+ → 4 (isSaving, isDeleting, deleteDialogOpen, saveError, tagInput) ✓
- useProductEditor hook exists with proper exports ✓
- Zero wine type conversion code remains ✓
- All existing functionality works (create, edit, delete, validation) ✓
- Component is debuggable and testable ✓
</success_criteria>

<output>
After completion, create `.planning/phases/refactor-product-editor/refactor-product-editor-01-SUMMARY.md`

Include:
- What was refactored
- Before/after metrics (lines, useState count)
- New file structure
- How to use the new hook pattern
</output>
