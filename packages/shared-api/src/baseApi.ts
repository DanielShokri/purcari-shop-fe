import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Base RTK Query API Configuration
 * 
 * This is the base API definition that both the admin dashboard and storefront use.
 * Specific endpoints are injected by domain slices (e.g., productsSlice, ordersSlice).
 * 
 * Tag Types define cache invalidation categories:
 * - Products: Product catalog data
 * - Categories: Product categories
 * - Cart: Shopping cart state (storefront only)
 * - Orders: Order data (admin & storefront)
 * - User/Users: User profile and user management data
 * - Search: Search results cache
 * - Coupons: Coupon data
 * - CartRules: Cart rules (automatic discounts, restrictions)
 * - Analytics: Analytics event data (admin only)
 * - Notifications: Notification data (admin only)
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  // Define all possible tag types used across both apps
  tagTypes: [
    'Products',
    'Categories',
    'Cart',
    'Orders',
    'User',           // Single user (current user profile)
    'Users',          // Multiple users (admin user management)
    'Search',
    'Coupons',
    'CartRules',
    'Analytics',
    'Notifications',
  ],
  endpoints: () => ({}), // Empty - endpoints injected by domain slices
});

export default baseApi;
