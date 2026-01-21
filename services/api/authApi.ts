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
      phone?: string;
    }>({
      queryFn: async ({ email, password, name, phone }) => {
        try {
          // Create account
          await account.create(ID.unique(), email, password, name);
          
          // Auto-login after registration
          await account.createEmailPasswordSession({ email, password });
          
          // Save phone to preferences if provided
          if (phone) {
            await account.updatePrefs({ phone });
          }
          
          const user = await account.get();
          return { data: { $id: user.$id, name: user.name, email: user.email, phone: (user.prefs as any)?.phone || user.phone } };
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
          return { data: { $id: user.$id, name: user.name, email: user.email, phone: (user.prefs as any)?.phone || user.phone } };
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
          return { data: { $id: user.$id, name: user.name, email: user.email, phone: (user.prefs as any)?.phone || user.phone } };
        } catch {
          return { data: null }; // No active session
        }
      },
      providesTags: ['User'],
    }),

    // Update profile (name, phone)
    updateProfile: builder.mutation<AuthUser, { name: string; phone?: string }>({
      queryFn: async ({ name, phone }) => {
        try {
          if (name) await account.updateName(name);
          if (phone !== undefined) {
            const currentPrefs = await account.getPrefs();
            await account.updatePrefs({ ...currentPrefs, phone });
          }
          const user = await account.get();
          return { data: { $id: user.$id, name: user.name, email: user.email, phone: (user.prefs as any)?.phone || user.phone } };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בעדכון הפרופיל' };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Get user preferences (addresses)
    getUserPrefs: builder.query<UserPreferences, void>({
      queryFn: async () => {
        try {
          const prefs = await account.getPrefs();
          return { data: prefs as UserPreferences };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת העדפות' };
        }
      },
      providesTags: ['User'],
    }),

    // Update user preferences
    updateUserPrefs: builder.mutation<UserPreferences, UserPreferences>({
      queryFn: async (prefs) => {
        try {
          const currentPrefs = await account.getPrefs();
          const updatedPrefs = { ...currentPrefs, ...prefs };
          const result = await account.updatePrefs(updatedPrefs);
          return { data: result as UserPreferences };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בעדכון העדפות' };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Logout
    logout: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          await account.deleteSession('current');
          return { data: null };
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
  useUpdateProfileMutation,
  useGetUserPrefsQuery,
  useUpdateUserPrefsMutation,
} = authApi;
