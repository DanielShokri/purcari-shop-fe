---
phase: 09-cart-manager
plan: 01
subsystem: cart
tags: [convex, react-hooks, cart, localStorage, auth]

# Dependency graph
requires:
  - phase: 08-system-announcements
    provides: SystemAnnouncements backend and admin UI
provides:
  - Convex cart mutations with stock/price validation
  - Unified useCart() hook for auth-aware cart management
  - useCartUI() context for cart modal state
  - CartSyncResult type for merge-on-login feedback
affects: [cart-components, checkout-flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useCart() hook - unified API for authenticated and guest users"
    - "Server-side cart validation - prevents price manipulation"
    - "Cart merge on login with sync result reporting"

key-files:
  created:
    - convex/cart.ts - 6 cart functions (addItem, removeItem, updateQuantity, clearCart, mergeGuestCart, getCart)
    - apps/storefront/hooks/useCart.ts - Unified cart hook (~250 lines)
    - apps/storefront/hooks/useCartUI.tsx - Cart modal context (~35 lines)
  modified:
    - packages/shared-types/src/index.ts - Added CartSyncResult type

key-decisions:
  - "Cart stays embedded in users table - simpler schema, follows existing pattern"
  - "Server-side price validation - prevents client-side price manipulation"
  - "Hebrew error messages - consistent with Israeli market"

patterns-established:
  - "Auth-aware hook pattern - useQuery conditionally skips based on auth status"
  - "localStorage adapter - transparent fallback for guests"

requirements-completed: [CART-01, CART-02, CART-03, CART-04]

# Metrics
duration: 5 min
completed: 2026-02-22
---

# Phase 09 Plan 01: Cart Manager Foundation Summary

**Convex cart mutations with stock/price validation, unified useCart() hook transparently switching between Convex (authenticated) and localStorage (guest), and useCartUI() context for modal state**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-22T16:36:07Z
- **Completed:** 2026-02-22T16:41:16Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created convex/cart.ts with 6 cart functions: getCart, addItem, removeItem, updateQuantity, clearCart, mergeGuestCart
- addItem validates stock and builds CartItem from fresh DB data (prevents price manipulation)
- mergeGuestCart returns CartSyncResult with skipped/priceChanged/adjusted items for merge-on-login feedback
- Created useCart() hook that transparently switches between Convex (authenticated) and localStorage (guest)
- Auth transition automatically triggers mergeGuestCart mutation when guest logs in
- Created useCartUI() context for cart modal state (replaces Redux uiSlice parts)
- CartSyncResult type added to shared-types

## Task Commits

Each task was committed atomically:

1. **Task 1: Convex cart mutations** - `f23c392` (feat)
2. **Task 2: useCart and useCartUI hooks** - `0cf5621` (feat)

**Plan metadata:** `pending` (docs: complete plan)

## Files Created/Modified

- `convex/cart.ts` - Server-side cart mutations with stock/price validation
- `packages/shared-types/src/index.ts` - Added CartSyncResult type
- `apps/storefront/hooks/useCart.ts` - Unified cart hook (~250 lines)
- `apps/storefront/hooks/useCartUI.tsx` - Cart modal context (~35 lines)

## Decisions Made

- Cart stays embedded in users table - simpler schema, follows existing pattern
- Server-side price validation - prevents client-side price manipulation
- Hebrew error messages - consistent with Israeli market
- Auth-aware hook pattern - useQuery conditionally skips based on auth status
- localStorage adapter - transparent fallback for guests

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully.

## Next Phase Readiness

Plan 09-02 can proceed to migrate all 13 consumer components to use the new useCart() and useCartUI() hooks. The foundation is complete and ready for component migration.

---

*Phase: 09-cart-manager*
*Completed: 2026-02-22*
