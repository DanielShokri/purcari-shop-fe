import { v } from "convex/values";
import { query } from "./_generated/server";
import { adminQuery } from "./authHelpers";

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
    const limit = args.limit || 10;
    const searchQuery = args.query.trim();
    
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
