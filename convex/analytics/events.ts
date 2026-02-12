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
      timestamp: timestamp,
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
 * Alias for trackEvent - matches plan naming convention
 * Global tracking mutation for all analytics events
 */
export const track = mutation({
  args: {
    event: v.string(),
    properties: v.optional(v.any()),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.session?.userId;
    const timestamp = Date.now();

    const eventDoc = await ctx.db.insert("analyticsEvents", {
      userId: userId || undefined,
      anonymousId: args.anonymousId,
      event: args.event,
      properties: args.properties || {},
      timestamp: timestamp,
    });

    const doc = await ctx.db.get("analyticsEvents", eventDoc);
    if (!doc) throw new Error("Failed to retrieve inserted event");

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
 * Identify an anonymous user after they log in (Identity Stitching)
 * Links all anonymous guest events to the authenticated user.
 * Uses the optimized by_anon_id index for efficient lookup.
 */
export const identifyUser = mutation({
  args: {
    anonymousId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      return { linked: 0 };
    }

    // Use the by_anon_id index for efficient lookup of anonymous events
    const guestEvents = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_anon_id", (q) => q.eq("anonymousId", args.anonymousId))
      .filter((q) => q.eq(q.field("userId"), undefined))
      .collect();

    // Batch update all anonymous events to link them to the user
    for (const event of guestEvents) {
      await ctx.db.patch(event._id, { userId });
    }

    return { linked: guestEvents.length };
  },
});

/**
 * Alias for identifyUser - matches plan naming convention
 * Identity stitching: links anonymous guest events to authenticated user
 */
export const linkIdentity = mutation({
  args: { anonymousId: v.string() },
  handler: async (ctx, args) => {
    const userId = ctx.session?.userId;
    if (!userId) return { linked: 0 };

    const guestEvents = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_anon_id", (q) => q.eq("anonymousId", args.anonymousId))
      .filter((q) => q.eq(q.field("userId"), undefined))
      .collect();

    for (const event of guestEvents) {
      await ctx.db.patch(event._id, { userId });
    }
    return { linked: guestEvents.length };
  },
});

export const migrateTimestamps = mutation({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("analyticsEvents").collect();
    let updated = 0;
    for (const event of events) {
      if (typeof event.timestamp === "string") {
        await ctx.db.patch(event._id, {
          timestamp: Number(event.timestamp),
        });
        updated++;
      }
    }
    return { updated };
  },
});
