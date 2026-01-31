import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List all categories sorted by order.
 */
export const list = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("categories");
    // Sorting by order manually if no index exists, or using index if it did.
    // Schema doesn't have order index, so we'll sort in memory or just collect.
    const categories = await q.collect();
    return categories
      .filter((c) => args.includeInactive || c.slug !== "hidden") // Simple filter example
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  },
});

/**
 * Get category by ID or slug.
 */
export const get = query({
  args: {
    id: v.optional(v.id("categories")),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      return await ctx.db.get(args.id);
    }
    if (args.slug) {
      return await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
        .unique();
    }
    return null;
  },
});

/**
 * Create a new category.
 */
export const create = mutation({
  args: {
    name: v.string(),
    nameHe: v.optional(v.string()),
    slug: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.string()),
    order: v.optional(v.int64()),
    status: v.optional(v.union(v.literal("active"), v.literal("draft"), v.literal("hidden"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("categories", {
      ...args,
      status: args.status ?? "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

/**
 * Update a category.
 */
export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    nameHe: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    parentId: v.optional(v.string()),
    order: v.optional(v.int64()),
    status: v.optional(v.union(v.literal("active"), v.literal("draft"), v.literal("hidden"))),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, {
      ...fields,
      updatedAt: new Date().toISOString(),
    });
  },
});

/**
 * Delete a category.
 */
export const remove = mutation({
  args: {
    id: v.id("categories"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
