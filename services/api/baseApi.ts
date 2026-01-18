import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

// Base API definition - endpoints are injected by domain slices
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Products', 'Categories', 'User', 'Users', 'Orders'],
  endpoints: () => ({}), // Empty - endpoints injected by slices
});
