import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../index';

interface UIState {
  isCartModalOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchModalOpen: boolean;
}

const initialState: UIState = {
  isCartModalOpen: false,
  isMobileMenuOpen: false,
  isSearchModalOpen: false,
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
    },
    openSearchModal: (state) => {
      state.isSearchModalOpen = true;
    },
    closeSearchModal: (state) => {
      state.isSearchModalOpen = false;
    },
  },
});

export const { toggleCartModal, toggleMobileMenu, closeCartModal, closeMobileMenu, openSearchModal, closeSearchModal } = uiSlice.actions;

export const selectIsCartModalOpen = (state: RootState) => state.ui.isCartModalOpen;
export const selectIsMobileMenuOpen = (state: RootState) => state.ui.isMobileMenuOpen;
export const selectIsSearchModalOpen = (state: RootState) => state.ui.isSearchModalOpen;

export default uiSlice.reducer;