import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './services/api/index';
import { AuthUser } from './types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Safe LocalStorage Wrapper
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('LocalStorage access denied:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage access denied:', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('LocalStorage access denied:', e);
    }
  }
};

interface AuthState {
  user: AuthUser | null;
  isInitialized: boolean; // Track if we've checked for existing session
}

// Note: Appwrite manages sessions via cookies, so we don't store tokens
// We only cache user data for quick UI access
const storedUser = safeLocalStorage.getItem('user');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser }>) => {
      state.user = action.payload.user;
      state.isInitialized = true;
      safeLocalStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    logoutUser: (state) => {
      state.user = null;
      safeLocalStorage.removeItem('user');
    },
  },
});

export const { setCredentials, setInitialized, logoutUser } = authSlice.actions;

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;