import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/api";
import { useLocation } from "react-router-dom";

const ANALYTICS_STORAGE_KEY = "convex_anon_id";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a UUID v4-like anonymous ID
 * Uses crypto.randomUUID if available, falls back to manual generation
 */
function generateAnonymousId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create anonymous ID from localStorage
 */
export function getAnonymousId(): string {
  if (typeof localStorage === "undefined") {
    return generateAnonymousId(); // SSR fallback
  }
  let anonymousId = localStorage.getItem(ANALYTICS_STORAGE_KEY);
  if (!anonymousId) {
    anonymousId = generateAnonymousId();
    localStorage.setItem(ANALYTICS_STORAGE_KEY, anonymousId);
  }
  return anonymousId;
}

/**
 * Clear anonymous ID (call on logout)
 */
export function clearAnonymousId(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  }
}

/**
 * Hook for tracking analytics events with identity stitching support
 * 
 * Features:
 * - track(): Log events with automatic anonymous ID management
 * - identify(): Link anonymous events to authenticated user after login
 * - trackEvent: Alias for track() (backwards compatibility)
 */
export function useAnalytics() {
  const trackMutation = useMutation(api.analytics.trackEvent);
  const linkIdentityMutation = useMutation(api.analytics.linkIdentity);

  /**
   * Track an analytics event
   * Automatically attaches anonymous ID for guest-to-user stitching
   */
  const track = useCallback(
    async (event: string, properties: Record<string, any> = {}) => {
      const anonymousId = getAnonymousId();
      try {
        await trackMutation({
          event,
          properties,
          anonymousId,
        });
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.warn("Analytics tracking failed:", error);
      }
    },
    [trackMutation]
  );

  /**
   * Link anonymous events to authenticated user (Identity Stitching)
   * Call this AFTER successful login/registration
   */
  const identify = useCallback(async () => {
    const anonymousId = getAnonymousId();
    if (anonymousId) {
      try {
        const result = await linkIdentityMutation({ anonymousId });
        return result;
      } catch (error) {
        console.warn("Identity linking failed:", error);
        return { linked: 0 };
      }
    }
    return { linked: 0 };
  }, [linkIdentityMutation]);

  // Backwards compatible alias
  const trackEvent = track;

  return { track, identify, trackEvent };
}

/**
 * Hook for tracking page views automatically
 * Call this in your root App component or layout
 */
export function useTrackPageView() {
  const location = useLocation();
  const { track } = useAnalytics();
  const lastPath = useRef<string>("");

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Don't track the same path twice (e.g., on re-renders)
    if (currentPath === lastPath.current) return;
    lastPath.current = currentPath;

    // Track page view
    track("page_viewed", {
      path: location.pathname,
      search: location.search,
      referrer: document.referrer,
    });
  }, [location.pathname, location.search, track]);
}

/**
 * Hook for tracking product views
 * Call this on product detail pages
 */
export function useTrackProductView(
  productId: string,
  productName?: string,
  price?: number,
  category?: string
) {
  const { track } = useAnalytics();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    track("product_viewed", {
      productId,
      name: productName,
      price,
      category,
    });
  }, [productId, productName, price, category, track]);
}

/**
 * Hook for tracking add to cart events (cart_item_added)
 */
export function useTrackAddToCart() {
  const { track } = useAnalytics();

  const trackAddToCart = useCallback(
    (
      productId: string,
      productName: string,
      quantity: number,
      price: number,
      cartTotal?: number
    ) => {
      track("cart_item_added", {
        productId,
        name: productName,
        quantity,
        price,
        cartTotal,
      });
    },
    [track]
  );

  return { trackAddToCart };
}

/**
 * Hook for tracking purchase events (order_completed)
 */
export function useTrackPurchase() {
  const { track } = useAnalytics();

  const trackPurchase = useCallback(
    (
      orderId: string,
      total: number,
      items: Array<{ productId: string; quantity: number; price: number }>,
      paymentMethod?: string
    ) => {
      track("order_completed", {
        orderId,
        total,
        items,
        itemCount: items.length,
        paymentMethod,
      });
    },
    [track]
  );

  return { trackPurchase };
}

/**
 * Hook for tracking checkout start events
 */
export function useTrackCheckoutStart() {
  const { track } = useAnalytics();

  const trackCheckoutStart = useCallback(
    (cartId: string, itemCount: number, totalValue: number) => {
      track("checkout_started", {
        cartId,
        itemCount,
        totalValue,
      });
    },
    [track]
  );

  return { trackCheckoutStart };
}

/**
 * Hook for tracking search events
 */
export function useTrackSearch() {
  const { track } = useAnalytics();

  const trackSearch = useCallback(
    (
      query: string,
      resultsCount: number,
      filtersApplied?: Record<string, any>
    ) => {
      track("search_performed", {
        query,
        resultsCount,
        filtersApplied,
      });
    },
    [track]
  );

  return { trackSearch };
}
