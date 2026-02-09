import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { adminMutation, adminQuery } from "./authHelpers";

/**
 * Admin: Get coupon by ID.
 */
export const get = adminQuery({
  args: { id: v.id("coupons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Admin: List all coupons.
 */
export const list = adminQuery({
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
export const create = adminMutation({
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
      usageCount: 0n,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Admin: Update an existing coupon.
 */
export const update = adminMutation({
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
export const remove = adminMutation({
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
      usageCount: (coupon.usageCount || 0n) + 1n,
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
        usageCount: (existingUsage.usageCount || 0n) + 1n,
        lastUsedAt: now,
      });
    } else {
      await ctx.db.insert("couponUsage", {
        couponId: coupon._id,
        couponCode: code,
        userId: args.userId,
        userEmail: args.userEmail,
        usageCount: 1n,
        lastUsedAt: now,
        createdAt: now,
      });
    }
  },
});

/**
 * Validate a coupon code and calculate discount.
 * This query implements the complex multi-step validation logic.
 */
export const validate = query({
  args: {
    code: v.string(),
    subtotal: v.float64(),
    userEmail: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    itemCount: v.int64(),
  },
  handler: async (ctx, args) => {
    const code = args.code.toUpperCase();
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();

    if (!coupon) {
      return { valid: false, error: "קוד קופון לא תקין" };
    }

    const now = new Date();

    // 1. Check status
    if (coupon.status !== "active") {
      return { valid: false, error: "קופון זה אינו פעיל" };
    }

    // 2. Check start date
    if (new Date(coupon.startDate) > now) {
      return { valid: false, error: "קופון זה עדיין לא בתוקף" };
    }

    // 3. Check end date
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return { valid: false, error: "תוקף הקופון פג" };
    }

    // 4. Check global usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, error: "הקופון הגיע למגבלת השימושים" };
    }

    // 5. Check per-user usage limit
    if (coupon.usageLimitPerUser && args.userEmail) {
      const usage = await ctx.db
        .query("couponUsage")
        .withIndex("by_couponCode_userEmail", (q) =>
          q.eq("couponCode", code).eq("userEmail", args.userEmail!)
        )
        .unique();

      if (usage && usage.usageCount >= coupon.usageLimitPerUser) {
        return { 
          valid: false, 
          error: `הגעת למגבלת השימוש בקופון זה (${coupon.usageLimitPerUser} שימושים)` 
        };
      }
    }

    // 6. Check minimum order
    if (coupon.minimumOrder && args.subtotal < coupon.minimumOrder) {
      return { 
        valid: false, 
        error: `מינימום הזמנה לקופון זה: ₪${coupon.minimumOrder}` 
      };
    }

    // 7. Check user restriction
    if (coupon.userIds && coupon.userIds.length > 0 && args.userId) {
      if (!coupon.userIds.includes(args.userId)) {
        return { valid: false, error: "קופון זה אינו זמין עבורך" };
      }
    } else if (coupon.userIds && coupon.userIds.length > 0 && !args.userId) {
      return { valid: false, error: "יש להתחבר כדי להשתמש בקופון זה" };
    }

    // 8. Calculate discount amount
    let discountAmount = 0;
    const STANDARD_SHIPPING_COST = 29.90;

    switch (coupon.discountType) {
      case "percentage":
        discountAmount = args.subtotal * (coupon.discountValue / 100);
        break;

      case "fixed_amount":
        discountAmount = coupon.discountValue;
        break;

      case "free_shipping":
        discountAmount = STANDARD_SHIPPING_COST;
        break;

      case "free_product":
        discountAmount = coupon.discountValue;
        break;

      case "buy_x_get_y":
        if (coupon.buyQuantity && coupon.getQuantity) {
          const sets = Math.floor(Number(args.itemCount) / (Number(coupon.buyQuantity) + Number(coupon.getQuantity)));
          const avgPrice = args.subtotal / Number(args.itemCount);
          discountAmount = sets * Number(coupon.getQuantity) * avgPrice;
        }
        break;
    }

    // 9. Apply maximum discount cap
    if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
      discountAmount = coupon.maximumDiscount;
    }

    // 10. Don't allow discount to exceed subtotal
    if (discountAmount > args.subtotal) {
      discountAmount = args.subtotal;
    }

    return {
      valid: true,
      coupon,
      discountAmount: Math.round(discountAmount * 100) / 100,
    };
  },
});
