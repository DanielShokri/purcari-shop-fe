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
 * Get analytics summary for dashboard
 */
export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const today = getDayKey(now);
    const thisWeek = getWeekKey(now);
    const thisMonth = getMonthKey(now);

    // Get today's views
    const viewsToday = await dailyViewsAggregate.count(ctx, {
      namespace: undefined,
      bounds: { prefix: [today] },
    });

    // Get this week's views
    const startOfWeek = getStartOfDay(now - 7 * 24 * 60 * 60 * 1000);
    const endOfWeek = getEndOfDay(now);
    const viewsThisWeek = await dailyViewsAggregate.count(ctx, {
      namespace: undefined,
      bounds: {
        lower: { key: getDayKey(startOfWeek) },
        upper: { key: getDayKey(endOfWeek) },
      },
    });

    // Get this month's views
    const startOfMonth = new Date(now);
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const endOfMonth = new Date(now);
    const viewsThisMonth = await dailyViewsAggregate.count(ctx, {
      namespace: undefined,
      bounds: {
        lower: { key: getDayKey(startOfMonth.getTime()) },
        upper: { key: getDayKey(endOfMonth.getTime()) },
      },
    });

    // Get DAU (Daily Active Users) - unique users today
    const dau = await activeUsersAggregate.count(ctx, {
      namespace: undefined,
      bounds: { prefix: [today] },
    });

    // Get WAU (Weekly Active Users) - unique users this week
    const wau = await activeUsersAggregate.count(ctx, {
      namespace: undefined,
      bounds: {
        lower: { key: [getDayKey(startOfWeek), ""] },
        upper: { key: [getDayKey(endOfWeek), "\xFF"] },
      },
    });

    // Get MAU (Monthly Active Users) - unique users this month
    const mau = await activeUsersAggregate.count(ctx, {
      namespace: undefined,
      bounds: {
        lower: { key: [getDayKey(startOfMonth.getTime()), ""] },
        upper: { key: [getDayKey(endOfMonth.getTime()), "\xFF"] },
      },
    });

    // Calculate total views and visitors
    const totalViews = await dailyViewsAggregate.count(ctx, { namespace: undefined });
    const totalVisitors = await activeUsersAggregate.count(ctx, { namespace: undefined });

    // Get top products by views
    const topProducts = await getTopProductsByViews(ctx, 10);

    return {
      totalViews,
      totalVisitors,
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
      dau,
      wau,
      mau,
      topProducts,
      averageSessionDuration: 0, // Placeholder - requires session tracking
      bounceRate: 0, // Placeholder - requires session tracking
      conversionRate: 0, // Placeholder - requires order tracking
    };
  },
});

/**
 * Get views time-series data for charts
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
        const dayKey = getDayKey(date.getTime());
        const count = await dailyViewsAggregate.count(ctx, {
          namespace: undefined,
          bounds: { prefix: [dayKey] },
        });
        
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
        
        const count = await dailyViewsAggregate.count(ctx, {
          namespace: undefined,
          bounds: {
            lower: { key: getDayKey(weekStart.getTime()) },
            upper: { key: getDayKey(weekEnd.getTime()) },
          },
        });
        
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
        
        const count = await dailyViewsAggregate.count(ctx, {
          namespace: undefined,
          bounds: {
            lower: { key: getDayKey(startOfMonth.getTime()) },
            upper: { key: getDayKey(endOfMonth.getTime()) },
          },
        });
        
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
      const dayKey = getDayKey(date.getTime());
      const count = await dailyViewsAggregate.count(ctx, {
        namespace: undefined,
        bounds: { prefix: [dayKey] },
      });
      
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
      
      const count = await dailyViewsAggregate.count(ctx, {
        namespace: undefined,
        bounds: {
          lower: { key: getDayKey(weekStart.getTime()) },
          upper: { key: getDayKey(weekEnd.getTime()) },
        },
      });
      
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
      
      const count = await dailyViewsAggregate.count(ctx, {
        namespace: undefined,
        bounds: {
          lower: { key: getDayKey(startOfMonth.getTime()) },
          upper: { key: getDayKey(endOfMonth.getTime()) },
        },
      });
      
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
