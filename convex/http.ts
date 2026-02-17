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
 * IPN (Instant Payment Notification) webhook for Rivhit - POST method.
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
      console.log("[Rivhit IPN POST] Received:", body);

      const result = await ctx.runMutation(internal.rivhitHelpers.handleIpnNotification, {
        rawBody: body,
      });

      console.log("[Rivhit IPN POST] Result:", JSON.stringify(result));

      // Rivhit expects a 200 OK response
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("[Rivhit IPN POST] Error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

/**
 * IPN webhook for Rivhit - GET method (fallback).
 * 
 * Some configurations may use GET instead of POST.
 * In GET mode, only SaleId is sent - we would need to call SaleDetails to get full info.
 */
http.route({
  path: "/rivhit/ipn",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const params: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      console.log("[Rivhit IPN GET] Received params:", JSON.stringify(params));

      // For GET mode, iCredit only sends SaleId - we need to handle this differently
      // For now, log it and return OK
      if (params.SaleId || params.saleid) {
        const result = await ctx.runMutation(internal.rivhitHelpers.handleIpnNotification, {
          rawBody: JSON.stringify(params),
        });
        console.log("[Rivhit IPN GET] Result:", JSON.stringify(result));
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("[Rivhit IPN GET] Error:", error);
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

/**
 * Iframe redirect handler for iCredit payment completion.
 * 
 * When using iframe mode, iCredit redirects to this page after payment.
 * This page serves HTML with JavaScript that breaks out of the iframe
 * and redirects the parent window to the order confirmation page.
 * 
 * This is necessary because iCredit's redirect happens inside the iframe,
 * and we need to redirect the top-level window (parent page).
 */
http.route({
  path: "/rivhit/iframe-redirect",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    
    // Log ALL query parameters from iCredit for debugging
    const allParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    console.log("[iCredit Redirect] All parameters received:", JSON.stringify(allParams));
    
    const finalRedirectUrl = url.searchParams.get("finalUrl");
    const token = url.searchParams.get("Token"); // iCredit appends this
    const status = url.searchParams.get("Status"); // Payment status if available
    const saleId = url.searchParams.get("SaleId");
    const response = url.searchParams.get("Response"); // May contain success/failure info
    
    console.log("[iCredit Redirect] Token:", token, "Status:", status, "SaleId:", saleId, "Response:", response);
    
    // Get the storefront URL from environment or use default
    const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:3000";
    
    // Build the final destination URL
    let destination = finalRedirectUrl ? decodeURIComponent(finalRedirectUrl) : storefrontUrl;
    
    // Append token and status if available
    const destUrl = new URL(destination);
    if (token) destUrl.searchParams.set("token", token);
    if (status) destUrl.searchParams.set("paymentStatus", status);
    if (saleId) destUrl.searchParams.set("saleId", saleId);
    if (response) destUrl.searchParams.set("response", response);
    destination = destUrl.toString();
    
    console.log("[iCredit Redirect] Redirecting to:", destination);
    
    // Return HTML page that breaks out of iframe and redirects parent
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>מעבד תשלום...</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f9fafb;
      direction: rtl;
    }
    .loader {
      text-align: center;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #722F37;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>מעבד תשלום, אנא המתן...</p>
  </div>
  <script>
    // Break out of iframe and redirect parent window
    if (window.top !== window.self) {
      window.top.location.href = ${JSON.stringify(destination)};
    } else {
      window.location.href = ${JSON.stringify(destination)};
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 
        "Content-Type": "text/html; charset=utf-8",
        // Allow this page to be loaded in iframe
        "X-Frame-Options": "ALLOWALL",
      },
    });
  }),
});

export default http;
