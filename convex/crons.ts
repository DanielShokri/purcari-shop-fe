// @ts-nocheck
// Type instantiation depth issues with Convex internal API references
// This file compiles correctly at runtime but TypeScript cannot verify it

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Prune old analytics events daily at 2:00 AM UTC
 * Deletes events older than 180 days to manage database costs
 */
crons.daily(
  "prune analytics events",
  { hourUTC: 2, minuteUTC: 0 },
  internal.analytics.events.pruneOldEvents
);

export default crons;
