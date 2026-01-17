import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './services/api';
import { User } from './types';
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
  user: User | null;
  token: string | null;
}

const storedUser = safeLocalStorage.getItem('user');
const storedToken = safeLocalStorage.getItem('token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      safeLocalStorage.setItem('user', JSON.stringify(action.payload.user));
      safeLocalStorage.setItem('token', action.payload.token);
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      safeLocalStorage.removeItem('user');
      safeLocalStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logoutUser } = authSlice.actions;

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