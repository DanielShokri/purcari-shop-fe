import { query } from "../_generated/server";
import { v } from "convex/values";
import {
  dailyViewsAggregate,
  activeUsersAggregate,
  productViewsAggregate,
  getDayKey,
  getWeekKey,
  getMonthKey,
  getStartOfDay,
  getEndOfDay,
} from "./aggregates";

/**
 * Time series data point for charts
 */
interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  name?: string;
}

/**
 * Helper function to count page views directly from events table
 */
async function countPageViewsInRange(ctx: any, startTime: number, endTime: number): Promise<number> {
  const events = await ctx.db
    .query("analyticsEvents")
    .withIndex("by_event", (q: any) => q.eq("event", "page_viewed"))
    .collect();
  
  return events.filter((e: any) => {
    const ts = typeof e.timestamp === "string" ? Number(e.timestamp) : e.timestamp;
    return ts >= startTime && ts <= endTime;
  }).length;
}

/**
 * Helper function to count authenticated users (those with userId, not anonymousId)
 */
async function countAuthenticatedUsersInRange(ctx: any, startTime: number, endTime: number): Promise<number> {
  const events = await ctx.db
    .query("analyticsEvents")
    .withIndex("by_timestamp", (q: any) => 
      q.gte("timestamp", startTime)
       .lte("timestamp", endTime)
    )
    .collect();
  
  // Only count authenticated users (those with userId)
  const authenticatedUsers = new Set<string>();
  for (const event of events) {
    if (event.userId) {  // Only count if they have a userId, not anonymousId
      authenticatedUsers.add(event.userId);
    }
  }
  return authenticatedUsers.size;
}

/**
 * Helper function to count unique visitors (both authenticated and anonymous)
 */
async function countUniqueVisitorsInRange(ctx: any, startTime: number, endTime: number): Promise<number> {
  const events = await ctx.db
    .query("analyticsEvents")
    .withIndex("by_timestamp", (q: any) => 
      q.gte("timestamp", startTime)
       .lte("timestamp", endTime)
    )
    .collect();
  
  const uniqueVisitors = new Set<string>();
  for (const event of events) {
    const userId = event.userId || event.anonymousId;
    if (userId) {
      uniqueVisitors.add(userId);
    }
  }
  return uniqueVisitors.size;
}

/**
 * Get analytics summary for dashboard
 */
export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const ONE_WEEK = 7 * ONE_DAY;

    // Get today's start and end times
    const todayStart = getStartOfDay(now);
    const todayEnd = getEndOfDay(now);
    
    // Yesterday's boundaries
    const yesterdayStart = getStartOfDay(now - ONE_DAY);
    const yesterdayEnd = getEndOfDay(now - ONE_DAY);
    
    // Calculate week boundaries (Sunday to Saturday)
    const today = new Date(now);
    const dayOfWeek = today.getDay();
    const startOfWeekDate = new Date(now - dayOfWeek * ONE_DAY);
    const startOfWeek = getStartOfDay(startOfWeekDate.getTime());
    const endOfWeek = todayEnd; // Up to end of today
    
    // Last week's boundaries (same day range, one week ago)
    const lastWeekStart = startOfWeek - ONE_WEEK;
    const lastWeekEnd = endOfWeek - ONE_WEEK;
    
    // Calculate month boundaries
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Last month's boundaries
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
    
    console.log(`Querying views for today: ${new Date(todayStart).toISOString()} to ${new Date(todayEnd).toISOString()}`);

    // Get unique visitors for current periods
    const visitorsToday = await countUniqueVisitorsInRange(ctx, todayStart, todayEnd);
    const visitorsThisWeek = await countUniqueVisitorsInRange(ctx, startOfWeek, endOfWeek);
    const visitorsThisMonth = await countUniqueVisitorsInRange(ctx, startOfMonth.getTime(), endOfMonth.getTime());
    
    // Get unique visitors for previous periods (for comparison)
    const visitorsYesterday = await countUniqueVisitorsInRange(ctx, yesterdayStart, yesterdayEnd);
    const visitorsLastWeek = await countUniqueVisitorsInRange(ctx, lastWeekStart, lastWeekEnd);
    const visitorsLastMonth = await countUniqueVisitorsInRange(ctx, lastMonthStart.getTime(), lastMonthEnd.getTime());
    
    // Get authenticated user counts (DAU/WAU/MAU) for current periods
    const dau = await countAuthenticatedUsersInRange(ctx, todayStart, todayEnd);
    const wau = await countAuthenticatedUsersInRange(ctx, startOfWeek, endOfWeek);
    const mau = await countAuthenticatedUsersInRange(ctx, startOfMonth.getTime(), endOfMonth.getTime());
    
    // Get authenticated user counts for previous periods
    const dauYesterday = await countAuthenticatedUsersInRange(ctx, yesterdayStart, yesterdayEnd);
    const wauLastWeek = await countAuthenticatedUsersInRange(ctx, lastWeekStart, lastWeekEnd);
    const mauLastMonth = await countAuthenticatedUsersInRange(ctx, lastMonthStart.getTime(), lastMonthEnd.getTime());

    // Calculate total unique visitors (all time)
    const allEvents = await ctx.db.query("analyticsEvents").collect();
    const allUniqueVisitors = new Set<string>();
    for (const event of allEvents) {
      const visitorId = event.userId || event.anonymousId;
      if (visitorId) {
        allUniqueVisitors.add(visitorId);
      }
    }
    const totalVisitors = allUniqueVisitors.size;

    // Get top products by views
    const topProducts = await getTopProductsByViews(ctx, 10);
    
    // Helper to calculate percentage change
    const calcChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalViews: totalVisitors,
      totalVisitors,
      viewsToday: visitorsToday,
      viewsThisWeek: visitorsThisWeek,
      viewsThisMonth: visitorsThisMonth,
      // Change percentages for visitors
      viewsTodayChange: calcChange(visitorsToday, visitorsYesterday),
      viewsWeekChange: calcChange(visitorsThisWeek, visitorsLastWeek),
      viewsMonthChange: calcChange(visitorsThisMonth, visitorsLastMonth),
      dau,
      wau,
      mau,
      // Change percentages for authenticated users
      dauChange: calcChange(dau, dauYesterday),
      wauChange: calcChange(wau, wauLastWeek),
      mauChange: calcChange(mau, mauLastMonth),
      topProducts,
      averageSessionDuration: 0,
      bounceRate: 0,
      conversionRate: 0,
    };
  },
});

/**
 * Get unique visitors time-series data for charts
 */
export const getViewsSeries = query({
  args: { interval: v.string() },
  handler: async (ctx, args): Promise<TimeSeriesDataPoint[]> => {
    const now = Date.now();
    const points: TimeSeriesDataPoint[] = [];

    if (args.interval === "daily") {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const dayStart = getStartOfDay(date.getTime());
        const dayEnd = getEndOfDay(date.getTime());
        const dayKey = getDayKey(date.getTime());
        
        // Count unique visitors per day (not raw page views)
        const count = await countUniqueVisitorsInRange(ctx, dayStart, dayEnd);
        
        points.push({
          name: date.toLocaleDateString("he-IL", { day: "numeric", month: "short" }),
          value: Number(count),
          timestamp: dayKey,
        });
      }
    } else if (args.interval === "weekly") {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        const weekKey = getWeekKey(weekStart.getTime());
        
        // Count unique visitors per week
        const count = await countUniqueVisitorsInRange(ctx, getStartOfDay(weekStart.getTime()), getEndOfDay(weekEnd.getTime()));
        
        points.push({
          name: `שבוע ${weekKey.split("-W")[1]}`,
          value: Number(count),
          timestamp: weekKey,
        });
      }
    } else if (args.interval === "monthly") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setUTCMonth(date.getUTCMonth() - i);
        const monthKey = getMonthKey(date.getTime());
        
        const startOfMonth = new Date(date);
        startOfMonth.setUTCDate(1);
        const endOfMonth = new Date(date);
        endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1, 0);
        
        // Count unique visitors per month
        const count = await countUniqueVisitorsInRange(ctx, startOfMonth.getTime(), endOfMonth.getTime());
        
        points.push({
          name: date.toLocaleDateString("he-IL", { month: "short" }),
          value: Number(count),
          timestamp: monthKey,
        });
      }
    }

    return points;
  },
});

/**
 * Get new users time-series data
 */
export const getNewUsersSeries = query({
  args: { interval: v.string() },
  handler: async (ctx, args): Promise<TimeSeriesDataPoint[]> => {
    // For now, return same structure as views but with user counts
    // In a real implementation, you'd track new user signups separately
    const viewsSeries = await getViewsSeriesInternal(ctx, args.interval);
    
    // Scale down views to simulate user growth
    // In production, replace with actual new user tracking
    return viewsSeries.map((point) => ({
      ...point,
      value: Math.floor(point.value * 0.3), // Approximate: 30% of views are unique users
    }));
  },
});

/**
 * Internal function to get views series data
 * This allows getNewUsersSeries to call the logic without invoking the query directly
 */
async function getViewsSeriesInternal(
  ctx: any,
  interval: string
): Promise<TimeSeriesDataPoint[]> {
  const now = Date.now();
  const points: TimeSeriesDataPoint[] = [];

  if (interval === "daily") {
    // Last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayStart = getStartOfDay(date.getTime());
      const dayEnd = getEndOfDay(date.getTime());
      const dayKey = getDayKey(date.getTime());
      
      const count = await countPageViewsInRange(ctx, dayStart, dayEnd);
      
      points.push({
        name: date.toLocaleDateString("he-IL", { day: "numeric", month: "short" }),
        value: Number(count),
        timestamp: dayKey,
      });
    }
  } else if (interval === "weekly") {
    // Last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      const weekKey = getWeekKey(weekStart.getTime());
      
      const count = await countPageViewsInRange(ctx, getStartOfDay(weekStart.getTime()), getEndOfDay(weekEnd.getTime()));
      
      points.push({
        name: `שבוע ${weekKey.split("-W")[1]}`,
        value: Number(count),
        timestamp: weekKey,
      });
    }
  } else if (interval === "monthly") {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setUTCMonth(date.getUTCMonth() - i);
      const monthKey = getMonthKey(date.getTime());
      
      const startOfMonth = new Date(date);
      startOfMonth.setUTCDate(1);
      const endOfMonth = new Date(date);
      endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1, 0);
      
      const count = await countPageViewsInRange(ctx, startOfMonth.getTime(), endOfMonth.getTime());
      
      points.push({
        name: date.toLocaleDateString("he-IL", { month: "short" }),
        value: Number(count),
        timestamp: monthKey,
      });
    }
  }

  return points;
}

/**
 * Helper function to get top products by view count
 */
async function getTopProductsByViews(
  ctx: any,
  limit: number
): Promise<Array<{ productId: string; productName: string; views: number }>> {
  // Query analyticsEvents for product_viewed events
  const events = await ctx.db
    .query("analyticsEvents")
    .withIndex("by_event", (q) => q.eq("event", "product_viewed"))
    .collect();
  
  // Aggregate views per product
  const productViews: Record<string, number> = {};
  
  for (const event of events) {
    const productId = event.properties?.productId;
    if (productId && typeof productId === "string") {
      productViews[productId] = (productViews[productId] || 0) + 1;
    }
  }
  
  // Sort by views and get top N
  const sorted = Object.entries(productViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  
  // Get product details
  const results = [];
  for (const [productId, views] of sorted) {
    const product = await ctx.db.get("products", productId as any);
    results.push({
      productId,
      productName: product?.productNameHe || product?.productName || "Unknown Product",
      views,
    });
  }
  
  return results;
}

export const getTopProducts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return getTopProductsByViews(ctx, args.limit || 10);
  },
});

/**
 * Get conversion metrics for the dashboard
 */
export const getConversionMetrics = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const todayStart = getStartOfDay(now);
    const todayEnd = getEndOfDay(now);
    const yesterdayStart = getStartOfDay(now - ONE_DAY);
    const yesterdayEnd = getEndOfDay(now - ONE_DAY);

    // Get events for conversion calculation
    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp", (q) => 
        q.gte("timestamp", yesterdayStart).lte("timestamp", todayEnd)
      )
      .collect();

    // Calculate today's metrics
    const todayEvents = events.filter(e => e.timestamp >= todayStart && e.timestamp <= todayEnd);
    const productViewsToday = todayEvents.filter(e => e.event === "product_viewed").length;
    const addToCartsToday = todayEvents.filter(e => e.event === "cart_item_added").length;
    const checkoutsStartedToday = todayEvents.filter(e => e.event === "checkout_started").length;
    const ordersCompletedToday = todayEvents.filter(e => e.event === "order_completed").length;

    // Calculate yesterday's metrics
    const yesterdayEvents = events.filter(e => e.timestamp >= yesterdayStart && e.timestamp <= yesterdayEnd);
    const productViewsYesterday = yesterdayEvents.filter(e => e.event === "product_viewed").length;
    const addToCartsYesterday = yesterdayEvents.filter(e => e.event === "cart_item_added").length;
    const checkoutsStartedYesterday = yesterdayEvents.filter(e => e.event === "checkout_started").length;
    const ordersCompletedYesterday = yesterdayEvents.filter(e => e.event === "order_completed").length;

    // Calculate conversion rates
    const calcRate = (numerator: number, denominator: number): number => {
      if (denominator === 0) return 0;
      return (numerator / denominator) * 100;
    };

    // Calculate changes
    const calcChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      // Today's metrics
      productToCartRate: calcRate(addToCartsToday, productViewsToday),
      cartToCheckoutRate: calcRate(checkoutsStartedToday, addToCartsToday),
      checkoutToOrderRate: calcRate(ordersCompletedToday, checkoutsStartedToday),
      overallConversionRate: calcRate(ordersCompletedToday, productViewsToday),
      
      // Yesterday's metrics for comparison
      productToCartRateYesterday: calcRate(addToCartsYesterday, productViewsYesterday),
      cartToCheckoutRateYesterday: calcRate(checkoutsStartedYesterday, addToCartsYesterday),
      checkoutToOrderRateYesterday: calcRate(ordersCompletedYesterday, checkoutsStartedYesterday),
      overallConversionRateYesterday: calcRate(ordersCompletedYesterday, productViewsYesterday),
      
      // Changes
      productToCartRateChange: calcChange(
        calcRate(addToCartsToday, productViewsToday),
        calcRate(addToCartsYesterday, productViewsYesterday)
      ),
      overallConversionRateChange: calcChange(
        calcRate(ordersCompletedToday, productViewsToday),
        calcRate(ordersCompletedYesterday, productViewsYesterday)
      ),
      
      // Raw counts
      productViewsToday,
      addToCartsToday,
      checkoutsStartedToday,
      ordersCompletedToday,
    };
  },
});

/**
 * Get checkout funnel data
 */
export const getCheckoutFunnel = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const now = Date.now();
    const startTime = getStartOfDay(now - days * 24 * 60 * 60 * 1000);
    const endTime = getEndOfDay(now);

    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp", (q) => 
        q.gte("timestamp", startTime).lte("timestamp", endTime)
      )
      .collect();

    // Count unique users at each funnel stage
    const productViews = new Set(events.filter(e => e.event === "product_viewed").map(e => e.userId || e.anonymousId)).size;
    const addToCart = new Set(events.filter(e => e.event === "cart_item_added").map(e => e.userId || e.anonymousId)).size;
    const cartViews = new Set(events.filter(e => e.event === "cart_viewed").map(e => e.userId || e.anonymousId)).size;
    const checkoutStarted = new Set(events.filter(e => e.event === "checkout_started").map(e => e.userId || e.anonymousId)).size;
    const checkoutShipping = new Set(events.filter(e => 
      e.event === "checkout_step_viewed" && e.properties?.step === "shipping"
    ).map(e => e.userId || e.anonymousId)).size;
    const checkoutPayment = new Set(events.filter(e => 
      e.event === "checkout_step_viewed" && e.properties?.step === "payment"
    ).map(e => e.userId || e.anonymousId)).size;
    const ordersCompleted = new Set(events.filter(e => e.event === "order_completed").map(e => e.userId || e.anonymousId)).size;

    return {
      steps: [
        { name: "הצגת מוצר", count: productViews, dropOff: 0 },
        { name: "הוספה לסל", count: addToCart, dropOff: productViews > 0 ? ((productViews - addToCart) / productViews) * 100 : 0 },
        { name: "צפייה בסל", count: cartViews, dropOff: addToCart > 0 ? ((addToCart - cartViews) / addToCart) * 100 : 0 },
        { name: "התחלת תשלום", count: checkoutStarted, dropOff: cartViews > 0 ? ((cartViews - checkoutStarted) / cartViews) * 100 : 0 },
        { name: "פרטי משלוח", count: checkoutShipping, dropOff: checkoutStarted > 0 ? ((checkoutStarted - checkoutShipping) / checkoutStarted) * 100 : 0 },
        { name: "תשלום", count: checkoutPayment, dropOff: checkoutShipping > 0 ? ((checkoutShipping - checkoutPayment) / checkoutShipping) * 100 : 0 },
        { name: "הזמנה הושלמה", count: ordersCompleted, dropOff: checkoutPayment > 0 ? ((checkoutPayment - ordersCompleted) / checkoutPayment) * 100 : 0 },
      ],
      totalConversion: productViews > 0 ? (ordersCompleted / productViews) * 100 : 0,
    };
  },
});

/**
 * Get cart metrics including abandonment rate
 */
export const getCartMetrics = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const todayStart = getStartOfDay(now);
    const todayEnd = getEndOfDay(now);
    const weekStart = getStartOfDay(now - 7 * ONE_DAY);

    // Get cart events
    const cartEvents = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_event", (q) => 
        q.eq("event", "cart_item_added")
      )
      .collect();

    const todayCartEvents = cartEvents.filter(e => e.timestamp >= todayStart && e.timestamp <= todayEnd);
    const weekCartEvents = cartEvents.filter(e => e.timestamp >= weekStart && e.timestamp <= todayEnd);

    // Get checkout and order events
    const checkoutEvents = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_event", (q) => 
        q.eq("event", "checkout_started")
      )
      .collect();

    const orderEvents = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_event", (q) => 
        q.eq("event", "order_completed")
      )
      .collect();

    const todayOrders = orderEvents.filter(e => e.timestamp >= todayStart && e.timestamp <= todayEnd).length;
    const weekOrders = orderEvents.filter(e => e.timestamp >= weekStart && e.timestamp <= todayEnd).length;

    // Calculate abandonment: users who added to cart but didn't complete order
    const todayCartUsers = new Set(todayCartEvents.map(e => e.userId || e.anonymousId));
    const todayOrderUsers = new Set(
      orderEvents.filter(e => e.timestamp >= todayStart && e.timestamp <= todayEnd)
        .map(e => e.userId || e.anonymousId)
    );

    const abandonedCartsToday = Array.from(todayCartUsers).filter(id => !todayOrderUsers.has(id)).length;
    const abandonmentRateToday = todayCartUsers.size > 0 ? (abandonedCartsToday / todayCartUsers.size) * 100 : 0;

    // Average cart value
    const calcAvgCartValue = (events: typeof orderEvents) => {
      if (events.length === 0) return 0;
      const total = events.reduce((sum, e) => sum + (e.properties?.total || 0), 0);
      return total / events.length;
    };

    return {
      cartsCreatedToday: todayCartEvents.length,
      cartsCreatedWeek: weekCartEvents.length,
      abandonedCartsToday,
      abandonmentRateToday,
      abandonmentRateChange: 0, // Would need historical data
      averageCartValueToday: calcAvgCartValue(orderEvents.filter(e => e.timestamp >= todayStart && e.timestamp <= todayEnd)),
      averageCartValueWeek: calcAvgCartValue(orderEvents.filter(e => e.timestamp >= weekStart && e.timestamp <= todayEnd)),
      ordersToday: todayOrders,
      ordersWeek: weekOrders,
    };
  },
});

/**
 * Get coupon usage metrics
 */
export const getCouponMetrics = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_event", (q) => 
        q.eq("event", "coupon_applied")
      )
      .collect();

    const monthEvents = events.filter(e => e.timestamp >= monthStart.getTime());
    
    const successful = monthEvents.filter(e => e.properties?.success);
    const failed = monthEvents.filter(e => !e.properties?.success);

    // Group by coupon code
    const couponStats: Record<string, { uses: number; totalDiscount: number }> = {};
    for (const event of successful) {
      const code = event.properties?.couponCode;
      if (code && typeof code === "string") {
        if (!couponStats[code]) {
          couponStats[code] = { uses: 0, totalDiscount: 0 };
        }
        couponStats[code].uses++;
        couponStats[code].totalDiscount += event.properties?.discountAmount || 0;
      }
    }

    const topCoupons = Object.entries(couponStats)
      .map(([code, stats]) => ({ code, ...stats }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 5);

    return {
      totalUsesThisMonth: successful.length,
      failedAttemptsThisMonth: failed.length,
      totalDiscountGiven: successful.reduce((sum, e) => sum + (e.properties?.discountAmount || 0), 0),
      topCoupons,
    };
  },
});

/**
 * Get search analytics
 */
export const getSearchMetrics = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_event", (q) => 
        q.eq("event", "search_performed")
      )
      .collect();

    const monthEvents = events.filter(e => e.timestamp >= monthStart.getTime());

    // Group by query
    const queryStats: Record<string, { count: number; avgResults: number }> = {};
    for (const event of monthEvents) {
      const query = event.properties?.query;
      if (query && typeof query === "string") {
        const normalizedQuery = query.toLowerCase().trim();
        if (!queryStats[normalizedQuery]) {
          queryStats[normalizedQuery] = { count: 0, avgResults: 0 };
        }
        queryStats[normalizedQuery].count++;
        queryStats[normalizedQuery].avgResults = event.properties?.resultsCount || 0;
      }
    }

    const topSearches = Object.entries(queryStats)
      .map(([query, stats]) => ({ query, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const searchesWithZeroResults = monthEvents.filter(e => (e.properties?.resultsCount || 0) === 0).length;

    return {
      totalSearchesThisMonth: monthEvents.length,
      searchesWithZeroResults,
      averageResultsPerSearch: monthEvents.length > 0 
        ? monthEvents.reduce((sum, e) => sum + (e.properties?.resultsCount || 0), 0) / monthEvents.length 
        : 0,
      topSearches,
    };
  },
});

/**
 * Get sales/revenue time series data
 */
export const getSalesSeries = query({
  args: { interval: v.string() },
  handler: async (ctx, args): Promise<TimeSeriesDataPoint[]> => {
    const now = Date.now();
    const points: TimeSeriesDataPoint[] = [];

    if (args.interval === "daily") {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const dayStart = getStartOfDay(date.getTime());
        const dayEnd = getEndOfDay(date.getTime());
        const dayKey = getDayKey(date.getTime());

        // Get orders for this day
        const events = await ctx.db
          .query("analyticsEvents")
          .withIndex("by_event", (q: any) => q.eq("event", "order_completed"))
          .collect();

        const dayOrders = events.filter((e: any) => {
          const ts = typeof e.timestamp === "string" ? Number(e.timestamp) : e.timestamp;
          return ts >= dayStart && ts <= dayEnd;
        });

        const revenue = dayOrders.reduce((sum: number, e: any) => sum + (e.properties?.total || 0), 0);
        const orders = dayOrders.length;

        points.push({
          name: date.toLocaleDateString("he-IL", { day: "numeric", month: "short" }),
          value: revenue,
          orders,
          timestamp: dayKey,
        });
      }
    } else if (args.interval === "weekly") {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        const weekKey = getWeekKey(weekStart.getTime());

        const events = await ctx.db
          .query("analyticsEvents")
          .withIndex("by_event", (q: any) => q.eq("event", "order_completed"))
          .collect();

        const weekOrders = events.filter((e: any) => {
          const ts = typeof e.timestamp === "string" ? Number(e.timestamp) : e.timestamp;
          return ts >= getStartOfDay(weekStart.getTime()) && ts <= getEndOfDay(weekEnd.getTime());
        });

        const revenue = weekOrders.reduce((sum: number, e: any) => sum + (e.properties?.total || 0), 0);

        points.push({
          name: `שבוע ${weekKey.split("-W")[1]}`,
          value: revenue,
          orders: weekOrders.length,
          timestamp: weekKey,
        });
      }
    } else if (args.interval === "monthly") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setUTCMonth(date.getUTCMonth() - i);
        const monthKey = getMonthKey(date.getTime());

        const startOfMonth = new Date(date);
        startOfMonth.setUTCDate(1);
        const endOfMonth = new Date(date);
        endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1, 0);

        const events = await ctx.db
          .query("analyticsEvents")
          .withIndex("by_event", (q: any) => q.eq("event", "order_completed"))
          .collect();

        const monthOrders = events.filter((e: any) => {
          const ts = typeof e.timestamp === "string" ? Number(e.timestamp) : e.timestamp;
          return ts >= startOfMonth.getTime() && ts <= endOfMonth.getTime();
        });

        const revenue = monthOrders.reduce((sum: number, e: any) => sum + (e.properties?.total || 0), 0);

        points.push({
          name: date.toLocaleDateString("he-IL", { month: "short" }),
          value: revenue,
          orders: monthOrders.length,
          timestamp: monthKey,
        });
      }
    }

    return points;
  },
});
