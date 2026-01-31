import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List all addresses for a user.
 */
export const list = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userAddresses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Create a new address for a user.
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    street: v.string(),
    apartment: v.optional(v.string()),
    city: v.string(),
    postalCode: v.string(),
    country: v.string(),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId, isDefault, ...addressFields } = args;

    if (isDefault) {
      // Unset any existing default addresses for this user
      const existingAddresses = await ctx.db
        .query("userAddresses")
        .withIndex("by_userId_default", (q) =>
          q.eq("userId", userId).eq("isDefault", true)
        )
        .collect();

      for (const address of existingAddresses) {
        await ctx.db.patch(address._id, { isDefault: false });
      }
    }

    const addressId = await ctx.db.insert("userAddresses", {
      userId,
      isDefault,
      ...addressFields,
      createdAt: new Date().toISOString(),
    });

    return addressId;
  },
});

/**
 * Update an existing address.
 */
export const update = mutation({
  args: {
    addressId: v.id("userAddresses"),
    name: v.optional(v.string()),
    street: v.optional(v.string()),
    apartment: v.optional(v.string()),
    city: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { addressId, isDefault, ...fields } = args;
    const existing = await ctx.db.get(addressId);
    if (!existing) throw new Error("Address not found");

    if (isDefault === true && !existing.isDefault) {
      // Unset other defaults if this one is becoming the default
      const userId = existing.userId;
      const otherDefaults = await ctx.db
        .query("userAddresses")
        .withIndex("by_userId_default", (q) =>
          q.eq("userId", userId).eq("isDefault", true)
        )
        .collect();

      for (const address of otherDefaults) {
        await ctx.db.patch(address._id, { isDefault: false });
      }
    }

    await ctx.db.patch(addressId, {
      ...fields,
      ...(isDefault !== undefined ? { isDefault } : {}),
    });
  },
});

/**
 * Remove an address.
 */
export const remove = mutation({
  args: {
    addressId: v.id("userAddresses"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.addressId);
  },
});

/**
 * Explicitly set an address as the default for a user.
 */
export const setDefault = mutation({
  args: {
    addressId: v.id("userAddresses"),
  },
  handler: async (ctx, args) => {
    const address = await ctx.db.get(args.addressId);
    if (!address) throw new Error("Address not found");

    if (address.isDefault) return;

    // Unset other defaults
    const userId = address.userId;
    const otherDefaults = await ctx.db
      .query("userAddresses")
      .withIndex("by_userId_default", (q) =>
        q.eq("userId", userId).eq("isDefault", true)
      )
      .collect();

    for (const addr of otherDefaults) {
      await ctx.db.patch(addr._id, { isDefault: false });
    }

    // Set this one as default
    await ctx.db.patch(args.addressId, { isDefault: true });
  },
});
