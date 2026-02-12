import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();

// Aggregate for daily page view counts
app.use(aggregate, { name: "dailyViews" });

// Aggregate for active user tracking (DAU/WAU/MAU)
app.use(aggregate, { name: "activeUsers" });

// Aggregate for per-product view counts
app.use(aggregate, { name: "productViews" });

export default app;
