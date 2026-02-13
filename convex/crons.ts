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
  internal.analytics.events.pruneOldEvents as any
);

export default crons;
