import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { adminMutation } from "./authHelpers";
import { Id } from "./_generated/dataModel";

/**
 * List products with optional filtering.
 */
export const list = query({
  args: {
    category: v.optional(v.string()), // Category ID as string (from URL params)
    wineType: v.optional(
      v.union(
        v.literal("Red"),
        v.literal("White"),
        v.literal("Rosé"),
        v.literal("Sparkling")
      )
    ),
    onSale: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    stockStatus: v.optional(
      v.union(
        v.literal("in_stock"),
        v.literal("out_of_stock"),
        v.literal("low_stock")
      )
    ),
    relatedProducts: v.optional(v.array(v.id("products"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results;

    if (args.category) {
      // Cast string to Id<"categories"> for index query
      const categoryId = args.category as Id<"categories">;
      results = await ctx.db
        .query("products")
        .withIndex("by_category", (idx) => idx.eq("category", categoryId))
        .collect();
    } else {
      results = await ctx.db.query("products").collect();
    }

    // Secondary filtering in memory for multiple parameters (Convex best practice for small-medium datasets)
    let filtered = results;

    if (args.wineType) {
      filtered = filtered.filter((p) => p.wineType === args.wineType);
    }
    if (args.onSale !== undefined) {
      filtered = filtered.filter((p) => p.onSale === args.onSale);
    }
    if (args.isFeatured !== undefined) {
      filtered = filtered.filter((p) => p.isFeatured === args.isFeatured);
    }
    if (args.stockStatus) {
      filtered = filtered.filter((p) => p.stockStatus === args.stockStatus);
    }

    if (args.limit) {
      return filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

/**
 * Track an analytics event.
 */
export const trackEvent = mutation({
  args: {
    event: v.string(),
    properties: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analyticsEvents", {
      event: args.event,
      properties: args.properties,
      timestamp: Date.now(),
    });
  },
});

/**
 * Get product by ID.
 */
export const getById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

/**
 * Search products using bilingual indexes.
 */
export const search = query({
  args: {
    query: v.string(),
    language: v.union(v.literal("en"), v.literal("he")),
  },
  handler: async (ctx, args) => {
    if (args.language === "he") {
      return await ctx.db
        .query("products")
        .withSearchIndex("search_he", (q) => q.search("productNameHe", args.query))
        .collect();
    } else {
      return await ctx.db
        .query("products")
        .withSearchIndex("search_en", (q) => q.search("productName", args.query))
        .collect();
    }
  },
});

/**
 * Get related products.
 */
export const getRelated = query({
  args: {
    productId: v.id("products"),
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Cast string category to Id<"categories"> for index query
    const categoryId = args.category as Id<"categories">;
    const related = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", categoryId))
      .filter((q) => q.neq(q.field("_id"), args.productId))
      .take(args.limit || 4);
    return related;
  },
});

/**
 * Validate stock for checkout.
 */
export const validateStock = query({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];
    let valid = true;

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product || Number(product.quantityInStock) < item.quantity) {
        valid = false;
        results.push({
          productId: item.productId,
          available: product ? Number(product.quantityInStock) : 0,
          status: product ? product.stockStatus : "missing",
        });
      }
    }

    return { valid, issues: results };
  },
});

/**
 * Admin: Create/Update/Delete - Protected by adminMutation
 */
export const create = adminMutation({
  args: {
    productName: v.string(),
    productNameHe: v.optional(v.string()),
    price: v.float64(),
    quantityInStock: v.int64(),
    sku: v.string(),
    category: v.id("categories"),
    description: v.optional(v.string()),
    descriptionHe: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    shortDescriptionHe: v.optional(v.string()),
    salePrice: v.optional(v.float64()),
    onSale: v.optional(v.boolean()),
    wineType: v.optional(
      v.union(
        v.literal("Red"),
        v.literal("White"),
        v.literal("Rosé"),
        v.literal("Sparkling")
      )
    ),
    region: v.optional(v.string()),
    vintage: v.optional(v.number()),
    alcoholContent: v.optional(v.float64()),
    volume: v.optional(v.string()),
    grapeVariety: v.optional(v.string()),
    servingTemperature: v.optional(v.string()),
    tastingNotes: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    isFeatured: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    relatedProducts: v.optional(v.array(v.id("products"))),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("hidden"),
        v.literal("discontinued")
      )
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      ...args,
      stockStatus: Number(args.quantityInStock) > 0 ? "in_stock" : "out_of_stock",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

export const update = adminMutation({
  args: {
    id: v.id("products"),
    productName: v.optional(v.string()),
    productNameHe: v.optional(v.string()),
    price: v.optional(v.float64()),
    quantityInStock: v.optional(v.int64()),
    sku: v.optional(v.string()),
    category: v.optional(v.id("categories")),
    description: v.optional(v.string()),
    descriptionHe: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    shortDescriptionHe: v.optional(v.string()),
    salePrice: v.optional(v.float64()),
    onSale: v.optional(v.boolean()),
    wineType: v.optional(
      v.union(
        v.literal("Red"),
        v.literal("White"),
        v.literal("Rosé"),
        v.literal("Sparkling")
      )
    ),
    region: v.optional(v.string()),
    vintage: v.optional(v.number()),
    alcoholContent: v.optional(v.float64()),
    volume: v.optional(v.string()),
    grapeVariety: v.optional(v.string()),
    servingTemperature: v.optional(v.string()),
    tastingNotes: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    isFeatured: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    relatedProducts: v.optional(v.array(v.id("products"))),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("hidden"),
        v.literal("discontinued")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: any = { ...fields, updatedAt: new Date().toISOString() };
    
    if (fields.quantityInStock !== undefined) {
      updates.stockStatus = Number(fields.quantityInStock) > 0 ? "in_stock" : "out_of_stock";
    }

    await ctx.db.patch(id, updates);
  },
});

export const remove = adminMutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
