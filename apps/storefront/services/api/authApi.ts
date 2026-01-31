import baseApi from '@shared/api';
import { account } from '@shared/services';
import { ID } from 'appwrite';
import { AuthUser, UserPreferences, ShippingAddress } from '@shared/types';

export const authApi = baseApi.injectEndpoints({
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
          return { data: { $id: user._id, name: user.name, email: user.email, phone: (user.prefs as any)?.phone || user.phone } };
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
           // CRITICAL: Clear any existing sessions first to avoid "session is active" error
           try {
             await account.deleteSession('current');
           } catch {
             // No active session, which is fine
           }
           
           // Now create a new session
           await account.createEmailPasswordSession({ email, password });
          const user = await account.get();
          return { data: { $id: user._id, name: user.name, email: user.email, phone: (user.prefs as any)?.phone || user.phone } };
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
          return { data: { $id: user._id, name: user.name, email: user.email, phone: (user.prefs as any)?.phone || user.phone } };
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
          return { data: { $id: user._id, name: user.name, email: user.email, phone: (user.prefs as any)?.phone || user.phone } };
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
    logout: builder.mutation<boolean, void>({
      queryFn: async () => {
        try {
          await account.deleteSession('current');
          return { data: true };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בהתנתקות' };
        }
      },
      invalidatesTags: ['User', 'Orders'],
    }),

    // Request password reset
    requestPasswordReset: builder.mutation<boolean, string>({
      queryFn: async (email) => {
        try {
          await account.createRecovery(
            email,
            `${window.location.origin}/reset-password`
          );
          return { data: true };
        } catch (error: any) {
          // Don't reveal if email exists for security
          return { data: true };
        }
      },
    }),

    // Complete password reset
    resetPassword: builder.mutation<boolean, { userId: string; secret: string; password: string; passwordAgain: string }>({
      queryFn: async ({ userId, secret, password, passwordAgain }) => {
        try {
          await account.updateRecovery(userId, secret, password, passwordAgain);
          return { data: true };
        } catch (error: any) {
          if (error.code === 401) {
            return { error: 'קישור לאיפוס סיסמה פג תוקף' };
          }
          return { error: error.message || 'שגיאה באיפוס סיסמה' };
        }
      },
    }),

    // Update address in preferences
    updateAddress: builder.mutation<UserPreferences, { address: ShippingAddress; isDefault?: boolean }>({
      queryFn: async ({ address, isDefault }) => {
        try {
          const currentPrefs = await account.getPrefs() as UserPreferences;
          const addresses = currentPrefs.addresses || [];
          
          // Generate ID for new address
          const addressWithId = {
            ...address,
            id: `addr_${Date.now()}`,
            name: address.city, // Use city as default label
            isDefault: isDefault || addresses.length === 0,
          };
          
          // If setting as default, unset other defaults
          const updatedAddresses = isDefault
            ? addresses.map(a => ({ ...a, isDefault: false }))
            : addresses;
          
          updatedAddresses.push(addressWithId);
          
          const updatedPrefs = { ...currentPrefs, addresses: updatedAddresses };
          const result = await account.updatePrefs(updatedPrefs);
          return { data: result as UserPreferences };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בשמירת כתובת' };
        }
      },
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
  useGetUserPrefsQuery,
  useUpdateUserPrefsMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useUpdateAddressMutation,
} = authApi;
