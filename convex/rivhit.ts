"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Rivhit API Configuration
const RIVHIT_API_BASE = "https://api.rivhit.co.il/online/RivhitOnlineAPI.svc";

// Standard Israeli document types for Rivhit
const RIVHIT_DOCUMENT_TYPES = {
  INVOICE_RECEIPT: 305, // חשבונית מס / קבלה (Tax Invoice + Receipt - most common for e-commerce)
  INVOICE: 300,         // חשבונית מס (Tax Invoice only)
  RECEIPT: 400,         // קבלה (Receipt only)
  ORDER: 100,           // הזמנה (Order/Quote)
} as const;

/**
 * Create a Rivhit hosted payment page for an order.
 * 
 * This action:
 * 1. Reads the order from the database
 * 2. Calls Rivhit Document.Page API to create a hosted payment page
 * 3. Creates a paymentTransactions record to track the payment
 * 4. Returns the payment page URL for redirect
 */
export const createPaymentPage = action({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    paymentUrl?: string;
    paymentTransactionId?: Id<"paymentTransactions">;
    error?: string;
  }> => {
    // 1. Get Rivhit API token from environment
    const apiToken = process.env.RIVHIT_API_TOKEN;
    if (!apiToken) {
      return {
        success: false,
        error: "RIVHIT_API_TOKEN environment variable is not set",
      };
    }

    // 2. Determine environment
    const environment = (process.env.RIVHIT_ENVIRONMENT || "test") as "test" | "production";

    // 3. Get site URL for callbacks
    const siteUrl = process.env.CONVEX_SITE_URL;
    if (!siteUrl) {
      return {
        success: false,
        error: "CONVEX_SITE_URL environment variable is not set",
      };
    }

    // 4. Read the order from the database
    const order = await ctx.runQuery(internal.rivhitHelpers.getOrderById, {
      orderId: args.orderId,
    });

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // 5. Get order items
    const orderItems = await ctx.runQuery(internal.rivhitHelpers.getOrderItems, {
      orderId: args.orderId,
    });

    // 6. Create a pending payment transaction record first
    const paymentTransactionId = await ctx.runMutation(
      internal.rivhitHelpers.createPaymentTransaction,
      {
        orderId: args.orderId,
        amount: order.total,
        environment,
        status: "pending",
      }
    );

    // 7. Build callback URLs
    const redirectUrl = `${siteUrl}/rivhit/redirect?orderId=${args.orderId}`;
    const ipnUrl = `${siteUrl}/rivhit/ipn`;
    const ipnData = JSON.stringify({
      orderId: args.orderId,
      paymentTransactionId,
    });

    // 8. Build the Rivhit Document.Page request
    const requestBody = {
      api_token: apiToken,
      document_type: RIVHIT_DOCUMENT_TYPES.INVOICE_RECEIPT,
      receipt_type: RIVHIT_DOCUMENT_TYPES.RECEIPT,
      last_name: order.customerName,
      email_to: order.customerEmail,
      phone: order.customerPhone || undefined,
      address: order.shippingStreet,
      city: order.shippingCity,
      price_include_vat: true,
      items: orderItems.map((item) => ({
        description: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      redirect_url: redirectUrl,
      ipn_url: ipnUrl,
      ipn_data: ipnData,
      create_customer: true,
      find_by_mail: true,
      send_mail: true,
    };

    // 9. Call Rivhit Document.Page API
    try {
      const response = await fetch(`${RIVHIT_API_BASE}/Document.Page`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json() as {
        error_code: number;
        client_message: string | null;
        debug_message: string | null;
        data: { page_url: string } | null;
      };

      // 10. Process response
      if (result.error_code === 0 && result.data?.page_url) {
        // Success - update payment transaction with URL
        await ctx.runMutation(internal.rivhitHelpers.updatePaymentTransaction, {
          paymentTransactionId,
          rivhitPaymentUrl: result.data.page_url,
        });

        return {
          success: true,
          paymentUrl: result.data.page_url,
          paymentTransactionId,
        };
      } else {
        // Error - update payment transaction with error
        const errorMessage = result.client_message || result.debug_message || "Unknown Rivhit error";
        await ctx.runMutation(internal.rivhitHelpers.updatePaymentTransaction, {
          paymentTransactionId,
          status: "failed",
          errorMessage,
        });

        return {
          success: false,
          error: errorMessage,
          paymentTransactionId,
        };
      }
    } catch (error) {
      // Network or parsing error
      const errorMessage = error instanceof Error ? error.message : "Network error";
      await ctx.runMutation(internal.rivhitHelpers.updatePaymentTransaction, {
        paymentTransactionId,
        status: "failed",
        errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
        paymentTransactionId,
      };
    }
  },
});
