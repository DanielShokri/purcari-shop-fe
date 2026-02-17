import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export function useAuth() {
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();
  const createUserProfile = useMutation(api.users.createOrUpdateUserProfile);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseError = (err: unknown, isLogin: boolean): string => {
    const message = (err as Error)?.message || "";

    if (message.includes("Invalid password") || message.includes("הסיסמה")) {
      return "הסיסמה לא עומדת בדרישות. הסיסמה חייבת להכיל לפחות 4 תווים.";
    }
    if (message.includes("User does not exist") || message.includes("Invalid credentials")) {
      return "לא קיים משתמש עם כתובת אימייל זו.";
    }
    if (message.includes("Incorrect password")) {
      return "הסיסמה שהוזנה אינה נכונה.";
    }
    if (message.includes("already exists") || message.includes("constraint")) {
      return "כתובת אימייל זו כבר רשומה במערכת.";
    }
    if (message.includes("Invalid email") || message.includes("אימייל")) {
      return "כתובת אימייל לא תקינה.";
    }

    return isLogin
      ? "שגיאה בהתחברות. אנא בדקו את הפרטים ונסו שוב."
      : "שגיאה בהרשמה. אנא נסו שוב מאוחר יותר.";
  };

  const parseGoogleError = (err: unknown): string => {
    const message = (err as Error)?.message || "";

    // OAuth specific errors
    if (message.includes("popup_closed") || message.includes("closed")) {
      return "ההתחברות בוטלה";
    }
    if (message.includes("popup_blocked") || message.includes("blocked")) {
      return "חלון ההתחברות נחסם. אנא אפשרו חלונות קופצים לאתר זה.";
    }
    if (message.includes("access_denied")) {
      return "ההתחברות נדחתה. אנא אשרו את הגישה המבוקשת.";
    }

    return "שגיאה בהתחברות עם Google. אנא נסו שוב.";
  };

  const signUp = async (data: SignUpInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await convexSignIn("password", {
        email: data.email,
        password: data.password,
        name: data.name,
        flow: "signUp",
      });

      await createUserProfile({
        phone: data.phone,
        name: data.name,
        email: data.email,
      });

      return true;
    } catch (err) {
      console.error("Sign up error:", err);
      setError(parseError(err, false));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (data: SignInInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await convexSignIn("password", {
        email: data.email,
        password: data.password,
        flow: "signIn",
      });

      // Ensure user profile exists in database after sign in
      await createUserProfile({
        phone: "", // Phone is optional in schema, will be updated later
        email: data.email,
      });

      return true;
    } catch (err) {
      console.error("Sign in error:", err);
      setError(parseError(err, true));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    await convexSignOut();
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const result = await convexSignIn("google");
      
      // If there's a redirect URL, open it in a popup instead of redirecting the page
      if (result?.redirect) {
        const popup = window.open(
          result.redirect.toString(),
          "google-oauth",
          "width=500,height=600,scrollbars=yes"
        );
        
        if (!popup) {
          setError("אנא אפשרו חלונות קופצים (pop-ups) עבור אתר זה");
          setIsGoogleLoading(false);
          return false;
        }
        
        // Listen for the OAuth callback to complete
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            setIsGoogleLoading(false);
          }
        }, 500);
        
        return true;
      }
      
      // If no redirect (immediate success), clear loading
      setIsGoogleLoading(false);
      return true;
    } catch (err) {
      console.error("Google sign in error:", err);
      setError(parseGoogleError(err));
      setIsGoogleLoading(false);
      return false;
    }
  };

  const clearError = () => setError(null);

  return {
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    isLoading,
    isGoogleLoading,
    error,
    clearError,
  };
}
