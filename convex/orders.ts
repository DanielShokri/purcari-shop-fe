import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Israeli business logic constants
const VAT_RATE = 0.17;
const FREE_SHIPPING_THRESHOLD = 300;
const STANDARD_SHIPPING_COST = 29.90;

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
    
    // Items are needed for total calculations
    items: v.array(v.object({
      price: v.float64(),
      quantity: v.int64(),
    })),

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
    // 1. Calculate Subtotal
    const subtotal = args.items.reduce(
      (sum, item) => sum + item.price * Number(item.quantity),
      0
    );

    // 2. Calculate Shipping Cost (Free over threshold)
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;

    // 3. Calculate Tax (17% VAT)
    const tax = Math.round(subtotal * VAT_RATE * 100) / 100;

    // 4. Calculate Total
    const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

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

    return orderId;
  },
});
