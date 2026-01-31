import { api } from '@shared/api';
import { User, UserRole, UserStatus, AppwriteUser, mapAppwriteUserToUser } from '@shared/types';
import { usersApi } from '@shared/services';
import { ID } from 'appwrite';

const usersApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      queryFn: async () => {
        try {
          // Fetch users from Appwrite Users API
          const response = await usersApi.list();
          const appwriteUsers: AppwriteUser[] = response.users || [];
          
          // Map Appwrite users to our User type
          const users: User[] = appwriteUsers.map(mapAppwriteUserToUser);
          
          return { data: users };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בטעינת משתמשים' };
        }
      },
      providesTags: ['Users'],
    }),

    createUser: builder.mutation<User, { email: string; password: string; name: string; role?: UserRole }>({
      queryFn: async ({ email, password, name, role = UserRole.VIEWER }) => {
        try {
          // Create user with Appwrite Users API via Cloud Function
          const userId = ID.unique();
          const appwriteUser = await usersApi.create(userId, email, password, name, role);
          
          // Map to our User type
          const user = mapAppwriteUserToUser(appwriteUser as AppwriteUser);
          
          return { data: user };
        } catch (error: any) {
          return { error: error.message || 'שגיאה ביצירת משתמש' };
        }
      },
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation<User, { id: string; name?: string; email?: string; phone?: string; address?: string; role?: UserRole; status?: UserStatus; avatar?: string }>({
      queryFn: async ({ id, name, email, phone, address, role, status, avatar }) => {
        try {
          // Update each field that was provided
          if (name !== undefined) {
            await usersApi.updateName(id, name);
          }
          
          if (email !== undefined) {
            await usersApi.updateEmail(id, email);
          }

          if (phone !== undefined) {
            await usersApi.updatePhone(id, phone);
          }
          
          if (role !== undefined) {
            // Update role via labels (replace existing role labels)
            await usersApi.updateLabels(id, [role]);
          }
          
          if (status !== undefined) {
            // Map UserStatus to boolean (ACTIVE = true, SUSPENDED/INACTIVE = false)
            const statusBool = status === UserStatus.ACTIVE;
            await usersApi.updateStatus(id, statusBool);
          }
          
          if (avatar !== undefined || address !== undefined) {
            // Get current prefs and update
            const currentUser = await usersApi.get(id);
            const updatedPrefs = { ...currentUser.prefs };
            
            if (avatar !== undefined) updatedPrefs.avatar = avatar;
            if (address !== undefined) updatedPrefs.address = address;
            
            await usersApi.updatePrefs(id, updatedPrefs);
          }
          
          // Fetch updated user
          const appwriteUser = await usersApi.get(id);
          const user = mapAppwriteUserToUser(appwriteUser as AppwriteUser);
          
          return { data: user };
        } catch (error: any) {
          return { error: error.message || 'שגיאה בעדכון משתמש' };
        }
      },
      invalidatesTags: ['Users']
    }),

    deleteUser: builder.mutation<boolean, string>({
      queryFn: async (userId: string) => {
        try {
          await usersApi.delete(userId);
          return { data: true };
        } catch (error: any) {
          return { error: error.message || 'שגיאה במחיקת משתמש' };
        }
      },
      invalidatesTags: ['Users']
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApiSlice;
