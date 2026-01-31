import { v } from "convex/values";
import { query } from "./_generated/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

    const allOrders = await ctx.db.query("orders").collect();
    const allUsers = await ctx.db.query("users").collect();
    const allProducts = await ctx.db.query("products").collect();

    // Calculate total revenue (from completed orders)
    const completedOrders = allOrders.filter((o) => o.status === "completed");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Revenue this month vs last month (from completed orders)
    const thisMonthCompletedOrders = completedOrders.filter((o) => o.createdAt >= startOfMonth);
    const lastMonthCompletedOrders = completedOrders.filter(
      (o) => o.createdAt >= startOfLastMonth && o.createdAt < startOfMonth
    );

    const thisMonthRevenue = thisMonthCompletedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const lastMonthRevenue = lastMonthCompletedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const revenueChange = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Orders this month
    const thisMonthAllOrders = allOrders.filter((o) => o.createdAt >= startOfMonth);
    const thisMonthCancelled = thisMonthAllOrders.filter((o) => o.status === "cancelled").length;
    const thisMonthPending = thisMonthAllOrders.filter((o) => o.status === "pending").length;

    // Orders today vs yesterday
    const todayOrders = allOrders.filter((o) => o.createdAt >= startOfToday);
    const yesterdayOrders = allOrders.filter(
      (o) => o.createdAt >= startOfYesterday && o.createdAt < startOfToday
    );
    const ordersChange = yesterdayOrders.length > 0 
      ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100 
      : 0;

    // Conversion rate
    const conversionRate = allUsers.length > 0 
      ? (allOrders.length / allUsers.length) * 100 
      : 0;

    return {
      totalRevenue,
      revenueChange: Math.round(revenueChange * 10) / 10,
      totalUsers: allUsers.length,
      usersChange: 5.2, // Mocked for now
      newOrders: thisMonthAllOrders.length,
      cancelledOrders: thisMonthCancelled,
      pendingOrders: thisMonthPending,
      ordersChange: Math.round(ordersChange * 10) / 10,
      totalProducts: allProducts.length,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  },
});

export const getMonthlySales = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();

    const ordersThisYear = allOrders.filter((o) => o.createdAt >= startOfYear);

    const monthNames = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
    const monthlyData: Record<number, number> = {};
    for (let i = 0; i <= now.getMonth(); i++) {
      monthlyData[i] = 0;
    }

    ordersThisYear.forEach((o) => {
      const orderDate = new Date(o.createdAt);
      const month = orderDate.getMonth();
      if (monthlyData[month] !== undefined) {
        monthlyData[month] += o.total;
      }
    });

    return Object.entries(monthlyData).map(([month, value]) => ({
      name: monthNames[parseInt(month)],
      value: Math.round(value),
    }));
  },
});
