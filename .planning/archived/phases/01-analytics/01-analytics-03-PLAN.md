---
phase: 01-analytics
plan: 03
type: execute
wave: 2
depends_on:
  - 01-analytics-01
files_modified:
  - convex/analytics/events.ts
  - convex/analytics/index.ts
  - apps/storefront/hooks/useAnalytics.ts
  - apps/storefront/App.tsx
  - apps/storefront/components/Layout.tsx
autonomous: true
must_haves:
  truths:
    - "trackEvent mutation exists and inserts events to analyticsEvents table"
    - "trackEvent updates all relevant aggregates (dailyViews, activeUsers, productViews)"
    - "useAnalytics hook provides trackEvent function to components"
    - "Page views are automatically tracked on route changes"
    - "Anonymous ID is generated and persisted in localStorage"
  artifacts:
    - path: "convex/analytics/events.ts"
      provides: "Event tracking mutations"
      exports:
        - "trackEvent"
        - "identifyUser"
    - path: "apps/storefront/hooks/useAnalytics.ts"
      provides: "React hook for analytics"
      exports:
        - "useAnalytics"
        - "useTrackPageView"
    - path: "apps/storefront/App.tsx"
      provides: "Page view tracking integration"
      contains: "useTrackPageView hook usage"
  key_links:
    - from: "useTrackPageView hook"
      to: "trackEvent mutation"
      via: "useMutation(api.analytics.events.trackEvent)"
    - from: "trackEvent mutation"
      to: "analyticsEvents table"
      via: "ctx.db.insert('analyticsEvents', ...)"
    - from: "trackEvent mutation"
      to: "dailyViewsAggregate"
      via: "dailyViewsAggregate.insert(ctx, ...)"
---

<objective>
Create the event tracking system that captures user interactions and updates aggregates. Implement frontend hooks for automatic page view tracking and manual event tracking.

Purpose: This is the data collection layer of the analytics system. Without events being recorded, the dashboard has nothing to display. This plan creates the mutations that write to the analyticsEvents table AND update the aggregates created in Plan 02.

Output: trackEvent mutation, useAnalytics hook, and automatic page view tracking on the storefront.
</objective>

<execution_context>
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-analytics/01-analytics-01-SUMMARY.md
@.planning/phases/01-analytics/01-analytics-02-SUMMARY.md
@.planning/research/ARCHITECTURE.md
@.planning/research/PITFALLS.md
@convex/schema.ts
@apps/storefront/App.tsx
@apps/storefront/components/Layout.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create trackEvent mutation</name>
  <files>convex/analytics/events.ts</files>
  <action>
Create `convex/analytics/events.ts` with the trackEvent mutation:

```typescript
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import {
  dailyViewsAggregate,
  activeUsersAggregate,
  productViewsAggregate,
} from "./aggregates";

/**
 * Track an analytics event
 * This mutation records the event and updates all relevant aggregates
 */
export const trackEvent = mutation({
  args: {
    event: v.string(),
    properties: v.optional(v.any()),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.session?.userId;
    const timestamp = Date.now();

    // Insert the raw event
    const eventDoc = await ctx.db.insert("analyticsEvents", {
      userId: userId || undefined,
      anonymousId: args.anonymousId,
      event: args.event,
      properties: args.properties || {},
      timestamp: timestamp.toString(),
    });

    // Get the inserted document for aggregate updates
    const doc = await ctx.db.get("analyticsEvents", eventDoc);
    if (!doc) throw new Error("Failed to retrieve inserted event");

    // Update dailyViews aggregate for page_viewed events
    await dailyViewsAggregate.insertIfDoesNotExist(ctx, doc);

    // Update activeUsers aggregate for any user activity
    await activeUsersAggregate.insertIfDoesNotExist(ctx, doc);

    // Update productViews aggregate for product_viewed events
    await productViewsAggregate.insertIfDoesNotExist(ctx, doc);

    return eventDoc;
  },
});

/**
 * Identify an anonymous user after they log in
 * This can be used to merge anonymous activity with user account
 */
export const identifyUser = mutation({
  args: {
    anonymousId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new Error("User must be logged in to identify");
    }

    // Find all events with this anonymousId and update them with userId
    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_userId", (q) => q.eq("userId", undefined))
      .collect();

    const anonymousEvents = events.filter(
      (e) => e.anonymousId === args.anonymousId
    );

    for (const event of anonymousEvents) {
      await ctx.db.patch(event._id, { userId });
    }

    return { updated: anonymousEvents.length };
  },
});
```

This mutation:
1. Records the raw event to analyticsEvents table
2. Updates all three aggregates using insertIfDoesNotExist (prevents duplicates)
3. Provides an identifyUser function to link anonymous sessions to logged-in users

Note: Using insertIfDoesNotExist is important to avoid errors if the same event is processed twice.
  </action>
  <verify>
TypeScript compilation:
npx tsc --noEmit convex/analytics/events.ts
  </verify>
  <done>
trackEvent and identifyUser mutations are defined with proper aggregate updates
  </done>
</task>

<task type="auto">
  <name>Task 2: Update analytics module exports</name>
  <files>convex/analytics/index.ts</files>
  <action>
Update `convex/analytics/index.ts` to include event exports:

```typescript
// Analytics module exports

// Aggregate instances and utilities
export {
  dailyViewsAggregate,
  activeUsersAggregate,
  productViewsAggregate,
  getDayKey,
  getWeekKey,
  getMonthKey,
  getStartOfDay,
  getEndOfDay,
} from "./aggregates";

// Event tracking mutations
export { trackEvent, identifyUser } from "./events";

// Queries will be exported from queries.ts (created in later plan)
```

This ensures trackEvent and identifyUser are available through the analytics module.
  </action>
  <verify>
TypeScript compilation:
npx tsc --noEmit convex/analytics/index.ts
  </verify>
  <done>
Event mutations are exported from analytics module index
  </done>
</task>

<task type="auto">
  <name>Task 3: Create useAnalytics hook</name>
  <files>apps/storefront/hooks/useAnalytics.ts</files>
  <action>
Create `apps/storefront/hooks/useAnalytics.ts` with analytics tracking utilities:

```typescript
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
  const trackEvent = useMutation(api.analytics.events.trackEvent);

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
```

This hook provides:
- getAnonymousId: Generates and persists anonymous user ID
- useAnalytics: Returns trackEvent function for manual tracking
- useTrackPageView: Automatically tracks page views on route changes
- useTrackProductView: Tracks product detail page views
- useTrackAddToCart: Tracks add to cart events
- useTrackPurchase: Tracks completed purchases
  </action>
  <verify>
TypeScript compilation:
cd apps/storefront && npx tsc --noEmit hooks/useAnalytics.ts
  </verify>
  <done>
useAnalytics hook is created with all tracking utilities
  </done>
</task>

<task type="auto">
  <name>Task 4: Integrate page view tracking in App.tsx</name>
  <files>apps/storefront/App.tsx</files>
  <action>
Read the current `apps/storefront/App.tsx` file, then add the page view tracking hook.

First, read the file to understand its current structure, then add:
1. Import `useTrackPageView` from the analytics hook
2. Call `useTrackPageView()` early in the App component

Expected changes:
```typescript
import { useTrackPageView } from "./hooks/useAnalytics";

function App() {
  useTrackPageView(); // Add this line
  
  // ... rest of component
}
```

Make minimal changes - only add the import and the hook call.
  </action>
  <verify>
TypeScript compilation passes:
cd apps/storefront && npx tsc --noEmit
  </verify>
  <done>
Page view tracking is integrated into App.tsx
  </done>
</task>

<task type="auto">
  <name>Task 5: Track product views on product detail pages</name>
  <files>apps/storefront/components/Layout.tsx</files>
  <action>
Check the Layout.tsx and product-related components. If there's a product detail page component, add `useTrackProductView` to track when users view products.

Read the relevant files first to understand the routing structure. The goal is to:
1. Find where product detail pages are rendered
2. Add `useTrackProductView(productId, productName)` to track product views
3. This will populate the productViews aggregate

If no product detail component exists in the current files, document this for future implementation when the product pages are built.
  </action>
  <verify>
Product view tracking is added to relevant components, or documented as deferred
  </verify>
  <done>
Product view tracking is implemented where product pages exist
  </done>
</task>

</tasks>

<verification>
After completing all tasks:
1. Verify `convex/analytics/events.ts` compiles and exports trackEvent
2. Test that `useTrackPageView` is called in App.tsx
3. Check that anonymous ID is generated and stored in localStorage
4. Navigate between pages and verify events are being sent (check Convex dashboard)
</verification>

<success_criteria>
- trackEvent mutation exists and updates analyticsEvents table
- trackEvent updates all three aggregates (dailyViews, activeUsers, productViews)
- useAnalytics hook provides trackEvent function
- useTrackPageView automatically tracks page views on route changes
- Anonymous ID is generated and persisted in localStorage
- TypeScript compilation passes for all modified files
</success_criteria>

<output>
After completion, create `.planning/phases/01-analytics/01-analytics-03-SUMMARY.md` documenting:
- Event tracking architecture
- Anonymous ID strategy
- Page view tracking implementation
- Manual event tracking API
</output>
