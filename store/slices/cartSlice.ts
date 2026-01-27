import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, AppliedCoupon, CouponDiscountType } from '../../types';
import { RootState } from '../index';

// Constants
const FREE_SHIPPING_THRESHOLD = 300; // ILS
const STANDARD_SHIPPING_COST = 29.90; // ILS
const VAT_RATE = 0.17; // 17% Israeli VAT

interface CartState {
  items: CartItem[];
  isInitialized: boolean;
  appliedCoupon: AppliedCoupon | null;
}

// Initial state
const initialState: CartState = {
  items: [],
  isInitialized: false,
  appliedCoupon: null,
};

// Load cart from localStorage
const loadCart = (): CartState => {
  try {
    const saved = localStorage.getItem('cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        items: parsed.items || [],
        isInitialized: true,
        appliedCoupon: parsed.appliedCoupon || null,
      };
    }
  } catch {
    // Silent fail - use initial state
  }
  return { ...initialState, isInitialized: true };
};

// Save cart to localStorage
const saveCart = (state: CartState): void => {
  try {
    localStorage.setItem('cart', JSON.stringify({
      items: state.items,
      appliedCoupon: state.appliedCoupon,
    }));
  } catch {
    // Silent fail
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initializeCart: (state) => {
      const loaded = loadCart();
      state.items = loaded.items;
      state.appliedCoupon = loaded.appliedCoupon;
      state.isInitialized = true;
    },
    
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      
      if (existingItem) {
        // Respect maxQuantity when incrementing
        const newQuantity = existingItem.quantity + action.payload.quantity;
        existingItem.quantity = Math.min(newQuantity, existingItem.maxQuantity);
      } else {
        // Ensure quantity doesn't exceed max
        const item = { ...action.payload };
        item.quantity = Math.min(item.quantity, item.maxQuantity);
        state.items.push(item);
      }
      
      saveCart(state);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      saveCart(state);
    },
    
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find(item => item.productId === action.payload.productId);
      if (item) {
        // Clamp between 1 and maxQuantity
        item.quantity = Math.max(1, Math.min(action.payload.quantity, item.maxQuantity));
        
        // Remove item if quantity is 0 or less (from decrement)
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(i => i.productId !== action.payload.productId);
        }
        
        saveCart(state);
      }
    },
    
    applyCoupon: (state, action: PayloadAction<AppliedCoupon>) => {
      state.appliedCoupon = action.payload;
      saveCart(state);
    },
    
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      saveCart(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.appliedCoupon = null;
      localStorage.removeItem('cart');
    },
  },
});

export const {
  initializeCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  clearCart,
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

export const selectCartDiscount = (state: RootState) => {
  const coupon = state.cart.appliedCoupon;
  if (!coupon) return 0;
  return coupon.discountAmount;
};

export const selectShippingCost = (state: RootState) => {
  const subtotal = selectCartSubtotal(state);
  const coupon = state.cart.appliedCoupon;
  
  // Free shipping coupon
  if (coupon?.discountType === CouponDiscountType.FREE_SHIPPING) {
    return 0;
  }
  
  // Free shipping over threshold
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  
  // Empty cart = no shipping
  if (state.cart.items.length === 0) {
    return 0;
  }
  
  return STANDARD_SHIPPING_COST;
};

export const selectCartTax = (state: RootState) => {
  const subtotal = selectCartSubtotal(state);
  return Math.round(subtotal * VAT_RATE * 100) / 100;
};

export const selectCartTotal = (state: RootState) => {
  const subtotal = selectCartSubtotal(state);
  const shipping = selectShippingCost(state);
  const tax = selectCartTax(state);
  const discount = selectCartDiscount(state);
  
  const total = subtotal + shipping + tax - discount;
  return Math.max(0, Math.round(total * 100) / 100);
};

// Summary selector for checkout
export const selectCartSummary = (state: RootState) => ({
  items: state.cart.items,
  itemCount: selectCartItemCount(state),
  subtotal: selectCartSubtotal(state),
  shipping: selectShippingCost(state),
  tax: selectCartTax(state),
  discount: selectCartDiscount(state),
  total: selectCartTotal(state),
  appliedCoupon: state.cart.appliedCoupon,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  amountUntilFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - selectCartSubtotal(state)),
});

// Legacy selector for backward compatibility
export const selectLegacyCartTotal = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

export default cartSlice.reducer;