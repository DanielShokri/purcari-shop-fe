import { ReactNode } from "react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

// unsavedChangesWarning: false — disables the built-in beforeunload listener
// that shows "Leave page?" during OAuth redirects (Google sign-in).
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL, {
  unsavedChangesWarning: false,
});

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
}
