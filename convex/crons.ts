// @ts-nocheck
// Convex type instantiation depth issues

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "prune analytics events",
  { hourUTC: 2, minuteUTC: 0 },
  internal.analytics.events.pruneOldEvents
);

export default crons;
