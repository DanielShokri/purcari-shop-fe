import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import { z } from "zod";
import { DataModel } from "./_generated/dataModel";

// Validation schemas matching client-side validation
const emailSchema = z.string()
  .min(1, "אימייל הוא שדה חובה")
  .email("כתובת אימייל לא תקינה");

const passwordSchema = z.string()
  .min(4, "הסיסמה חייבת להכיל לפחות 4 תווים");

const nameSchema = z.string()
  .min(2, "השם חייב להכיל לפחות 2 תווים");

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password<DataModel>({
      validatePasswordRequirements: (password: string) => {
        // Validate password requirements
        const result = passwordSchema.safeParse(password);
        if (!result.success) {
          throw new ConvexError(result.error.errors[0].message);
        }
      },
      profile(params) {
         // Validate and return profile data for the user
         // This extracts email and name from signup/signin params
         const email = params.email as string;
         const name = (params.name as string) || "";

         // Validate email format
         const emailResult = emailSchema.safeParse(email);
         if (!emailResult.success) {
           throw new ConvexError("כתובת אימייל לא תקינה");
         }

         // Validate name if provided
         if (name && name.length > 0) {
           const nameResult = nameSchema.safeParse(name);
           if (!nameResult.success) {
             throw new ConvexError(nameResult.error.errors[0].message);
           }
         }

         return {
           email: emailResult.data,
           name: name || email.split("@")[0], // Use email prefix as fallback name
         };
       },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, input) {
      const now = new Date().toISOString();
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_tokenIdentifier", (q) =>
          q.eq("tokenIdentifier", input.tokenIdentifier)
        )
        .first();

      if (existingUser) {
        await ctx.db.patch(existingUser._id, {
          ...input,
          updatedAt: now,
        });
        return existingUser._id;
      }

      // Create new user with required fields
      return await ctx.db.insert("users", {
        ...input,
        createdAt: now,
        updatedAt: now,
      });
    },
  },
});

/**
 * Future configuration notes:
 * 
 * PASSWORD RESET (Email-based):
 * To add password reset via email, add this to Password config:
 * 
 * import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";
 * 
 * Password({
 *   reset: ResendOTPPasswordReset,
 *   ...
 * })
 * 
 * See convex/auth.ts docs for email provider setup.
 * 
 * OAUTH PROVIDERS:
 * To add Google/GitHub/Apple login, add to providers array:
 * 
 * import { Google } from "@convex-dev/auth/providers/Google";
 * import { GitHub } from "@convex-dev/auth/providers/GitHub";
 * 
 * providers: [
 *   Password(...),
 *   Google({
 *     clientId: process.env.AUTH_GOOGLE_ID!,
 *     clientSecret: process.env.AUTH_GOOGLE_SECRET!,
 *   }),
 *   GitHub({
 *     clientId: process.env.AUTH_GITHUB_ID!,
 *     clientSecret: process.env.AUTH_GITHUB_SECRET!,
 *   }),
 * ]
 * 
 * Remember to update your environment variables and auth tables schema
 * to support multiple providers per user.
 */
