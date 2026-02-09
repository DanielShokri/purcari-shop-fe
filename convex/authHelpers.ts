import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { v } from "convex/values";

/**
 * Check if the current user has admin role.
 * Returns the user object if admin, null if not admin or not authenticated.
 */
export const getCurrentAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    
    if (userId === null) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      return null;
    }

    return user;
  },
});

/**
 * Verify admin access and throw error if not admin.
 * Use this in mutations and queries that require admin privileges.
 */
export const requireAdmin = async (ctx: any): Promise<string> => {
  const userId = await getAuthUserId(ctx);
  
  if (userId === null) {
    throw new ConvexError("דורש התחברות");
  }

  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") {
    throw new ConvexError("גישה נדחתה - דרושות הרשאות מנהל");
  }

  return userId;
};

/**
 * Create a mutation that requires admin privileges.
 * Wraps the handler with automatic admin verification.
 * 
 * Usage:
 * export const create = adminMutation({
 *   args: { name: v.string() },
 *   handler: async (ctx, args) => {
 *     // This only runs if user is admin
 *     return await ctx.db.insert("products", { name: args.name });
 *   },
 * });
 */
export function adminMutation<Args extends Record<string, any>, Return>(
  config: {
    args: { [K in keyof Args]: any };
    handler: (ctx: any, args: Args) => Promise<Return>;
  }
) {
  return mutation({
    args: config.args,
    handler: async (ctx, args) => {
      await requireAdmin(ctx);
      return config.handler(ctx, args);
    },
  });
}

/**
 * Create a query that requires admin privileges.
 * Wraps the handler with automatic admin verification.
 */
export function adminQuery<Args extends Record<string, any>, Return>(
  config: {
    args: { [K in keyof Args]: any };
    handler: (ctx: any, args: Args) => Promise<Return>;
  }
) {
  return query({
    args: config.args,
    handler: async (ctx, args) => {
      await requireAdmin(ctx);
      return config.handler(ctx, args);
    },
  });
}
