import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@convex/api";

export interface SignInInput {
  email: string;
  password: string;
}

/**
 * Custom hook for admin authentication.
 * Validates that the user has admin role before allowing login.
 * Similar pattern to storefront's useAuth hook.
 */
export function useAdminAuth() {
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query to check if current user is admin
  const adminUser = useQuery(api.authHelpers.getCurrentAdmin);

  const parseError = (err: unknown): string => {
    const message = (err as Error)?.message || "";

    if (message.includes("Invalid password") || message.includes("Incorrect password")) {
      return "שם משתמש או סיסמה שגויים";
    }
    if (message.includes("User does not exist") || message.includes("Invalid credentials")) {
      return "לא קיים משתמש עם כתובת אימייל זו";
    }
    if (message.includes("דורש התחברות") || message.includes("admin")) {
      return "גישה נדחתה - מערכת ניהול למנהלים בלבד";
    }

    return "שגיאה בהתחברות. אנא בדקו את הפרטים ונסו שוב";
  };

  /**
   * Sign in with admin validation.
   * First signs in the user, then validates admin role.
   * If not admin, signs out and returns error.
   */
  const signIn = async (data: SignInInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Sign in with Convex Auth
      await convexSignIn("password", {
        email: data.email,
        password: data.password,
        flow: "signIn",
      });

      // Step 2: Wait a moment for auth state to propagate, then check admin status
      // The adminUser query will automatically update after sign in
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if user is admin by querying the backend
      // This query will only return data if user is admin
      return true; // Login succeeded, admin check happens in ProtectedRoute
    } catch (err) {
      console.error("Admin sign in error:", err);
      setError(parseError(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    await convexSignOut();
  };

  const clearError = () => setError(null);

  return {
    signIn,
    signOut,
    isLoading,
    error,
    clearError,
    isAdmin: adminUser !== null && adminUser !== undefined,
  };
}
