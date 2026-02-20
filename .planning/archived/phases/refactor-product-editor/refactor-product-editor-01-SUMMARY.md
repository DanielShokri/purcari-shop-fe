---
phase: refactor-product-editor
plan: 01
subsystem: ui
/tags: react, hooks, refactoring, react-hook-form

requires:
  - phase: previous-refactors
    provides: established useCartRuleEditor pattern

provides:
  - WineType enum matching Convex schema
  - useProductEditor hook for consolidated state management
  - Simplified ProductEditor.tsx presentation component

affects:
  - Product editor functionality
  - Wine type handling throughout app

tech-stack:
  added:
    - useProductEditor hook
  patterns:
    - Custom hook for form state consolidation
    - react-hook-form as single source of truth
    - Separation of business logic from presentation

key-files:
  created:
    - apps/admin/hooks/useProductEditor.ts
  modified:
    - packages/shared-types/src/index.ts (WineType enum values)
    - apps/admin/pages/ProductEditor.tsx (refactored to 81 lines)

key-decisions:
  - "Fixed WineType enum to match Convex schema exactly (Red, White, Rosé, Sparkling)"
  - "Used useCartRuleEditor pattern for consistency across editor hooks"
  - "Consolidated 15+ useState calls into single useForm instance"
  - "Eliminated all wine type conversion functions"

patterns-established:
  - "useProductEditor hook pattern: returns { form, editor, state, handlers }"
  - "Form state consolidation: all product data in react-hook-form"
  - "UI state separation: loading states, dialogs, errors in useState"
  - "Presentation component: ProductEditor.tsx is now pure UI"

duration: 10 min
completed: 2026-02-19
---

# Phase refactor-product-editor Plan 01: Refactor ProductEditor to use useProductEditor Hook

**ProductEditor.tsx reduced from 566 lines to 81 lines by extracting business logic into useProductEditor hook following the established useCartRuleEditor pattern.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-19T22:58:04Z
- **Completed:** 2026-02-19T23:08:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

1. **Fixed WineType enum** to match Convex schema exactly (Red, White, Rosé, Sparkling)
2. **Created useProductEditor hook** (370 lines) consolidating all product form state
3. **Refactored ProductEditor.tsx** from 566 lines to 81 lines (85% reduction)
4. **Eliminated parallel state management** - single source of truth via react-hook-form
5. **Removed all wine type conversion code** - enum values now match Convex directly

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix WineType enum to match Convex** - `6ced8ac` (fix)
2. **Task 2: Create useProductEditor hook** - `216d5df` (feat)
3. **Task 3: Refactor ProductEditor.tsx to use hook** - `8eb6bf1` (refactor)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `packages/shared-types/src/index.ts` - Fixed WineType enum values (5 lines changed)
- `apps/admin/hooks/useProductEditor.ts` - New hook with consolidated state management (370 lines)
- `apps/admin/pages/ProductEditor.tsx` - Simplified to 81 lines, pure presentation component

## Before/After Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| ProductEditor.tsx lines | 566 | 81 | -485 (-85%) |
| useState calls | 15+ | 5 (UI only) | -10+ |
| wine type conversion functions | 2 | 0 | -2 |
| Custom hooks | 0 | 1 | +1 |

## Decisions Made

1. **Fixed WineType enum values to match Convex schema** - Eliminated need for conversion functions
2. **Used useCartRuleEditor as reference pattern** - Ensures consistency across editor hooks
3. **Consolidated all product data into useForm** - Single source of truth, no parallel state
4. **Kept UI state (loading, dialogs) in useState** - Separation of concerns
5. **Exported types (ProductForm, ProductEditorState, ProductEditorHandlers)** - Type-safe usage

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Pre-existing TypeScript errors in convex/ files are unrelated to this refactoring.

## How to Use the New Hook Pattern

```typescript
// In a page component
const { id } = useParams<{ id?: string }>();
const { form, editor, state, handlers } = useProductEditor({ id });

const { register, control, watch, setValue } = form;
const { isEditMode, isLoading, categories } = state;
const { handleSave, handleCancel } = handlers;

// Use form.register() for inputs
<input {...register('productName')} />

// Use watch() for reading values
<Text>{watch('price')}</Text>

// Use setValue() for updates
<Button onClick={() => setValue('onSale', true)}>On Sale</Button>
```

## Pattern Benefits

1. **Testability** - Business logic in hook can be unit tested independently
2. **Debuggability** - Single source of truth makes state changes predictable
3. **Maintainability** - Component is pure UI, all logic in one place
4. **Consistency** - Same pattern as useCartRuleEditor across codebase
5. **Type Safety** - Exported interfaces ensure correct usage

## Next Phase Readiness

- Product editor is now maintainable and debuggable
- Pattern established for future editor hooks
- Ready for adding new product fields or features

---
*Phase: refactor-product-editor*
*Completed: 2026-02-19*
## Self-Check: PASSED
