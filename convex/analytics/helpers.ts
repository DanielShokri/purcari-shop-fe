import { getDayKey, getWeekKey, getMonthKey, getStartOfDay, getEndOfDay } from "./aggregates";

/**
 * Time series data point for charts
 */
export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  name?: string;
  orders?: number; // For sales data that includes order count
}

/**
 * Count page views directly from events table within a time range
 */
export async function countPageViewsInRange(
  ctx: any,
  startTime: number,
  endTime: number
): Promise<number> {
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
 * Count authenticated users (those with userId, not anonymousId) in a time range
 */
export async function countAuthenticatedUsersInRange(
  ctx: any,
  startTime: number,
  endTime: number
): Promise<number> {
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
    if (event.userId) {
      authenticatedUsers.add(event.userId);
    }
  }
  return authenticatedUsers.size;
}

/**
 * Count unique visitors (both authenticated and anonymous) in a time range
 */
export async function countUniqueVisitorsInRange(
  ctx: any,
  startTime: number,
  endTime: number
): Promise<number> {
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
 * Get top products by view count
 */
export async function getTopProductsByViews(
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

/**
 * Build time series query helper for any aggregation logic
 */
export async function buildTimeSeries(
  ctx: any,
  interval: "daily" | "weekly" | "monthly",
  aggregateFunc: (events: any[], start: number, end: number) => number | Promise<number>
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

      const events = await ctx.db
        .query("analyticsEvents")
        .withIndex("by_timestamp", (q) =>
          q.gte("timestamp", dayStart).lte("timestamp", dayEnd)
        )
        .collect();

      const value = await aggregateFunc(events, dayStart, dayEnd);

      points.push({
        name: date.toLocaleDateString("he-IL", { day: "numeric", month: "short" }),
        value,
        timestamp: dayKey,
      });
    }
  } else if (interval === "weekly") {
    // Last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      const weekKey = getWeekKey(weekStart.getTime());

      const events = await ctx.db
        .query("analyticsEvents")
        .withIndex("by_timestamp", (q) =>
          q.gte("timestamp", getStartOfDay(weekStart.getTime())).lte("timestamp", getEndOfDay(weekEnd.getTime()))
        )
        .collect();

      const value = await aggregateFunc(events, getStartOfDay(weekStart.getTime()), getEndOfDay(weekEnd.getTime()));

      points.push({
        name: `שבוע ${weekKey.split("-W")[1]}`,
        value,
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

      const events = await ctx.db
        .query("analyticsEvents")
        .withIndex("by_timestamp", (q) =>
          q.gte("timestamp", startOfMonth.getTime()).lte("timestamp", endOfMonth.getTime())
        )
        .collect();

      const value = await aggregateFunc(events, startOfMonth.getTime(), endOfMonth.getTime());

      points.push({
        name: date.toLocaleDateString("he-IL", { month: "short" }),
        value,
        timestamp: monthKey,
      });
    }
  }

  return points;
}

/**
 * Calculate percentage change between current and previous values
 */
export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate conversion rate
 */
export function calculateRate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return (numerator / denominator) * 100;
}

/**
 * Filter events by type and time range
 */
export function filterEvents(
  events: any[],
  eventType: string,
  startTime: number,
  endTime: number
): any[] {
  return events.filter(e => {
    const ts = typeof e.timestamp === "string" ? Number(e.timestamp) : e.timestamp;
    return e.event === eventType && ts >= startTime && ts <= endTime;
  });
}
