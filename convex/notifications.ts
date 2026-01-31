import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Admin list - show all notifications for all users (or we could filter for admin)
    // For now, let's keep it simple and return all
    return await ctx.db
      .query("notifications")
      .order("desc")
      .collect();
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return 0;
    
    const dbUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", user.tokenIdentifier))
      .unique();
      
    if (!dbUser) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", dbUser._id))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return;
    
    const dbUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", user.tokenIdentifier))
      .unique();
      
    if (!dbUser) return;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", dbUser._id))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});
