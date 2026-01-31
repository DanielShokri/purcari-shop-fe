import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cartRules").collect();
  },
});

export const getById = query({
  args: { id: v.id("cartRules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    ruleType: v.union(v.literal("buy_x_get_y"), v.literal("bulk_discount")),
    config: v.any(),
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

export const update = mutation({
  args: {
    id: v.id("cartRules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    ruleType: v.optional(v.union(v.literal("buy_x_get_y"), v.literal("bulk_discount"))),
    config: v.optional(v.any()),
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

export const remove = mutation({
  args: { id: v.id("cartRules") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
