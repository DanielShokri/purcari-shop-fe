import { api } from './baseApi';
import { AuthUser } from '../../types';
import { account } from '../appwrite';

const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthUser, { email: string; password: string }>({
      queryFn: async ({ email, password }) => {
        try {
          // Create session with Appwrite (SDK v21+ object syntax)
          await account.createEmailPasswordSession({ email, password });
          // Fetch user data
          const user = await account.get();
          const authUser: AuthUser = { 
            $id: user.$id, 
            name: user.name, 
            email: user.email, 
            prefs: user.prefs 
          };
          return { data: authUser };
        } catch (error: any) {
          // Handle Appwrite-specific errors
          const message = error.message || 'פרטי התחברות שגויים';
          return { error: message };
        }
      },
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<boolean, void>({
      queryFn: async () => {
        try {
          await account.deleteSession({ sessionId: 'current' });
          return { data: true };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['User'],
    }),

    getCurrentUser: builder.query<AuthUser | null, void>({
      queryFn: async () => {
        try {
          // Check if user has an active session
          const user = await account.get();
          const authUser: AuthUser = { 
            $id: user.$id, 
            name: user.name, 
            email: user.email, 
            prefs: user.prefs 
          };
          return { data: authUser };
        } catch (error: any) {
          // No active session - return null (not an error)
          return { data: null };
        }
      },
      providesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useLoginMutation, 
  useLogoutMutation, 
  useGetCurrentUserQuery 
} = authApi;
