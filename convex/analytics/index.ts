// Analytics module exports

// Aggregate instances and utilities
export {
  dailyViewsAggregate,
  activeUsersAggregate,
  productViewsAggregate,
  getDayKey,
  getWeekKey,
  getMonthKey,
  getStartOfDay,
  getEndOfDay,
} from "./aggregates";

// Event tracking mutations
export { trackEvent, track, identifyUser, linkIdentity, migrateTimestamps, pruneOldEvents } from "./events";

// Dashboard queries
export {
  getSummary,
  getViewsSeries,
  getNewUsersSeries,
  getTopProducts,
} from "./queries";
