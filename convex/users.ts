import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { auth } from "./auth";
import { requireAdmin } from "./authHelpers";

/**
 * Get current user's full profile including addresses.
 * Uses Convex Auth's getAuthUserId to reliably get the authenticated user ID.
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    // Use getAuthUserId for reliable auth user lookup
    const userId = await getAuthUserId(ctx);
    
    if (userId === null) {
      return null;
    }

    // Fetch user by ID
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    // Fetch all addresses linked to this user
    const addresses = await ctx.db
      .query("userAddresses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Return combined profile with addresses
    return {
      ...user,
      addresses,
    };
  },
});

/**
 * Create or update user profile after authentication.
 * 
 * This mutation updates the user profile with phone number and other custom fields.
 * The user is already created by Convex Auth's createOrUpdateUser callback.
 */
export const createOrUpdateUserProfile = mutation({
  args: {
    phone: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to get identity, but if not available, use email to find user
    const identity = await ctx.auth.getUserIdentity();
    const userEmail = identity?.email || args.email;

    if (!userEmail) {
      throw new Error("User not authenticated and no email provided");
    }

    // Check if user already exists by email
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) =>
        q.eq("email", userEmail)
      )
      .unique();

    const now = new Date().toISOString();

    if (existingUser) {
      // Update existing user with phone and other fields if provided
      await ctx.db.patch(existingUser._id, {
        phone: args.phone,
        ...(args.name && { name: args.name }),
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      // Create new user document if not exists
      const userId = await ctx.db.insert("users", {
        name: args.name || identity?.name || "User",
        email: userEmail,
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
 * List all users. (Admin only)
 */
export const listAll = query({
  args: {
    role: v.optional(v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer"))),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))),
  },
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx);
    
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
 * Delete a user. (Admin only)
 */
export const remove = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx);
    await ctx.db.delete(args.userId);
  },
});

/**
 * Update a user (Admin only).
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
    // Verify admin access
    await requireAdmin(ctx);
    
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
});

/**
 * Update user role. (Admin only)
 */
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx);
    
    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: new Date().toISOString(),
    });
  },
});

/**
 * Update user status. (Admin only)
 */
export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended")),
  },
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx);
    
    await ctx.db.patch(args.userId, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });
  },
});

/**
 * Update current user's profile information.
 * Uses getAuthUserId for reliable auth user lookup (consistent with get query).
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Use getAuthUserId for reliable auth user lookup
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      ...args,
      updatedAt: new Date().toISOString(),
    });

    return userId;
  },
});

/**
 * Get current user's cart.
 */
export const getCart = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const user = await ctx.db.get(userId);
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
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
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
