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

export const getAnalyticsSummary = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekStr = startOfWeek.toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const events = await ctx.db.query("analyticsEvents").collect();
    const products = await ctx.db.query("products").collect();

    // Filter events by date ranges
    const todayEvents = events.filter((e) => e.timestamp >= startOfToday);
    const weekEvents = events.filter((e) => e.timestamp >= startOfWeekStr);
    const monthEvents = events.filter((e) => e.timestamp >= startOfMonth);

    // Count views
    const viewsToday = todayEvents.filter((e) => e.event === 'page_view' || e.event === 'product_view').length;
    const viewsThisWeek = weekEvents.filter((e) => e.event === 'page_view' || e.event === 'product_view').length;
    const viewsThisMonth = monthEvents.filter((e) => e.event === 'page_view' || e.event === 'product_view').length;

    // Calculate DAU/WAU/MAU (unique users/anonymous)
    const getUniques = (eventList: any[]) => {
      const ids = new Set();
      eventList.forEach(e => {
        if (e.userId) ids.add(e.userId);
        else if (e.anonymousId) ids.add(e.anonymousId);
      });
      return ids.size;
    };

    const dau = getUniques(todayEvents);
    const wau = getUniques(weekEvents);
    const mau = getUniques(monthEvents);

    // Top products
    const productViewCounts: Record<string, number> = {};
    events.forEach((e) => {
      if (e.event === 'product_view' && e.properties?.productId) {
        const pid = e.properties.productId;
        productViewCounts[pid] = (productViewCounts[pid] || 0) + 1;
      }
    });

    const productsMap = new Map(products.map((p) => [p._id, p.productNameHe || p.productName]));
    
    const topProducts = Object.entries(productViewCounts)
      .map(([productId, views]) => ({
        productId,
        productName: productsMap.get(productId as any) || 'מוצר לא ידוע',
        views,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
      dau,
      wau,
      mau,
      topProducts,
      retention: {
        week1: 45, // Mocked for now
        week7: 12,
        week30: 5,
      }
    };
  },
});

export const getViewsSeries = query({
  args: { interval: v.string() }, // 'daily', 'weekly', 'monthly'
  handler: async (ctx, args) => {
    const now = new Date();
    let startDate: Date;
    
    if (args.interval === 'daily') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    } else if (args.interval === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 84); // 12 weeks
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    }

    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_event", (q) => q.eq("event", "page_view")) // Simplification: just page views
      .collect();
    
    const filteredEvents = events.filter(e => e.timestamp >= startDate.toISOString());

    const monthNames = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
    const aggregated: Record<string, number> = {};

    filteredEvents.forEach(e => {
      const date = new Date(e.timestamp);
      let key = "";
      if (args.interval === 'daily') {
        key = `${date.getDate()}/${date.getMonth() + 1}`;
      } else if (args.interval === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `W${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      } else {
        key = monthNames[date.getMonth()];
      }
      aggregated[key] = (aggregated[key] || 0) + 1;
    });

    return Object.entries(aggregated).map(([name, value]) => ({ name, value }));
  }
});

export const getNewUsersSeries = query({
  args: { interval: v.string() },
  handler: async (ctx, args) => {
    const now = new Date();
    let startDate: Date;
    
    if (args.interval === 'daily') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    } else if (args.interval === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 84);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    }

    const users = await ctx.db.query("users").collect();
    const filteredUsers = users.filter(u => u.createdAt >= startDate.toISOString());

    const monthNames = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
    const aggregated: Record<string, number> = {};

    filteredUsers.forEach(u => {
      const date = new Date(u.createdAt);
      let key = "";
      if (args.interval === 'daily') {
        key = `${date.getDate()}/${date.getMonth() + 1}`;
      } else if (args.interval === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `W${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      } else {
        key = monthNames[date.getMonth()];
      }
      aggregated[key] = (aggregated[key] || 0) + 1;
    });

    return Object.entries(aggregated).map(([name, value]) => ({ name, value }));
  }
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

export const globalSearch = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const term = args.searchTerm.toLowerCase();
    const startTime = Date.now();

    if (term.length < 2) {
      return {
        orders: [],
        users: [],
        products: [],
        categories: [],
        counts: { total: 0, orders: 0, users: 0, products: 0, categories: 0 },
        searchTime: 0,
      };
    }

    // Search Products
    const products = await ctx.db
      .query("products")
      .collect();
    
    const filteredProducts = products.filter(p => 
      p.productName.toLowerCase().includes(term) || 
      (p.productNameHe && p.productNameHe.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      (p.descriptionHe && p.descriptionHe.toLowerCase().includes(term)) ||
      p.sku.toLowerCase().includes(term)
    );

    // Search Users
    const users = await ctx.db
      .query("users")
      .collect();
    
    const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(term) || 
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.toLowerCase().includes(term))
    );

    // Search Orders
    const orders = await ctx.db
      .query("orders")
      .collect();
    
    const filteredOrders = orders.filter(o => 
      o.paymentTransactionId.toLowerCase().includes(term) || 
      o.customerName.toLowerCase().includes(term) ||
      o.customerEmail.toLowerCase().includes(term) ||
      o.shippingCity.toLowerCase().includes(term)
    );

    // Search Categories
    const categories = await ctx.db
      .query("categories")
      .collect();
    
    const filteredCategories = categories.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.description?.toLowerCase().includes(term)
    );

    const counts = {
      orders: filteredOrders.length,
      users: filteredUsers.length,
      products: filteredProducts.length,
      categories: filteredCategories.length,
      total: filteredOrders.length + filteredUsers.length + filteredProducts.length + filteredCategories.length,
    };

    const searchTime = (Date.now() - startTime) / 1000;

    return {
      orders: filteredOrders,
      users: filteredUsers,
      products: filteredProducts,
      categories: filteredCategories,
      counts,
      searchTime,
    };
  },
});
