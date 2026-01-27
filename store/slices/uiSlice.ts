import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Toast, ToastType } from '../../types';

interface UIState {
  isCartModalOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchModalOpen: boolean;
  toasts: Toast[];
}

const initialState: UIState = {
  isCartModalOpen: false,
  isMobileMenuOpen: false,
  isSearchModalOpen: false,
  toasts: [],
};

// Helper to generate unique toast IDs
let toastIdCounter = 0;
const generateToastId = () => `toast-${Date.now()}-${++toastIdCounter}`;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCartModal: (state) => {
      state.isCartModalOpen = !state.isCartModalOpen;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeCartModal: (state) => {
      state.isCartModalOpen = false;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    openSearchModal: (state) => {
      state.isSearchModalOpen = true;
    },
    closeSearchModal: (state) => {
      state.isSearchModalOpen = false;
    },
    // Toast actions
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'> & { id?: string }>) => {
      const toast: Toast = {
        id: action.payload.id || generateToastId(),
        type: action.payload.type,
        message: action.payload.message,
        duration: action.payload.duration ?? 4000,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { 
  toggleCartModal, 
  toggleMobileMenu, 
  closeCartModal, 
  closeMobileMenu, 
  openSearchModal, 
  closeSearchModal,
  addToast,
  removeToast,
  clearAllToasts,
} = uiSlice.actions;

// Helper action creator for showing toasts with auto-generated ID
export const showToast = (payload: { type: ToastType; message: string; duration?: number }) => 
  addToast(payload);

// Selectors
export const selectIsCartModalOpen = (state: RootState) => state.ui.isCartModalOpen;
export const selectIsMobileMenuOpen = (state: RootState) => state.ui.isMobileMenuOpen;
export const selectIsSearchModalOpen = (state: RootState) => state.ui.isSearchModalOpen;
export const selectToasts = (state: RootState) => state.ui.toasts;

export default uiSlice.reducer;