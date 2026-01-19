import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../index';

interface UIState {
  isCartModalOpen: boolean;
  isMobileMenuOpen: boolean;
}

const initialState: UIState = {
  isCartModalOpen: false,
  isMobileMenuOpen: false,
};

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
    }
  },
});

export const { toggleCartModal, toggleMobileMenu, closeCartModal, closeMobileMenu } = uiSlice.actions;

export const selectIsCartModalOpen = (state: RootState) => state.ui.isCartModalOpen;
export const selectIsMobileMenuOpen = (state: RootState) => state.ui.isMobileMenuOpen;

export default uiSlice.reducer;