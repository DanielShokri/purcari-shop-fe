import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Admin: List all coupons.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("coupons").order("desc").collect();
  },
});

/**
 * Get coupon by code.
 */
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .unique();
  },
});

/**
 * Admin: Create a new coupon.
 */
export const create = mutation({
  args: {
    code: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("expired"),
      v.literal("scheduled")
    ),
    description: v.optional(v.string()),
    discountType: v.union(
      v.literal("percentage"),
      v.literal("fixed_amount"),
      v.literal("free_shipping"),
      v.literal("free_product"),
      v.literal("buy_x_get_y")
    ),
    discountValue: v.float64(),
    buyQuantity: v.optional(v.int64()),
    getQuantity: v.optional(v.int64()),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    minimumOrder: v.optional(v.float64()),
    maximumDiscount: v.optional(v.float64()),
    usageLimit: v.optional(v.int64()),
    usageLimitPerUser: v.optional(v.int64()),
    categoryIds: v.optional(v.array(v.string())),
    productIds: v.optional(v.array(v.string())),
    userIds: v.optional(v.array(v.string())),
    firstPurchaseOnly: v.optional(v.boolean()),
    excludeOtherCoupons: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("coupons", {
      ...args,
      code: args.code.toUpperCase(),
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Admin: Update an existing coupon.
 */
export const update = mutation({
  args: {
    id: v.id("coupons"),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("expired"),
      v.literal("scheduled")
    )),
    description: v.optional(v.string()),
    discountValue: v.optional(v.float64()),
    endDate: v.optional(v.string()),
    usageLimit: v.optional(v.int64()),
    usageLimitPerUser: v.optional(v.int64()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    await ctx.db.patch(id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  },
});

/**
 * Admin: Remove a coupon.
 */
export const remove = mutation({
  args: { id: v.id("coupons") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Increment coupon usage.
 */
export const incrementUsage = mutation({
  args: {
    code: v.string(),
    userEmail: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const code = args.code.toUpperCase();
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();

    if (!coupon) throw new Error("Coupon not found");

    const now = new Date().toISOString();

    // 1. Update global usage count
    await ctx.db.patch(coupon._id, {
      usageCount: coupon.usageCount + 1,
      updatedAt: now,
    });

    // 2. Track per-user usage
    const existingUsage = await ctx.db
      .query("couponUsage")
      .withIndex("by_couponCode_userEmail", (q) =>
        q.eq("couponCode", code).eq("userEmail", args.userEmail)
      )
      .unique();

    if (existingUsage) {
      await ctx.db.patch(existingUsage._id, {
        usageCount: existingUsage.usageCount + 1,
        lastUsedAt: now,
      });
    } else {
      await ctx.db.insert("couponUsage", {
        couponId: coupon._id,
        couponCode: code,
        userId: args.userId,
        userEmail: args.userEmail,
        usageCount: 1,
        lastUsedAt: now,
        createdAt: now,
      });
    }
  },
});
