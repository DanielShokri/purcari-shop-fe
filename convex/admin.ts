import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAnalyticsSummaryInternal } from "./analytics";

export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    return await getAnalyticsSummaryInternal(ctx, {});
  }
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    return {
      totalSales: 0,
      totalRevenue: 0,
      revenueChange: 0,
      orderCount: 0,
      newOrders: 0,
      ordersChange: 0,
      customerCount: 0,
      totalUsers: 0,
      usersChange: 0,
      averageOrderValue: 0,
      salesGrowth: 0,
      orderGrowth: 0,
      customerGrowth: 0,
      cancelledOrders: 0,
      pendingOrders: 0,
      conversionRate: 0,
    };
  }
});

export const getMonthlySales = query({
  args: {},
  handler: async (ctx) => {
    return [];
  }
});

export const globalSearch = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return {
      products: [],
      orders: [],
      users: [],
      categories: [],
      counts: {
        total: 0,
        products: 0,
        orders: 0,
        users: 0,
        categories: 0,
      },
      searchTime: 0,
    };
  }
});
