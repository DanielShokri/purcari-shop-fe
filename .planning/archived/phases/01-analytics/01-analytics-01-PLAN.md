---
phase: 01-analytics
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - convex/convex.config.ts
  - convex/analytics/index.ts
autonomous: true
must_haves:
  truths:
    - "@convex-dev/aggregate package is installed in the project"
    - "convex.config.ts exists with aggregate component configured"
    - "Three aggregate components are defined: dailyViews, activeUsers, productViews"
    - "npm install completes without errors"
  artifacts:
    - path: "convex/convex.config.ts"
      provides: "Aggregate component configuration"
      contains: "defineApp, aggregate component usage"
    - path: "convex/analytics/index.ts"
      provides: "Analytics module exports"
      contains: "export statements"
  key_links:
    - from: "convex.config.ts"
      to: "@convex-dev/aggregate"
      via: "npm package import"
---

<objective>
Install and configure the @convex-dev/aggregate component to enable efficient O(log N) aggregations for analytics metrics.

Purpose: Convex doesn't support COUNT(*) queries because they require O(N) table scans. The aggregate component maintains BTree indexes for efficient counts and sums, which is essential for a scalable analytics dashboard.

Output: Installed package, configured convex.config.ts, and aggregate component instances ready for use.
</objective>

<execution_context>
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/research/STACK.md
@.planning/research/ARCHITECTURE.md
@package.json
@convex/schema.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install @convex-dev/aggregate package</name>
  <files>package.json</files>
  <action>
Install the @convex-dev/aggregate package in the root of the monorepo:

```bash
npm install @convex-dev/aggregate
```

This package provides the aggregate component for efficient COUNT, SUM, and time-series aggregations in Convex. According to the research, this is the official Convex solution for analytics aggregations and prevents O(N) table scans.

Verify installation by checking that package.json includes the dependency.
  </action>
  <verify>
npm list @convex-dev/aggregate --depth=0
# Should show: @convex-dev/aggregate@0.2.1 (or latest)
  </verify>
  <done>
Package @convex-dev/aggregate is installed and listed in package.json dependencies
  </done>
</task>

<task type="auto">
  <name>Task 2: Create convex.config.ts with aggregate definitions</name>
  <files>convex/convex.config.ts</files>
  <action>
Create a new file `convex/convex.config.ts` that configures the aggregate component with three instances:

```typescript
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
```

Each aggregate instance maintains its own BTree index for efficient lookups. The names correspond to different metric types:
- dailyViews: Time-series data for page views per day
- activeUsers: User activity for DAU/WAU/MAU calculations
- productViews: Product-specific view counts

Note: This file is in the convex/ directory, not convex/analytics/.
  </action>
  <verify>
TypeScript compilation check:
npx tsc --noEmit convex/convex.config.ts

The file should compile without errors.
  </verify>
  <done>
convex.config.ts exists with three aggregate components defined (dailyViews, activeUsers, productViews)
  </done>
</task>

<task type="auto">
  <name>Task 3: Create analytics module index file</name>
  <files>convex/analytics/index.ts</files>
  <action>
Create `convex/analytics/index.ts` as the module entry point. This file will eventually export all analytics functions. For now, create the file structure:

```typescript
// Analytics module exports
// This file exports all analytics-related functions from the convex/analytics directory

// Aggregates will be exported from aggregates.ts (created in next plan)
// Events will be exported from events.ts (created in next plan)
// Queries will be exported from queries.ts (created in later plan)

export {};
```

This sets up the module structure for the analytics system. Future plans will populate this file with actual exports.
  </action>
  <verify>
File exists and compiles:
npx tsc --noEmit convex/analytics/index.ts
  </verify>
  <done>
convex/analytics/index.ts exists with proper module structure
  </done>
</task>

</tasks>

<verification>
After completing all tasks:
1. Run `npm list @convex-dev/aggregate` to verify package installation
2. Check that `convex/convex.config.ts` exists and contains three aggregate definitions
3. Verify `convex/analytics/index.ts` is created
4. Run `npx convex dev` (or check types) to ensure configuration is valid
</verification>

<success_criteria>
- @convex-dev/aggregate package is installed (visible in package.json)
- convex/convex.config.ts exists with dailyViews, activeUsers, and productViews aggregates
- convex/analytics/index.ts module entry point is created
- No TypeScript errors in new files
</success_criteria>

<output>
After completion, create `.planning/phases/01-analytics/01-analytics-01-SUMMARY.md` documenting:
- Package versions installed
- Aggregate component configuration
- Any issues encountered during setup
</output>
