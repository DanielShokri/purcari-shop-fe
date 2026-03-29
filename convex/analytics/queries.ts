import { query } from "../_generated/server";
import { v } from "convex/values";
import { getDayKey, getWeekKey, getMonthKey, getStartOfDay, getEndOfDay } from "./aggregates";
import {
  TimeSeriesDataPoint,
  countPageViewsInRange,
  countAuthenticatedUsersInRange,
  countUniqueVisitorsInRange,
  getTopProductsByViews,
  buildTimeSeries,
  calculateChange,
  calculateRate,
  filterEvents,
} from "./helpers";

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
    const endOfWeek = todayEnd;

    // Last week's boundaries
    const lastWeekStart = startOfWeek - ONE_WEEK;
    const lastWeekEnd = endOfWeek - ONE_WEEK;

    // Calculate month boundaries
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Last month's boundaries
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    // Get unique visitors for current periods
    const visitorsToday = await countUniqueVisitorsInRange(ctx, todayStart, todayEnd);
    const visitorsThisWeek = await countUniqueVisitorsInRange(ctx, startOfWeek, endOfWeek);
    const visitorsThisMonth = await countUniqueVisitorsInRange(ctx, startOfMonth.getTime(), endOfMonth.getTime());

    // Get unique visitors for previous periods
    const visitorsYesterday = await countUniqueVisitorsInRange(ctx, yesterdayStart, yesterdayEnd);
    const visitorsLastWeek = await countUniqueVisitorsInRange(ctx, lastWeekStart, lastWeekEnd);
    const visitorsLastMonth = await countUniqueVisitorsInRange(ctx, lastMonthStart.getTime(), lastMonthEnd.getTime());

    // Get authenticated user counts (DAU/WAU/MAU)
    const dau = await countAuthenticatedUsersInRange(ctx, todayStart, todayEnd);
    const wau = await countAuthenticatedUsersInRange(ctx, startOfWeek, endOfWeek);
    const mau = await countAuthenticatedUsersInRange(ctx, startOfMonth.getTime(), endOfMonth.getTime());

    // Get authenticated user counts for previous periods
    const dauYesterday = await countAuthenticatedUsersInRange(ctx, yesterdayStart, yesterdayEnd);
    const wauLastWeek = await countAuthenticatedUsersInRange(ctx, lastWeekStart, lastWeekEnd);
    const mauLastMonth = await countAuthenticatedUsersInRange(ctx, lastMonthStart.getTime(), lastMonthEnd.getTime());

    // Get all unique visitors (all time)
    const allEvents = await ctx.db.query("analyticsEvents").collect();
    const allUniqueVisitors = new Set<string>();
    for (const event of allEvents) {
      const visitorId = event.userId || event.anonymousId;
      if (visitorId) {
        allUniqueVisitors.add(visitorId);
      }
    }
    const totalVisitors = allUniqueVisitors.size;

    // Get top products
    const topProducts = await getTopProductsByViews(ctx, 10);

    return {
      totalViews: totalVisitors,
      totalVisitors,
      viewsToday: visitorsToday,
      viewsThisWeek: visitorsThisWeek,
      viewsThisMonth: visitorsThisMonth,
      viewsTodayChange: calculateChange(visitorsToday, visitorsYesterday),
      viewsWeekChange: calculateChange(visitorsThisWeek, visitorsLastWeek),
      viewsMonthChange: calculateChange(visitorsThisMonth, visitorsLastMonth),
      dau,
      wau,
      mau,
      dauChange: calculateChange(dau, dauYesterday),
      wauChange: calculateChange(wau, wauLastWeek),
      mauChange: calculateChange(mau, mauLastMonth),
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
    return buildTimeSeries(ctx, args.interval as "daily" | "weekly" | "monthly", async (events, start, end) => {
      // Count unique visitors per period
      const uniqueVisitors = new Set<string>();
      for (const event of events) {
        const userId = event.userId || event.anonymousId;
        if (userId) {
          uniqueVisitors.add(userId);
        }
      }
      return uniqueVisitors.size;
    });
  },
});

/**
 * Get new users time-series data (placeholder: 30% of page views)
 */
export const getNewUsersSeries = query({
  args: { interval: v.string() },
  handler: async (ctx, args): Promise<TimeSeriesDataPoint[]> => {
    // Get page views series using buildTimeSeries
    const pageViewsSeries = await buildTimeSeries(
      ctx,
      args.interval as "daily" | "weekly" | "monthly",
      async (events) => {
        // Count page_viewed events
        return events.filter(e => e.event === "page_viewed").length;
      }
    );
    // Scale down to simulate new users (30% of page views)
    return pageViewsSeries.map(point => ({
      ...point,
      value: Math.floor(point.value * 0.3),
    }));
  },
});

/**
 * Get top products by views
 */
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

    // Today's metrics
    const todayEvents = events.filter(e => e.timestamp >= todayStart && e.timestamp <= todayEnd);
    const productViewsToday = todayEvents.filter(e => e.event === "product_viewed").length;
    const addToCartsToday = todayEvents.filter(e => e.event === "cart_item_added").length;
    const checkoutsStartedToday = todayEvents.filter(e => e.event === "checkout_started").length;
    const ordersCompletedToday = todayEvents.filter(e => e.event === "order_completed").length;

    // Yesterday's metrics
    const yesterdayEvents = events.filter(e => e.timestamp >= yesterdayStart && e.timestamp <= yesterdayEnd);
    const productViewsYesterday = yesterdayEvents.filter(e => e.event === "product_viewed").length;
    const addToCartsYesterday = yesterdayEvents.filter(e => e.event === "cart_item_added").length;
    const checkoutsStartedYesterday = yesterdayEvents.filter(e => e.event === "checkout_started").length;
    const ordersCompletedYesterday = yesterdayEvents.filter(e => e.event === "order_completed").length;

    return {
      productToCartRate: calculateRate(addToCartsToday, productViewsToday),
      cartToCheckoutRate: calculateRate(checkoutsStartedToday, addToCartsToday),
      checkoutToOrderRate: calculateRate(ordersCompletedToday, checkoutsStartedToday),
      overallConversionRate: calculateRate(ordersCompletedToday, productViewsToday),

      productToCartRateYesterday: calculateRate(addToCartsYesterday, productViewsYesterday),
      cartToCheckoutRateYesterday: calculateRate(checkoutsStartedYesterday, addToCartsYesterday),
      checkoutToOrderRateYesterday: calculateRate(ordersCompletedYesterday, checkoutsStartedYesterday),
      overallConversionRateYesterday: calculateRate(ordersCompletedYesterday, productViewsYesterday),

      productToCartRateChange: calculateChange(
        calculateRate(addToCartsToday, productViewsToday),
        calculateRate(addToCartsYesterday, productViewsYesterday)
      ),
      overallConversionRateChange: calculateChange(
        calculateRate(ordersCompletedToday, productViewsToday),
        calculateRate(ordersCompletedYesterday, productViewsYesterday)
      ),

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

    const steps = [
      { name: "הצגת מוצר", count: productViews, dropOff: 0 },
      { name: "הוספה לסל", count: addToCart, dropOff: productViews > 0 ? ((productViews - addToCart) / productViews) * 100 : 0 },
      { name: "צפייה בסל", count: cartViews, dropOff: addToCart > 0 ? ((addToCart - cartViews) / addToCart) * 100 : 0 },
      { name: "התחלת תשלום", count: checkoutStarted, dropOff: cartViews > 0 ? ((cartViews - checkoutStarted) / cartViews) * 100 : 0 },
      { name: "פרטי משלוח", count: checkoutShipping, dropOff: checkoutStarted > 0 ? ((checkoutStarted - checkoutShipping) / checkoutStarted) * 100 : 0 },
      { name: "תשלום", count: checkoutPayment, dropOff: checkoutShipping > 0 ? ((checkoutShipping - checkoutPayment) / checkoutShipping) * 100 : 0 },
      { name: "הזמנה הושלמה", count: ordersCompleted, dropOff: checkoutPayment > 0 ? ((checkoutPayment - ordersCompleted) / checkoutPayment) * 100 : 0 },
    ];

    return {
      steps,
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

    // Calculate abandonment
    const todayCartUsers = new Set(todayCartEvents.map(e => e.userId || e.anonymousId));
    const todayOrderUsers = new Set(
      orderEvents.filter(e => e.timestamp >= todayStart && e.timestamp <= todayEnd)
        .map(e => e.userId || e.anonymousId)
    );

    const abandonedCartsToday = Array.from(todayCartUsers).filter(id => !todayOrderUsers.has(id)).length;
    const abandonmentRateToday = todayCartUsers.size > 0 ? (abandonedCartsToday / todayCartUsers.size) * 100 : 0;

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
      abandonmentRateChange: 0,
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

        const ev = await ctx.db
          .query("analyticsEvents")
          .withIndex("by_timestamp", (q: any) =>
            q.gte("timestamp", dayStart).lte("timestamp", dayEnd)
          )
          .collect();

        const dayOrders = ev.filter((e: any) => {
          const ts = typeof e.timestamp === "string" ? Number(e.timestamp) : e.timestamp;
          return ts >= dayStart && ts <= dayEnd && e.event === "order_completed";
        });

        const revenue = dayOrders.reduce((sum: number, e: any) => sum + (e.properties?.total || 0), 0);

        points.push({
          name: date.toLocaleDateString("he-IL", { day: "numeric", month: "short" }),
          value: revenue,
          orders: dayOrders.length,
          timestamp: dayKey,
        });
      }
    } else if (args.interval === "weekly") {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        const weekKey = getWeekKey(weekStart.getTime());

        const ev = await ctx.db
          .query("analyticsEvents")
          .withIndex("by_timestamp", (q: any) =>
            q.gte("timestamp", getStartOfDay(weekStart.getTime())).lte("timestamp", getEndOfDay(weekEnd.getTime()))
          )
          .collect();

        const weekOrders = ev.filter((e: any) => {
          const ts = typeof e.timestamp === "string" ? Number(e.timestamp) : e.timestamp;
          return ts >= getStartOfDay(weekStart.getTime()) && ts <= getEndOfDay(weekEnd.getTime()) && e.event === "order_completed";
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

        const ev = await ctx.db
          .query("analyticsEvents")
          .withIndex("by_timestamp", (q: any) =>
            q.gte("timestamp", startOfMonth.getTime()).lte("timestamp", endOfMonth.getTime())
          )
          .collect();

        const monthOrders = ev.filter((e: any) => {
          const ts = typeof e.timestamp === "string" ? Number(e.timestamp) : e.timestamp;
          return ts >= startOfMonth.getTime() && ts <= endOfMonth.getTime() && e.event === "order_completed";
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
