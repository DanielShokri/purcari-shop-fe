// Analytics API - re-exports from analytics module
// This file serves as the main entry point for analytics functions

export {
  // Queries
  getSummary,
  getViewsSeries,
  getNewUsersSeries,
  getTopProducts,
  
  // Mutations
  trackEvent,
  track,
  identifyUser,
  linkIdentity,
  migrateTimestamps,
} from "./analytics/index";
