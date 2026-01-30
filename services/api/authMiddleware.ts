import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import { logoutUser } from '../../store';
import type { RootState } from '../../store';

/**
 * RTK Query middleware to handle 401 errors globally.
 * When a 401 error is detected from any API endpoint, it automatically
 * logs out the user and clears their session.
 *
 * Optimization: Only dispatches logout if user is still logged in
 * to prevent redundant logouts on multiple 401 errors in rapid succession.
 */
export const authMiddleware: Middleware = (store) => (next) => (action) => {
  // Check if the action is a rejected RTK Query action
  if (isRejectedWithValue(action)) {
    const payload = action.payload as any;
    
    // Check for 401 status code or unauthorized_scope error type
    const is401Error =
      (payload?.status === 401) ||
      (payload?.data?.type === 'unauthorized_scope') ||
      (payload?.message?.includes('401')) ||
      (payload?.message?.includes('unauthorized'));

    if (is401Error) {
      // Only dispatch logout if user is still logged in
      // This prevents redundant logouts when multiple 401s arrive rapidly
      const state = store.getState() as RootState;
      if (state.auth.user) {
        store.dispatch(logoutUser());
      }
    }
  }

  return next(action);
};
