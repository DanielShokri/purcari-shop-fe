/**
 * Rivhit Helper Functions (non-node)
 * 
 * These are internal queries and mutations used by the Rivhit action
 * and HTTP handlers. They are in a separate file because they don't
 * need Node.js runtime.
 */

import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================================================
// Public Queries
// ============================================================================

/**
 * Get payment transaction for an order.
 */
export const getPaymentByOrderId = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db
      .query("paymentTransactions")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .order("desc")
      .first();

    return transaction;
  },
});

// ============================================================================
// Internal Queries (used by createPaymentPage action)
// ============================================================================

/**
 * Internal query to get order by ID (for use in actions).
 */
export const getOrderById = internalQuery({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

/**
 * Internal query to get order items (for use in actions).
 */
export const getOrderItems = internalQuery({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});

// ============================================================================
// Internal Mutations (used by createPaymentPage action and IPN handler)
// ============================================================================

/**
 * Internal mutation to create a payment transaction record.
 */
export const createPaymentTransaction = internalMutation({
  args: {
    orderId: v.id("orders"),
    amount: v.number(),
    environment: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("paymentTransactions", {
      orderId: args.orderId,
      amount: args.amount,
      environment: args.environment,
      status: args.status,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Internal mutation to update a payment transaction record.
 */
export const updatePaymentTransaction = internalMutation({
  args: {
    paymentTransactionId: v.id("paymentTransactions"),
    rivhitPaymentUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    rivhitDocumentNumber: v.optional(v.number()),
    rivhitDocumentLink: v.optional(v.string()),
    rivhitCustomerId: v.optional(v.number()),
    rivhitConfirmationNumber: v.optional(v.number()),
    ipnData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { paymentTransactionId, ...updates } = args;
    const now = new Date().toISOString();

    // Filter out undefined values
    const cleanUpdates: Record<string, unknown> = { updatedAt: now };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(paymentTransactionId, cleanUpdates);
  },
});

/**
 * Handle IPN (Instant Payment Notification) from Rivhit.
 * 
 * This internal mutation:
 * 1. Parses the raw IPN body
 * 2. Extracts order and payment info
 * 3. Updates the payment transaction status
 * 4. Updates the order status if payment is successful
 */
export const handleIpnNotification = internalMutation({
  args: {
    rawBody: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[Rivhit IPN] Processing notification:", args.rawBody);

    try {
      // Parse the IPN data - Rivhit sends form-urlencoded or JSON
      let ipnData: Record<string, unknown>;
      
      // Try JSON first
      try {
        ipnData = JSON.parse(args.rawBody);
      } catch {
        // Try form-urlencoded
        const params = new URLSearchParams(args.rawBody);
        ipnData = Object.fromEntries(params.entries());
      }

      console.log("[Rivhit IPN] Parsed data:", JSON.stringify(ipnData));

      // Extract our custom ipn_data that contains orderId and paymentTransactionId
      let orderContext: { orderId?: string; paymentTransactionId?: string } = {};
      if (ipnData.ipn_data && typeof ipnData.ipn_data === "string") {
        try {
          orderContext = JSON.parse(ipnData.ipn_data);
        } catch {
          console.error("[Rivhit IPN] Failed to parse ipn_data");
        }
      }

      const orderId = orderContext.orderId as Id<"orders"> | undefined;
      const paymentTransactionId = orderContext.paymentTransactionId as Id<"paymentTransactions"> | undefined;

      if (!paymentTransactionId) {
        console.error("[Rivhit IPN] No paymentTransactionId in IPN data");
        return { success: false, error: "Missing paymentTransactionId" };
      }

      // Get the payment transaction
      const paymentTransaction = await ctx.db.get(paymentTransactionId);
      if (!paymentTransaction) {
        console.error("[Rivhit IPN] Payment transaction not found:", paymentTransactionId);
        return { success: false, error: "Payment transaction not found" };
      }

      // Determine payment status from Rivhit response
      // Rivhit typically sends error_code (0 = success) and document info on success
      const errorCode = Number(ipnData.error_code ?? ipnData.ErrorCode ?? -1);
      const isSuccess = errorCode === 0;

      const now = new Date().toISOString();

      if (isSuccess) {
        // Payment successful - update transaction
        await ctx.db.patch(paymentTransactionId, {
          status: "completed",
          ipnData: args.rawBody,
          rivhitDocumentNumber: Number(ipnData.document_number ?? ipnData.DocumentNumber) || undefined,
          rivhitDocumentLink: (ipnData.document_link ?? ipnData.DocumentLink) as string | undefined,
          rivhitCustomerId: Number(ipnData.customer_id ?? ipnData.CustomerId) || undefined,
          rivhitConfirmationNumber: Number(ipnData.confirmation_number ?? ipnData.ConfirmationNumber) || undefined,
          updatedAt: now,
        });

        // Update order status to processing
        if (orderId) {
          await ctx.db.patch(orderId, {
            status: "processing",
            updatedAt: now,
          });
        }

        console.log("[Rivhit IPN] Payment completed successfully for order:", orderId);
        return { success: true };
      } else {
        // Payment failed
        const errorMessage = (ipnData.client_message ?? ipnData.ClientMessage ?? "Payment failed") as string;
        await ctx.db.patch(paymentTransactionId, {
          status: "failed",
          ipnData: args.rawBody,
          errorMessage,
          updatedAt: now,
        });

        console.log("[Rivhit IPN] Payment failed for order:", orderId, "Error:", errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error("[Rivhit IPN] Error processing notification:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});
