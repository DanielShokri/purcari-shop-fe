// Auth and User Types

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive'
}

// AuthUser - represents the currently authenticated user from Appwrite Account API
export interface AuthUser {
  $id: string;
  name: string;
  email: string;
  prefs?: Record<string, any>;
}

// AppwriteUser - raw user structure from Appwrite Users API
export interface AppwriteUser {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  phone: string;
  status: boolean; // true = active, false = blocked
  labels: string[]; // roles stored as labels (e.g., ['admin'])
  registration: string; // ISO Date string
  emailVerification: boolean;
  phoneVerification: boolean;
  mfa: boolean;
  prefs: Record<string, any>;
  accessedAt: string;
}

// User - represents a user entity for UI display (mapped from AppwriteUser)
export interface User {
  $id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  joinedAt: string; // ISO Date string (mapped from registration)
  prefs?: Record<string, any>;
}

// Helper to map Appwrite user to UI User type
export function mapAppwriteUserToUser(appwriteUser: AppwriteUser): User {
  // Extract role from labels (first matching role label, default to VIEWER)
  const roleLabels = [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER];
  const role = appwriteUser.labels.find(label => 
    roleLabels.includes(label as UserRole)
  ) as UserRole || UserRole.VIEWER;

  // Map boolean status to UserStatus enum
  const status = appwriteUser.status ? UserStatus.ACTIVE : UserStatus.SUSPENDED;

  return {
    $id: appwriteUser.$id,
    name: appwriteUser.name,
    email: appwriteUser.email,
    role,
    status,
    avatar: appwriteUser.prefs?.avatar,
    joinedAt: appwriteUser.registration,
    prefs: appwriteUser.prefs,
  };
}

export interface AuthState {
  user: User | null;
  session: any | null;
  isAuthenticated: boolean;
}
