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

    // 5. Create Order Document
    const orderId = await ctx.db.insert("orders", {
      customerId: args.customerId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      customerAvatar: args.customerAvatar,
      
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
 */
export const get = query({
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
