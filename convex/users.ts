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
 * Create or update user profile after authentication.
 * 
 * This mutation is called immediately after a user signs up or logs in.
 * It bridges the gap between Convex Auth tables and your custom users table.
 * 
 * Phone number is stored here because it's not part of the standard Password provider.
 */
export const createOrUpdateUserProfile = mutation({
  args: {
    phone: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the current user's identity from auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    const now = new Date().toISOString();

    if (existingUser) {
      // Update existing user with phone and other fields if provided
      await ctx.db.patch(existingUser._id, {
        phone: args.phone,
        ...(args.name && { name: args.name }),
        ...(args.email && { email: args.email }),
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      // Create new user document
      // Note: name and email should come from the auth profile() method
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: identity.tokenIdentifier,
        name: args.name || identity.name || "User",
        email: args.email || identity.email || "",
        phone: args.phone,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    }
  },
});

/**
 * List all users. (Admin only - logical check)
 */
export const listAll = query({
  args: {
    role: v.optional(v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer"))),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))),
  },
  handler: async (ctx, args) => {
    // Note: Add proper admin role check here in production
    let usersQuery = ctx.db.query("users");
    
    // Manual filtering for now as we don't have indexes for these yet
    // In production, add indexes for role and status
    const users = await usersQuery.collect();
    
    return users.filter(user => {
      if (args.role && user.role !== args.role) return false;
      if (args.status && user.status !== args.status) return false;
      return true;
    });
  },
});

/**
 * Delete a user.
 */
export const remove = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});

/**
 * Update a user (Admin).
 */
export const update = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer"))),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
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
