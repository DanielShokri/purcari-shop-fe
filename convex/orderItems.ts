import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Add items to an existing order.
 */
export const create = mutation({
  args: {
    orderId: v.id("orders"),
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      productImage: v.optional(v.string()),
      variant: v.optional(v.string()),
      quantity: v.int64(),
      price: v.float64(),
    })),
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const item of args.items) {
      const total = Math.round(item.price * Number(item.quantity) * 100) / 100;
      
      const itemId = await ctx.db.insert("orderItems", {
        orderId: args.orderId,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        total: total,
      });
      
      results.push(itemId);
    }
    
    return results;
  },
});

/**
 * List items for a specific order.
 */
export const listByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});
