import { v } from "convex/values";
import { query } from "./_generated/server";
import { adminQuery } from "./authHelpers";

// Hebrew month names
const hebrewMonths = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    // Get all orders
    const orders = await ctx.db.query("orders").collect();

    // Get all users
    const users = await ctx.db.query("users").collect();

    // Calculate total revenue (completed orders only)
    const completedOrders = orders.filter(o => o.status === "completed");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

    // Calculate current month stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const lastMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    });

    // Calculate revenue change
    const thisMonthRevenue = thisMonthOrders
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.total, 0);
    const lastMonthRevenue = lastMonthOrders
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.total, 0);
    const revenueChange = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    // Calculate user change
    const thisMonthUsers = users.filter(u => {
      if (!u.createdAt) return false;
      const userDate = new Date(u.createdAt);
      return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    }).length;
    const lastMonthUsers = users.filter(u => {
      if (!u.createdAt) return false;
      const userDate = new Date(u.createdAt);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return userDate.getMonth() === lastMonth && userDate.getFullYear() === lastMonthYear;
    }).length;
    const usersChange = lastMonthUsers > 0
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100
      : 0;

    // Calculate order change (today vs yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= today;
    }).length;
    const yesterdayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= yesterday && orderDate < today;
    }).length;
    const ordersChange = yesterdayOrders > 0
      ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100
      : 0;

    return {
      totalSales: completedOrders.length,
      totalRevenue,
      revenueChange,
      orderCount: orders.length,
      newOrders: thisMonthOrders.length,
      ordersChange,
      customerCount: users.length,
      totalUsers: users.length,
      usersChange,
      averageOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
      salesGrowth: revenueChange,
      orderGrowth: ordersChange,
      customerGrowth: usersChange,
      cancelledOrders: orders.filter(o => o.status === "cancelled").length,
      pendingOrders: orders.filter(o => o.status === "pending").length,
      conversionRate: 0, // Would need analytics data for this
    };
  }
});

export const getMonthlySales = query({
  args: { year: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const targetYear = args.year || new Date().getFullYear();

    // Get all orders for the target year
    const orders = await ctx.db.query("orders").collect();

    // Initialize monthly data with zeros
    const monthlyData = hebrewMonths.map((month, index) => ({
      name: month,
      value: 0,
      month: index,
    }));

    // Aggregate orders by month
    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      if (orderDate.getFullYear() === targetYear && order.status === "completed") {
        const month = orderDate.getMonth();
        monthlyData[month].value += order.total;
      }
    }

    return monthlyData;
  }
});

/**
 * Get available years for sales data based on orders
 */
export const getAvailableYears = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const years = new Set<number>();

    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      years.add(orderDate.getFullYear());
    }

    // If no orders, return current year
    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }

    // Return sorted array (descending - newest first)
    return Array.from(years).sort((a, b) => b - a);
  }
});

/**
 * Global search across products, orders, and users.
 * Admin-only query.
 * Uses prefix search with Convex search indexes.
 */
export const globalSearch = adminQuery({
  args: { 
    query: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    const limit = (args.limit as number | undefined) || 10;
    const searchQuery = (args.query as string).trim();
    
    if (!searchQuery) {
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

    // Search products (Hebrew and English)
    const productsHe = await ctx.db
      .query("products")
      .withSearchIndex("search_he", (q) => 
        q.search("productNameHe", searchQuery)
      )
      .take(limit);
      
    const productsEn = await ctx.db
      .query("products")
      .withSearchIndex("search_en", (q) => 
        q.search("productName", searchQuery)
      )
      .take(limit);
    
    // Combine and deduplicate products
    const productMap = new Map();
    [...productsHe, ...productsEn].forEach(p => {
      if (!productMap.has(p._id)) {
        productMap.set(p._id, p);
      }
    });
    const products = Array.from(productMap.values()).slice(0, limit);

    // Search orders by customer email
    const orders = await ctx.db
      .query("orders")
      .withSearchIndex("search_orders", (q) => 
        q.search("customerEmail", searchQuery)
      )
      .take(limit);

    // Search users by name
    const users = await ctx.db
      .query("users")
      .withSearchIndex("search_users", (q) => 
        q.search("name", searchQuery)
      )
      .take(limit);
    
    // Also try exact email match for users
    const usersByEmail = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", searchQuery))
      .take(limit);

    // Combine and deduplicate users
    const userMap = new Map();
    [...users, ...usersByEmail].forEach(u => {
      if (!userMap.has(u._id)) {
        userMap.set(u._id, u);
      }
    });
    const allUsers = Array.from(userMap.values()).slice(0, limit);

    // Search categories (if query is short enough for exact match)
    let categories: any[] = [];
    if (searchQuery.length <= 50) {
      const allCategories = await ctx.db.query("categories").collect();
      categories = allCategories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.nameHe && c.nameHe.includes(searchQuery)) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, limit);
    }

    const searchTime = (Date.now() - startTime) / 1000;

    return {
      products,
      orders,
      users: allUsers,
      categories,
      counts: {
        total: products.length + orders.length + allUsers.length + categories.length,
        products: products.length,
        orders: orders.length,
        users: allUsers.length,
        categories: categories.length,
      },
      searchTime,
    };
  }
});
