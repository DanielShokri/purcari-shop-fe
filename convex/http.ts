import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

// Add Convex Auth HTTP routes
auth.addHttpRoutes(http);

// ============================================================================
// Rivhit Payment Gateway Routes
// ============================================================================

/**
 * IPN (Instant Payment Notification) webhook for Rivhit.
 * 
 * Rivhit calls this endpoint when a payment is completed or fails.
 * This processes the notification and updates order/payment status.
 */
http.route({
  path: "/rivhit/ipn",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.text();
      console.log("[Rivhit IPN] Received:", body);

      await ctx.runMutation(internal.rivhitHelpers.handleIpnNotification, {
        rawBody: body,
      });

      // Rivhit expects a 200 OK response
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("[Rivhit IPN] Error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

/**
 * Redirect handler for when the user returns from the Rivhit payment page.
 * 
 * This redirects the user back to the storefront order confirmation page.
 */
http.route({
  path: "/rivhit/redirect",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId");

    // Get the storefront URL from environment or use default
    const storefrontUrl = process.env.VITE_STOREFRONT_URL || "http://localhost:3000";

    // Redirect to order confirmation page
    if (orderId) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${storefrontUrl}/order-confirmation/${orderId}` },
      });
    } else {
      // If no orderId, redirect to home page
      return new Response(null, {
        status: 302,
        headers: { Location: storefrontUrl },
      });
    }
  }),
});

export default http;
