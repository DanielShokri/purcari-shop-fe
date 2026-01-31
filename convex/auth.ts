import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      validatePasswordRequirements: (password: string) => {
        // Minimum 4 characters, no special requirements
        if (!password || password.length < 4) {
          throw new ConvexError("הסיסמה חייבת להכיל לפחות 4 תווים");
        }
      },
    }),
  ],
});
