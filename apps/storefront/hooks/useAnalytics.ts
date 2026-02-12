import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/api";
import { useLocation } from "react-router-dom";

const ANALYTICS_STORAGE_KEY = "purcari_anonymous_id";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a random anonymous ID
 */
function generateAnonymousId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create anonymous ID from localStorage
 */
export function getAnonymousId(): string {
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
  localStorage.removeItem(ANALYTICS_STORAGE_KEY);
}

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  const trackEvent = useMutation(api.analytics.trackEvent);

  const track = useCallback(
    async (event: string, properties?: Record<string, any>) => {
      const anonymousId = getAnonymousId();
      try {
        await trackEvent({
          event,
          properties,
          anonymousId,
        });
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.warn("Analytics tracking failed:", error);
      }
    },
    [trackEvent]
  );

  return { trackEvent: track };
}

/**
 * Hook for tracking page views automatically
 * Call this in your root App component or layout
 */
export function useTrackPageView() {
  const location = useLocation();
  const { trackEvent } = useAnalytics();
  const lastPath = useRef<string>("");

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Don't track the same path twice (e.g., on re-renders)
    if (currentPath === lastPath.current) return;
    lastPath.current = currentPath;

    // Track page view
    trackEvent("page_viewed", {
      path: location.pathname,
      search: location.search,
      referrer: document.referrer,
    });
  }, [location.pathname, location.search, trackEvent]);
}

/**
 * Hook for tracking product views
 * Call this on product detail pages
 */
export function useTrackProductView(productId: string, productName?: string) {
  const { trackEvent } = useAnalytics();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    trackEvent("product_viewed", {
      productId,
      productName,
    });
  }, [productId, productName, trackEvent]);
}

/**
 * Hook for tracking add to cart events
 */
export function useTrackAddToCart() {
  const { trackEvent } = useAnalytics();

  const trackAddToCart = useCallback(
    (productId: string, productName: string, quantity: number, price: number) => {
      trackEvent("added_to_cart", {
        productId,
        productName,
        quantity,
        price,
      });
    },
    [trackEvent]
  );

  return { trackAddToCart };
}

/**
 * Hook for tracking purchase events
 */
export function useTrackPurchase() {
  const { trackEvent } = useAnalytics();

  const trackPurchase = useCallback(
    (orderId: string, total: number, itemCount: number) => {
      trackEvent("purchase_completed", {
        orderId,
        total,
        itemCount,
      });
    },
    [trackEvent]
  );

  return { trackPurchase };
}
