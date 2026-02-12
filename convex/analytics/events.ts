import { mutation } from "../_generated/server";
import { v } from "convex/values";
import {
  dailyViewsAggregate,
  activeUsersAggregate,
  productViewsAggregate,
} from "./aggregates";

/**
 * Track an analytics event
 * This mutation records the event and updates all relevant aggregates
 */
export const trackEvent = mutation({
  args: {
    event: v.string(),
    properties: v.optional(v.any()),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.session?.userId;
    const timestamp = Date.now();

    // Insert the raw event
    const eventDoc = await ctx.db.insert("analyticsEvents", {
      userId: userId || undefined,
      anonymousId: args.anonymousId,
      event: args.event,
      properties: args.properties || {},
      timestamp: timestamp.toString(),
    });

    // Get the inserted document for aggregate updates
    const doc = await ctx.db.get("analyticsEvents", eventDoc);
    if (!doc) throw new Error("Failed to retrieve inserted event");

    // Update all aggregates (each has its own filtering logic)
    // dailyViews: only tracks page_viewed events
    // activeUsers: tracks all events for unique user counting
    // productViews: only tracks product_viewed events
    try {
      await dailyViewsAggregate.insertIfDoesNotExist(ctx, doc);
      await activeUsersAggregate.insertIfDoesNotExist(ctx, doc);
      await productViewsAggregate.insertIfDoesNotExist(ctx, doc);
    } catch (error) {
      console.error("Error updating aggregates:", error);
      throw error;
    }

    return eventDoc;
  },
});

/**
 * Identify an anonymous user after they log in
 * This can be used to merge anonymous activity with user account
 */
export const identifyUser = mutation({
  args: {
    anonymousId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new Error("User must be logged in to identify");
    }

    // Find all events with this anonymousId and update them with userId
    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_userId", (q) => q.eq("userId", undefined))
      .collect();

    const anonymousEvents = events.filter(
      (e) => e.anonymousId === args.anonymousId
    );

    for (const event of anonymousEvents) {
      await ctx.db.patch(event._id, { userId });
    }

    return { updated: anonymousEvents.length };
  },
});
