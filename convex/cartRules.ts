import { v } from "convex/values";
import { query } from "./_generated/server";
import { adminMutation, adminQuery } from "./authHelpers";

// Define strict config types
const buyXGetYConfig = v.object({
  type: v.literal("buy_x_get_y"),
  buyQuantity: v.number(),
  getQuantity: v.number(),
  discountProductId: v.optional(v.id("products")),
  discountPercentage: v.optional(v.number()),
});

const bulkDiscountConfig = v.object({
  type: v.literal("bulk_discount"),
  minQuantity: v.number(),
  discountPercentage: v.number(),
  maxDiscountAmount: v.optional(v.float64()),
});

// Admin-only queries for cart rules management
export const get = adminQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cartRules").collect();
  },
});

export const getById = adminQuery({
  args: { id: v.id("cartRules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Admin-only mutations for cart rules management
export const create = adminMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("paused")),
    ruleType: v.union(v.literal("buy_x_get_y"), v.literal("bulk_discount")),
    config: v.union(buyXGetYConfig, bulkDiscountConfig),
    priority: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("cartRules", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = adminMutation({
  args: {
    id: v.id("cartRules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("paused"))),
    ruleType: v.optional(v.union(v.literal("buy_x_get_y"), v.literal("bulk_discount"))),
    config: v.optional(v.union(buyXGetYConfig, bulkDiscountConfig)),
    priority: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const now = new Date().toISOString();
    await ctx.db.patch(id, {
      ...rest,
      updatedAt: now,
    });
  },
});

export const remove = adminMutation({
  args: { id: v.id("cartRules") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
