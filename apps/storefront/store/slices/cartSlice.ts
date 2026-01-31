import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { CartItem, AppliedCoupon, SavedCart, CouponValidationResult } from '@shared/types';
import { RootState } from '../index';
import { calculateCartTotals } from '../../utils/cartCalculation';
import { cartRulesApi, useGetCartRulesQuery } from '../../services/api/cartRulesApi';
import { useLazyValidateCouponQuery } from '../../services/api/couponsApi';
import { syncCartToConvex, fetchCartFromConvex } from './convexCartBridge';

// Constants
const FREE_SHIPPING_THRESHOLD = 300; // ILS
const STANDARD_SHIPPING_COST = 29.90; // ILS

interface CartState {
  items: CartItem[];
  isInitialized: boolean;
  appliedCoupon: AppliedCoupon | null;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  couponValidationState: 'idle' | 'validating' | 'valid' | 'invalid';
  couponValidationError?: string;
  lastValidatedCode?: string;
}

// Initial state
const initialState: CartState = {
  items: [],
  isInitialized: false,
  appliedCoupon: null,
  isSyncing: false,
  lastSyncedAt: null,
  couponValidationState: 'idle',
  couponValidationError: undefined,
  lastValidatedCode: undefined,
};

// Load cart from localStorage (for guests)
const loadCartFromLocalStorage = (): { items: CartItem[]; appliedCoupon: AppliedCoupon | null } => {
  try {
    const saved = localStorage.getItem('cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        items: parsed.items || [],
        appliedCoupon: parsed.appliedCoupon || null,
      };
    }
  } catch {
    // Silent fail
  }
  return { items: [], appliedCoupon: null };
};

// Save cart to localStorage (for guests)
const saveCartToLocalStorage = (items: CartItem[], appliedCoupon: AppliedCoupon | null): void => {
  try {
    localStorage.setItem('cart', JSON.stringify({ items, appliedCoupon }));
  } catch {
    // Silent fail
  }
};

// Merge two carts (local + cloud), keeping higher quantities and newer items
const mergeCarts = (
  localItems: CartItem[],
  cloudItems: CartItem[]
): CartItem[] => {
  const merged = new Map<string, CartItem>();

  // Add all cloud items first
  cloudItems.forEach(item => {
    merged.set(item.productId, item);
  });

  // Merge local items (take higher quantity)
  localItems.forEach(item => {
    const existing = merged.get(item.productId);
    if (existing) {
      merged.set(item.productId, {
        ...item,
        quantity: Math.max(existing.quantity, item.quantity),
      });
    } else {
      merged.set(item.productId, item);
    }
  });

  return Array.from(merged.values());
};

// Async thunk: Initialize cart (handles both local and cloud)
export const initializeCart = createAsyncThunk(
  'cart/initialize',
  async (convexClient: any, { dispatch }) => {
    const localCart = loadCartFromLocalStorage();
    const cloudCart = await fetchCartFromConvex(convexClient);

    // If user is logged in and has cloud cart
    if (cloudCart) {
      // Merge local cart with cloud cart
      const mergedItems = mergeCarts(localCart.items, cloudCart.items);
      const appliedCoupon = cloudCart.appliedCoupon || localCart.appliedCoupon;

      // Save merged cart back to cloud if there were local items
      if (localCart.items.length > 0) {
        await syncCartToConvex(convexClient, mergedItems, appliedCoupon);
        // Clear local storage after merging
        localStorage.removeItem('cart');
      }

      return { items: mergedItems, appliedCoupon };
    }

    // Guest user - use local cart
    return localCart;
  }
);

// Async thunk: Sync cart after login
export const syncCartOnLogin = createAsyncThunk(
  'cart/syncOnLogin',
  async (convexClient: any, { getState }) => {
    const state = getState() as RootState;
    const currentItems = state.cart.items;
    const currentCoupon = state.cart.appliedCoupon;

    const cloudCart = await fetchCartFromConvex(convexClient);

    let resultItems = currentItems;
    let resultCoupon = currentCoupon;

    if (cloudCart) {
      // Merge current (local) cart with cloud cart
      resultItems = mergeCarts(currentItems, cloudCart.items);
      resultCoupon = cloudCart.appliedCoupon || currentCoupon;

      // Save merged cart to cloud
      await syncCartToConvex(convexClient, resultItems, resultCoupon);
    } else if (currentItems.length > 0) {
      // No cloud cart - save current cart to cloud
      await syncCartToConvex(convexClient, currentItems, currentCoupon);
    }

    // Always clear localStorage after login sync - logged-in users use cloud storage
    localStorage.removeItem('cart');

    return { items: resultItems, appliedCoupon: resultCoupon };
  }
);

// Async thunk: Clear local cart on logout (cloud cart persists for next login)
export const handleLogout = createAsyncThunk(
  'cart/handleLogout',
  async () => {
    // Clear all user-related localStorage items
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    localStorage.removeItem('recentlyViewed');
    
    return { items: [], appliedCoupon: null };
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + action.payload.quantity;
        existingItem.quantity = Math.min(newQuantity, existingItem.maxQuantity);
      } else {
        const item = { ...action.payload };
        item.quantity = Math.min(item.quantity, item.maxQuantity);
        state.items.push(item);
      }
      
      // Save to localStorage (for guests)
      saveCartToLocalStorage(state.items, state.appliedCoupon);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      saveCartToLocalStorage(state.items, state.appliedCoupon);
    },
    
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find(item => item.productId === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(i => i.productId !== action.payload.productId);
        } else {
          item.quantity = Math.max(1, Math.min(action.payload.quantity, item.maxQuantity));
        }
        
        saveCartToLocalStorage(state.items, state.appliedCoupon);
      }
    },
    
    applyCoupon: (state, action: PayloadAction<AppliedCoupon>) => {
      state.appliedCoupon = action.payload;
      saveCartToLocalStorage(state.items, state.appliedCoupon);
    },
    
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      saveCartToLocalStorage(state.items, state.appliedCoupon);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.appliedCoupon = null;
      localStorage.removeItem('cart');
    },

     setCart: (state, action: PayloadAction<{ items: CartItem[]; appliedCoupon: AppliedCoupon | null }>) => {
       state.items = action.payload.items;
       state.appliedCoupon = action.payload.appliedCoupon;
     },

     setCouponValidationState: (state, action: PayloadAction<'idle' | 'validating' | 'valid' | 'invalid'>) => {
       state.couponValidationState = action.payload;
     },

     setCouponValidationError: (state, action: PayloadAction<string | undefined>) => {
       state.couponValidationError = action.payload;
     },

     setLastValidatedCode: (state, action: PayloadAction<string | undefined>) => {
       state.lastValidatedCode = action.payload;
     },
   },
  extraReducers: (builder) => {
    builder
      .addCase(initializeCart.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(initializeCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.appliedCoupon = action.payload.appliedCoupon;
        state.isInitialized = true;
        state.isSyncing = false;
        state.lastSyncedAt = new Date().toISOString();
      })
      .addCase(initializeCart.rejected, (state) => {
        state.isInitialized = true;
        state.isSyncing = false;
      })
      .addCase(syncCartOnLogin.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(syncCartOnLogin.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.appliedCoupon = action.payload.appliedCoupon;
        state.isSyncing = false;
        state.lastSyncedAt = new Date().toISOString();
      })
      .addCase(syncCartOnLogin.rejected, (state) => {
        state.isSyncing = false;
      })
      .addCase(handleLogout.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.appliedCoupon = action.payload.appliedCoupon;
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  clearCart,
  setCart,
  setCouponValidationState,
  setCouponValidationError,
  setLastValidatedCode,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export const selectCartSubtotal = (state: RootState) =>
  state.cart.items.reduce((total, item) => {
    const price = item.salePrice ?? item.price;
    return total + price * item.quantity;
  }, 0);

export const selectAppliedCoupon = (state: RootState) => state.cart.appliedCoupon;

export const selectCouponValidationState = (state: RootState) => state.cart.couponValidationState;

export const selectCouponValidationError = (state: RootState) => state.cart.couponValidationError;

export const selectLastValidatedCode = (state: RootState) => state.cart.lastValidatedCode;

export const selectCartDiscount = (state: RootState) => {
  const coupon = state.cart.appliedCoupon;
  if (!coupon) return 0;
  return coupon.discountAmount;
};

const getCartRulesFromState = (state: RootState): any[] => {
  try {
    const rulesResult = cartRulesApi.endpoints.getCartRules.select()(state);
    return rulesResult.data || [];
  } catch {
    return [];
  }
};

export const selectShippingCost = (state: RootState) => {
  const rules = getCartRulesFromState(state);
  const totals = calculateCartTotals(state.cart.items, rules);
  return totals.shippingCost;
};

export const selectCartTotal = (state: RootState) => {
  const subtotal = selectCartSubtotal(state);
  const shipping = selectShippingCost(state);
  const discount = selectCartDiscount(state);
  
  const total = subtotal + shipping - discount;
  return Math.max(0, Math.round(total * 100) / 100);
};

export const selectCartSummary = (state: RootState) => {
  const rules = getCartRulesFromState(state);
  const totals = calculateCartTotals(state.cart.items, rules);
  
  const couponDiscount = selectCartDiscount(state);
  const totalDiscount = totals.discount + couponDiscount;
  
  const finalTotal = Math.max(0, totals.subtotal + totals.shippingCost - totalDiscount);

  return {
    items: state.cart.items,
    itemCount: selectCartItemCount(state),
    subtotal: totals.subtotal,
    shipping: totals.shippingCost,
    discount: totalDiscount,
    total: finalTotal,
    appliedCoupon: state.cart.appliedCoupon,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountUntilFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - totals.subtotal),
    validationErrors: totals.validationErrors,
    appliedBenefits: totals.appliedBenefits
  };
};

export const selectCartIsSyncing = (state: RootState) => state.cart.isSyncing;

export const useCartSummaryWithRules = () => {
  useGetCartRulesQuery();
  return useSelector(selectCartSummary);
};

export default cartSlice.reducer;
