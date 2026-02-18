// @ts-nocheck
// Type instantiation depth issues with Convex runMutation API
// This file compiles correctly at runtime but TypeScript cannot fully verify it

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { adminMutation, adminQuery } from "./authHelpers";

// Note: Product prices already include VAT. Shipping and discounts are calculated
// by the frontend cart rules engine and passed in to the order creation mutation.
// Do NOT recalculate shipping/tax here — it would double-count.

// Starting order number (e.g., 1000 -> Order #1000)
const STARTING_ORDER_NUMBER = 1000;

/**
 * Get the next sequential order number.
 * Finds the highest existing orderNumber and increments by 1.
 * Starts at STARTING_ORDER_NUMBER if no orders exist.
 */
async function getNextOrderNumber(ctx: any): Promise<number> {
  // Get the most recent orders with orderNumber set
  const recentOrders = await ctx.db
    .query("orders")
    .withIndex("by_orderNumber")
    .order("desc")
    .take(1);

  if (recentOrders.length > 0 && recentOrders[0].orderNumber !== undefined) {
    return recentOrders[0].orderNumber + 1;
  }

  // If no orders with orderNumber exist, start from the beginning
  return STARTING_ORDER_NUMBER;
}

/**
 * Create a new order.
 * This is the first step of checkout, creating the primary order document.
 */
export const create = mutation({
  args: {
    customerId: v.optional(v.id("users")),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    customerAvatar: v.optional(v.string()),
    
    // Items
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      productImage: v.optional(v.string()),
      price: v.float64(),
      quantity: v.int64(),
    })),

    // Pre-calculated totals from the cart rules engine
    // Prices already include VAT; shipping and discounts are calculated by cart rules
    subtotal: v.float64(),
    shippingCost: v.float64(),
    discount: v.float64(),
    total: v.float64(),

    // Shipping address (to be denormalized)
    shippingAddress: v.object({
      street: v.string(),
      apartment: v.optional(v.string()),
      city: v.string(),
      postalCode: v.string(),
      country: v.string(),
    }),

    // Payment info (to be denormalized)
    payment: v.object({
      method: v.string(),
      cardExpiry: v.optional(v.string()),
      transactionId: v.string(),
      chargeDate: v.string(),
    }),

    // Optional coupon info
    appliedCouponCode: v.optional(v.string()),
    appliedCouponDiscount: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    // Use the pre-calculated totals from the cart rules engine
    // Product prices already include VAT; shipping/discount are calculated by cart rules on the frontend
    const { subtotal, shippingCost, discount, total } = args;

    // Tax is already included in product prices (Israeli standard: מחיר כולל מע"מ)
    const tax = 0;

    const now = new Date().toISOString();

    // Generate the next sequential order number
    const orderNumber = await getNextOrderNumber(ctx);

    // 5. Create Order Document
    const orderId = await ctx.db.insert("orders", {
      customerId: args.customerId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      customerAvatar: args.customerAvatar,
      
      orderNumber,
      
      subtotal,
      tax,
      shippingCost,
      discount,
      total,

      // Denormalized address
      shippingStreet: args.shippingAddress.street,
      shippingApartment: args.shippingAddress.apartment,
      shippingCity: args.shippingAddress.city,
      shippingPostalCode: args.shippingAddress.postalCode,
      shippingCountry: args.shippingAddress.country,

      // Denormalized payment
      paymentMethod: args.payment.method,
      paymentCardExpiry: args.payment.cardExpiry,
      paymentTransactionId: args.payment.transactionId,
      paymentChargeDate: args.payment.chargeDate,

      status: "pending",
      appliedCouponCode: args.appliedCouponCode,
      appliedCouponDiscount: args.appliedCouponDiscount,

      createdAt: now,
      updatedAt: now,
    });

    // 6. Create Order Items
    for (const item of args.items) {
      await ctx.db.insert("orderItems", {
        orderId,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        price: item.price,
        quantity: Number(item.quantity),
        total: item.price * Number(item.quantity),
      });
    }

    // 7. Increment Coupon Usage
    if (args.appliedCouponCode) {
      // @ts-expect-error Type instantiation depth issue with Convex API types
      await ctx.runMutation(api.coupons.incrementUsage, {
        code: args.appliedCouponCode,
        userEmail: args.customerEmail,
        userId: args.customerId,
      });
    }

    return orderId;
  },
});

/**
 * Get a single order with its items joined.
 * Admin-only query - order details include sensitive payment and customer information.
 */
export const get = adminQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();

    return {
      ...order,
      items,
    };
  },
});

/**
 * Get order details for storefront (order confirmation page).
 * Public access - no admin required. The order ID acts as a capability.
 */
export const getPublic = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();

    return {
      ...order,
      items,
    };
  },
});

/**
 * List orders for a specific customer email.
 * Used for storefront order history.
 */
export const listByCustomer = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_customerEmail", (q) => q.eq("customerEmail", args.email))
      .order("desc")
      .collect();
  },
});

/**
 * Get an order by its orderNumber (short ID like 1001).
 * Admin-only query.
 */
export const getByOrderNumber = adminQuery({
  args: { orderNumber: v.number() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
      .unique();

    if (!order) return null;

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
      .collect();

    return {
      ...order,
      items,
    };
  },
});

/**
 * List all orders for admin.
 * Supports status filtering.
 * Admin-only query.
 */
export const listAll = adminQuery({
  args: { 
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("shipped")
    ))
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("orders");
    
    if (args.status) {
      q = q.withIndex("by_status", (qi) => qi.eq("status", args.status!));
    }
    
    return await q.order("desc").collect();
  },
});

/**
 * Backfill orderNumber for existing orders that don't have one.
 * Assigns sequential numbers starting from STARTING_ORDER_NUMBER.
 * Admin-only mutation - run once to migrate existing orders.
 */
export const backfillOrderNumbers = adminMutation({
  args: {},
  handler: async (ctx) => {
    // Get all orders without an orderNumber, sorted by createdAt
    const ordersWithoutNumber = await ctx.db
      .query("orders")
      .order("asc")
      .collect();

    let nextNumber = STARTING_ORDER_NUMBER;
    let updatedCount = 0;

    for (const order of ordersWithoutNumber) {
      if (order.orderNumber === undefined) {
        await ctx.db.patch(order._id, {
          orderNumber: nextNumber,
          updatedAt: new Date().toISOString(),
        });
        nextNumber++;
        updatedCount++;
      }
    }

    return { updatedCount, nextOrderNumber: nextNumber };
  },
});

/**
 * Update order status.
 * Admin-only mutation.
 */
export const updateStatus = adminMutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("shipped")
    ),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: now,
    });
  },
});
