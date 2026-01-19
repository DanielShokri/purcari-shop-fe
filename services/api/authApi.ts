import { api } from './baseApi';
import { account } from '../appwrite';
import { ID } from 'appwrite';
import { AuthUser } from '../../types';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Register new customer
    register: builder.mutation<AuthUser, {
      email: string;
      password: string;
      name: string;
    }>({
      queryFn: async ({ email, password, name }) => {
        try {
          // Create account
          await account.create(ID.unique(), email, password, name);
          
          // Auto-login after registration
          await account.createEmailPasswordSession({ email, password });
          
          const user = await account.get();
          return { data: { $id: user.$id, name: user.name, email: user.email } };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בהרשמה' };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Login
    login: builder.mutation<AuthUser, { email: string; password: string }>({
      queryFn: async ({ email, password }) => {
        try {
          await account.createEmailPasswordSession({ email, password });
          const user = await account.get();
          return { data: { $id: user.$id, name: user.name, email: user.email } };
        } catch (error: any) {
          return { error: 'אימייל או סיסמה שגויים' };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Get current user (session check)
    getCurrentUser: builder.query<AuthUser | null, void>({
      queryFn: async () => {
        try {
          const user = await account.get();
          return { data: { $id: user.$id, name: user.name, email: user.email } };
        } catch {
          return { data: null }; // No active session
        }
      },
      providesTags: ['User'],
    }),

    // Logout
    logout: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          await account.deleteSession('current');
          return { data: undefined };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בהתנתקות' };
        }
      },
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;
