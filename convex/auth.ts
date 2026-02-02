import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import { z } from "zod";
import { DataModel } from "./_generated/dataModel";

const emailSchema = z.string().min(1, "אימייל הוא שדה חובה").email("כתובת אימייל לא תקינה");

const passwordSchema = z.string().min(4, "הסיסמה חייבת להכיל לפחות 4 תווים");

const nameSchema = z.string().min(2, "השם חייב להכיל לפחות 2 תווים");

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password<DataModel>({
      validatePasswordRequirements: (password: string) => {
        const result = passwordSchema.safeParse(password);
        if (!result.success) {
          throw new ConvexError(result.error.message);
        }
      },
      profile(params) {
        const email = params.email as string;
        const name = (params.name as string) || "";
        const phone = (params.phone as string) || "";

        const emailResult = emailSchema.safeParse(email);
        if (!emailResult.success) {
          throw new ConvexError("כתובת אימייל לא תקינה");
        }

        if (name && name.length > 0) {
          const nameResult = nameSchema.safeParse(name);
          if (!nameResult.success) {
            throw new ConvexError(nameResult.error.message);
          }
        }

        return {
          email: emailResult.data,
          name: name || email.split("@")[0],
          phone: phone || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }

      const now = new Date().toISOString();
      return await ctx.db.insert("users", {
        ...args.profile,
        createdAt: now,
        updatedAt: now,
      });
    },
  },
});
