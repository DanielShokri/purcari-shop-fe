import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { adminMutation } from "./authHelpers";

/**
 * List all categories sorted by order.
 * Public query - no admin check needed (used by storefront).
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
 * Admin-only mutation.
 */
export const create = adminMutation({
  args: {
    name: v.string(),
    nameHe: v.optional(v.string()),
    slug: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
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
 * Admin-only mutation.
 */
export const update = adminMutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    nameHe: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
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
 * Admin-only mutation. Reassigns products to a new category before deletion.
 */
export const remove = adminMutation({
  args: {
    id: v.id("categories"),
    reassignToCategoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const categoryId = args.id;
    const reassignToId = args.reassignToCategoryId;

    // Get all products in this category
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", categoryId))
      .collect();

    // If there are products and no reassignment target, fail
    if (products.length > 0 && !reassignToId) {
      throw new Error(`הקטגוריה מכילה ${products.length} מוצרים. יש להעביר אותם לקטגוריה אחרת או למחוק אותם קודם.`);
    }

    // Reassign products to new category
    if (reassignToId) {
      for (const product of products) {
        await ctx.db.patch(product._id, { category: reassignToId });
      }
    }

    await ctx.db.delete(categoryId);
  },
});
