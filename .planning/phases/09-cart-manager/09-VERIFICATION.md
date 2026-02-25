---
phase: 09-cart-manager
verified: 2026-02-22T19:30:00Z
status: gaps_found
score: 7/8 must-haves verified
re_verification: false
gaps:
  - truth: "Coupon flow in useCart() properly persists to Convex for authenticated users"
    status: failed
    reason: "Coupon is stored in localStorage even for authenticated users instead of being persisted to Convex. The applyCoupon function has a comment 'we'd need to add this to the mutation' indicating incomplete implementation."
    artifacts:
      - path: "apps/storefront/hooks/useCart.ts"
        issue: "Lines 308-312: For authenticated users, coupon is saved to localStorage via saveCouponToLocalStorage() instead of Convex mutation"
    missing:
      - "Convex mutation to persist appliedCoupon to user.cart.appliedCoupon"
      - "Proper useQuery pattern for coupon validation (currently uses window.__convex_client workaround)"
---

# Phase 09: Cart Manager Verification Report

**Phase Goal:** Create a unified Cart Manager replacing Redux cart state with Convex (authenticated users) and localStorage (guest users), with transparent merge-on-login, automatic stock validation, and price freshness checks.

**Verified:** 2026-02-22
**Status:** gaps_found
**Score:** 7/8 must-haves verified

---

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                                   | Status     | Evidence                                                                                           |
|-----|---------------------------------------------------------------------------------------------------------|------------|----------------------------------------------------------------------------------------------------|
| 1   | Authenticated user's cart operations persist to Convex in real-time                                    | ✓ VERIFIED | convex/cart.ts has addItem, removeItem, updateQuantity, clearCart mutations with getAuthUserId   |
| 2   | Guest user's cart operations persist to localStorage transparently                                      | ✓ VERIFIED | useCart.ts has loadFromLocalStorage/saveToLocalStorage adapters, guestCart state                  |
| 3   | Guest-to-auth merge with stock/price validation                                                         | ✓ VERIFIED | mergeGuestCart mutation returns CartSyncResult with skippedItems, priceChanges, adjustedItems     |
| 4   | Out-of-stock and price-changed items detected and reported during merge                                | ✓ VERIFIED | CartSyncResult interface in shared-types has all three arrays for merge issues                    |
| 5   | Pure calculation functions work identically for both storage backends                                  | ✓ VERIFIED | useCart imports calculateCartTotals, computes totals via useMemo                                    |
| 6   | The useCart() hook provides a single API regardless of auth status                                     | ✓ VERIFIED | useCart returns unified interface with items, actions, computed values based on auth status      |
| 7   | Coupon flow integrated into useCart() (CART-06)                                                        | ✗ FAILED   | Coupon stores to localStorage for authenticated users, not Convex                                 |
| 8   | Cart summary with rules integrated into useCart() (CART-07)                                            | ✓ VERIFIED | Uses calculateCartTotals with cartRules query, returns all computed values                        |

**Score:** 7/8 truths verified

### Required Artifacts

| Artifact                                    | Expected    | Status     | Details                                                                                           |
|---------------------------------------------|-------------|------------|---------------------------------------------------------------------------------------------------|
| convex/cart.ts                              | 6 functions | ✓ VERIFIED | getCart, addItem, removeItem, updateQuantity, clearCart, mergeGuestCart - all implemented       |
| apps/storefront/hooks/useCart.ts            | Unified API | ✓ VERIFIED | ~380 lines, switches between Convex/localStorage, handles auth transition merge                 |
| apps/storefront/hooks/useCartUI.tsx         | Context     | ✓ VERIFIED | ~32 lines, provides isCartOpen, openCart, closeCart, toggleCart                                   |
| packages/shared-types/src/index.ts          | CartSyncResult | ✓ VERIFIED | CartSyncResult interface properly defined (lines 198-203)                                      |
| apps/storefront/index.tsx                   | CartUIProvider | ✓ VERIFIED | CartUIProvider wraps App inside ConvexClientProvider (lines 22-26)                             |

### Key Link Verification

| From                         | To                          | Via                              | Status   | Details                                      |
|------------------------------|-----------------------------|----------------------------------|----------|---------------------------------------------|
| useCart.ts                   | convex/cart.ts             | useQuery(api.cart.getCart)       | ✓ WIRED | Authenticated cart reads from Convex        |
| useCart.ts                   | convex/cart.ts             | useMutation(api.cart.*)          | ✓ WIRED | All cart mutations use Convex               |
| useCart.ts                   | localStorage                | loadFromLocalStorage/saveToLocal | ✓ WIRED | Guest cart uses localStorage                |
| CartModal.tsx               | useCart.ts                 | useCart()                        | ✓ WIRED | Uses cart.items, removeItem, updateQuantity |
| CartModal.tsx               | useCartUI.tsx              | useCartUI()                      | ✓ WIRED | Uses closeCart for modal                    |
| Layout.tsx                  | useCartUI.tsx              | useCartUI()                      | ✓ WIRED | Uses isCartOpen for cart visibility        |
| CheckoutPage.tsx            | useCart.ts                 | useCart()                        | ✓ WIRED | Uses items, totals, applyCoupon, clearCart |
| HeaderActions.tsx           | useCart.ts                 | useCart()                        | ✓ WIRED | Uses itemCount, clearCart                   |
| HeaderActions.tsx           | useCartUI.tsx              | useCartUI()                      | ✓ WIRED | Uses toggleCart                             |

### Requirements Coverage

| Requirement | Source Plan | Description                                                 | Status   | Evidence                                                                                     |
|------------|------------|-------------------------------------------------------------|----------|----------------------------------------------------------------------------------------------|
| CART-01    | 09-01      | Convex cart mutations with server-side stock/price validation | ✓ SATISFIED | convex/cart.ts addItem/updateQuantity fetch product and validate stock/price              |
| CART-02    | 09-01      | Guest cart merge on login with CartSyncResult              | ✓ SATISFIED | mergeGuestCart returns mergedCart, skippedItems, priceChanges, adjustedItems              |
| CART-03    | 09-01      | Unified useCart() hook switching Convex/localStorage       | ✓ SATISFIED | useCart detects auth, switches between convexCart and guestCart                            |
| CART-04    | 09-01      | useCartUI() React context                                   | ✓ SATISFIED | useCartUI.tsx provides isCartOpen, openCart, closeCart, toggleCart                        |
| CART-05    | 09-02      | Components migrated from Redux to useCart/useCartUI         | ✓ SATISFIED | 13 files migrated: grep shows useCart() in 8 files, useCartUI() in 3 files               |
| CART-06    | 09-02      | Coupon flow integrated into useCart()                        | ✗ BLOCKED | useCart.applyCoupon stores to localStorage even for authenticated users (lines 308-312)    |
| CART-07    | 09-02      | Cart summary with rules integrated into useCart()           | ✓ SATISFIED | useCart uses calculateCartTotals with cartRules query, returns all computed values          |
| CART-08    | 09-03      | Redux cart files deleted, store cleaned                     | ✓ SATISFIED | cartSlice.ts and convexCartBridge.ts deleted, store/index.ts only has ui reducer          |

### Anti-Patterns Found

| File                     | Line | Pattern        | Severity | Impact                                                                              |
|--------------------------|------|----------------|----------|------------------------------------------------------------------------------------|
| useCart.ts               | 290  | Direct convex client access | Warning | Uses window.__convex_client workaround instead of proper useQuery in callback    |
| useCart.ts               | 308-312 | Incomplete coupon persist | Blocker | Coupon saved to localStorage for authenticated users, not Convex                  |

### Human Verification Required

None - all automated checks complete.

---

## Gaps Summary

**One gap blocks full goal achievement:**

### Gap 1: Coupon Flow Not Persisted to Convex (CART-06)

**Truth:** Coupon flow in useCart() properly persists to Convex for authenticated users

**Status:** Failed

**Reason:** The applyCoupon function in useCart.ts stores the applied coupon in localStorage even for authenticated users. The code at lines 308-312 has a comment "we'd need to add this to the mutation" indicating this is incomplete. For authenticated users, the coupon should be persisted via a Convex mutation (e.g., applyCoupon mutation that updates user.cart.appliedCoupon).

**Artifacts:**
- apps/storefront/hooks/useCart.ts - Lines 308-312 store coupon to localStorage for authenticated users

**Missing:**
- Convex mutation to persist appliedCoupon to user.cart.appliedCoupon
- Proper useQuery pattern for coupon validation (currently uses window.__convex_client workaround)

**Fix Required:**
1. Create a Convex mutation (e.g., applyCoupon) that patches user.cart.appliedCoupon
2. Modify useCart.applyCoupon to call this mutation for authenticated users
3. Remove the localStorage fallback for authenticated users
4. Update removeCoupon mutation to clear appliedCoupon from Convex

---

_Verified: 2026-02-22_
_Verifier: Claude (gsd-verifier)_
