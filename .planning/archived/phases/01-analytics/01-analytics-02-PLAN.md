---
phase: 01-analytics
plan: 02
type: execute
wave: 2
depends_on:
  - 01-analytics-01
files_modified:
  - convex/analytics/aggregates.ts
  - convex/analytics/index.ts
  - convex/_generated/api.d.ts
autonomous: true
must_haves:
  truths:
    - "TableAggregate instances are created for dailyViews, activeUsers, and productViews"
    - "Date bucketing utilities exist for daily/weekly/monthly aggregation"
    - "Aggregates are properly typed with Convex data model"
    - "Aggregates can be imported by mutations and queries"
  artifacts:
    - path: "convex/analytics/aggregates.ts"
      provides: "TableAggregate instances and date utilities"
      exports:
        - "dailyViewsAggregate"
        - "activeUsersAggregate"
        - "productViewsAggregate"
        - "getDayKey"
        - "getWeekKey"
        - "getMonthKey"
    - path: "convex/analytics/index.ts"
      provides: "Module exports"
      contains: "export * from './aggregates'"
  key_links:
    - from: "convex/analytics/aggregates.ts"
      to: "convex/convex.config.ts"
      via: "components reference"
    - from: "trackEvent mutation"
      to: "dailyViewsAggregate.insert()"
      via: "aggregate update call"
---

<objective>
Set up TableAggregate instances that provide the foundation for efficient analytics queries. Define time-series key utilities for date-based aggregation.

Purpose: The aggregate components configured in Plan 01 need TypeScript instances that define how to extract keys from documents and what values to aggregate. This plan creates those instances with proper typing for our data model.

Output: Three TableAggregate instances (dailyViews, activeUsers, productViews) and date utility functions ready for use in mutations and queries.
</objective>

<execution_context>
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-analytics/01-analytics-01-SUMMARY.md
@.planning/research/ARCHITECTURE.md
@.planning/research/PITFALLS.md
@convex/convex.config.ts
@convex/schema.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create date bucketing utilities</name>
  <files>convex/analytics/aggregates.ts</files>
  <action>
Create `convex/analytics/aggregates.ts` with date utility functions for time-series aggregation:

```typescript
import { components } from "./_generated/api";
import { TableAggregate } from "@convex-dev/aggregate";
import type { DataModel } from "./_generated/dataModel";

/**
 * Get YYYY-MM-DD string for a timestamp (UTC)
 * Used for daily aggregation buckets
 */
export function getDayKey(timestamp: number = Date.now()): string {
  const date = new Date(timestamp);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Get YYYY-W## string for a timestamp (UTC)
 * Used for weekly aggregation buckets
 */
export function getWeekKey(timestamp: number = Date.now()): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  // Get ISO week number
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  return `${year}-W${weekNum.toString().padStart(2, "0")}`;
}

/**
 * Get YYYY-MM string for a timestamp (UTC)
 * Used for monthly aggregation buckets
 */
export function getMonthKey(timestamp: number = Date.now()): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Get start of day timestamp (UTC)
 */
export function getStartOfDay(timestamp: number = Date.now()): number {
  const date = new Date(timestamp);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get end of day timestamp (UTC)
 */
export function getEndOfDay(timestamp: number = Date.now()): number {
  const date = new Date(timestamp);
  date.setUTCHours(23, 59, 59, 999);
  return date.getTime();
}
```

These utilities provide consistent date bucketing for time-series aggregations. Using UTC ensures consistent behavior across timezones.
  </action>
  <verify>
Test date functions compile and produce expected output:
npx tsc --noEmit convex/analytics/aggregates.ts
  </verify>
  <done>
Date utility functions are defined with proper UTC handling
  </done>
</task>

<task type="auto">
  <name>Task 2: Create dailyViews TableAggregate instance</name>
  <files>convex/analytics/aggregates.ts</files>
  <action>
Add the dailyViews TableAggregate instance to `convex/analytics/aggregates.ts`:

```typescript
/**
 * Aggregate for daily page view counts
 * Key: YYYY-MM-DD date string
 * Value: count of views for that day
 */
export const dailyViewsAggregate = new TableAggregate<{
  Key: string; // YYYY-MM-DD
  DataModel: DataModel;
  TableName: "analyticsEvents";
}>(components.dailyViews, {
  sortKey: (event) => {
    // Only aggregate page_viewed events
    if (event.event !== "page_viewed") return null;
    return getDayKey(Number(event.timestamp));
  },
  sumValue: () => 1, // Each event counts as 1 view
});
```

This aggregate maintains a count of page views per day. The sortKey function filters for `page_viewed` events only and buckets them by day. Events with other names are ignored (return null).

Note: The `components.dailyViews` reference comes from the convex.config.ts setup in Plan 01.
  </action>
  <verify>
TypeScript compilation:
npx tsc --noEmit convex/analytics/aggregates.ts
  </verify>
  <done>
dailyViewsAggregate is defined with proper typing and configuration
  </done>
</task>

<task type="auto">
  <name>Task 3: Create activeUsers TableAggregate instance</name>
  <files>convex/analytics/aggregates.ts</files>
  <action>
Add the activeUsers TableAggregate instance to `convex/analytics/aggregates.ts`:

```typescript
/**
 * Aggregate for active user tracking (DAU/WAU/MAU)
 * Key: [date, userId] tuple for unique user per day
 * Value: 1 (unique user count)
 * 
 * This allows counting unique users per day, week, or month
 * by using bounds with date prefixes
 */
export const activeUsersAggregate = new TableAggregate<{
  Key: [string, string]; // [YYYY-MM-DD, userId or anonymousId]
  DataModel: DataModel;
  TableName: "analyticsEvents";
}>(components.activeUsers, {
  sortKey: (event) => {
    // Track any user activity (any event type)
    const userId = event.userId || event.anonymousId;
    if (!userId) return null;
    return [getDayKey(Number(event.timestamp)), userId];
  },
  sumValue: () => 1,
});
```

This aggregate uses a composite key of [date, userId] to track unique users per day. The sumValue of 1 means we can count unique active users. Using both userId and anonymousId ensures we capture both authenticated and anonymous users.

The composite key enables efficient queries like:
- Count unique users for a specific day
- Count unique users across a date range
  </action>
  <verify>
TypeScript compilation:
npx tsc --noEmit convex/analytics/aggregates.ts
  </verify>
  <done>
activeUsersAggregate is defined with composite [date, userId] key
  </done>
</task>

<task type="auto">
  <name>Task 4: Create productViews TableAggregate instance</name>
  <files>convex/analytics/aggregates.ts</files>
  <action>
Add the productViews TableAggregate instance to `convex/analytics/aggregates.ts`:

```typescript
/**
 * Aggregate for per-product view counts
 * Key: [date, productId] tuple for product views per day
 * Value: count of views for that product on that day
 */
export const productViewsAggregate = new TableAggregate<{
  Key: [string, string]; // [YYYY-MM-DD, productId]
  DataModel: DataModel;
  TableName: "analyticsEvents";
}>(components.productViews, {
  sortKey: (event) => {
    // Only aggregate product_viewed events
    if (event.event !== "product_viewed") return null;
    // Extract productId from event properties
    const productId = event.properties?.productId;
    if (!productId || typeof productId !== "string") return null;
    return [getDayKey(Number(event.timestamp)), productId];
  },
  sumValue: () => 1,
});
```

This aggregate tracks product-specific views with a composite key of [date, productId]. This enables:
- Views per product per day
- Total views per product across date ranges
- Top products by view count

The properties field from analyticsEvents is used to store the productId. Events without a productId in properties are ignored.
  </action>
  <verify>
TypeScript compilation:
npx tsc --noEmit convex/analytics/aggregates.ts
  </verify>
  <done>
productViewsAggregate is defined with composite [date, productId] key
  </done>
</task>

<task type="auto">
  <name>Task 5: Update analytics module index exports</name>
  <files>convex/analytics/index.ts</files>
  <action>
Update `convex/analytics/index.ts` to export the aggregates:

```typescript
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

// Events will be exported from events.ts (created in next plan)
// Queries will be exported from queries.ts (created in later plan)
```

This makes all aggregate instances and utilities available to other parts of the codebase through the analytics module.
  </action>
  <verify>
TypeScript compilation:
npx tsc --noEmit convex/analytics/index.ts
  </verify>
  <done>
All aggregate exports are properly defined in index.ts
  </done>
</task>

</tasks>

<verification>
After completing all tasks:
1. Run `npx convex dev` to generate updated _generated/api.d.ts with component types
2. Verify `convex/analytics/aggregates.ts` compiles without errors
3. Check that all three TableAggregate instances are properly typed
4. Confirm exports in `convex/analytics/index.ts`
</verification>

<success_criteria>
- convex/analytics/aggregates.ts exists with three TableAggregate instances
- Date utility functions (getDayKey, getWeekKey, getMonthKey) are implemented
- All aggregates have proper TypeScript typing with DataModel
- convex/analytics/index.ts exports all aggregates and utilities
- TypeScript compilation passes without errors
- Convex generates updated types after configuration changes
</success_criteria>

<output>
After completion, create `.planning/phases/01-analytics/01-analytics-02-SUMMARY.md` documenting:
- Aggregate instances created and their purposes
- Date bucketing strategy
- Key structure for each aggregate type
</output>
