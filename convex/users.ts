import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Get current user's profile.
 * 
 * In a real-world scenario, the `auth.getUserIdentity` or Convex Auth context
 * would provide the current user's tokenIdentifier.
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  },
});

/**
 * List all users. (Admin only - logical check)
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Note: Add proper admin role check here in production
    return await ctx.db.query("users").collect();
  },
});

/**
 * Update user role.
 */
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: new Date().toISOString(),
    });
  },
});

/**
 * Update user status.
 */
export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });
  },
});

/**
 * Update current user's profile information.
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      ...args,
      updatedAt: new Date().toISOString(),
    });

    return user._id;
  },
});

/**
 * Get current user's cart.
 */
export const getCart = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return null;
    }

    return user.cart ?? null;
  },
});

/**
 * Update current user's cart.
 */
export const updateCart = mutation({
  args: {
    cart: v.object({
      items: v.array(v.any()),
      appliedCoupon: v.optional(v.any()),
      updatedAt: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      cart: args.cart,
      updatedAt: new Date().toISOString(),
    });

    return user._id;
  },
});
