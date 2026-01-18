// Base API - must be imported first
export { api } from './baseApi';

// Domain-specific API slices (inject endpoints into base API)
export * from './authApi';
export * from './productsApi';
export * from './usersApi';
export * from './categoriesApi';
export * from './ordersApi';
export * from './dashboardApi';
