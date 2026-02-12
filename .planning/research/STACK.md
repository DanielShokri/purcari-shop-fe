# Technology Stack for Analytics

**Project:** Purcari Wine E-commerce
**Researched:** February 12, 2026

## Recommended Stack

### Core Framework (Already in Place)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Convex | ^1.31.7 | Backend, database, real-time queries | Already integrated, reactive subscriptions ideal for live dashboards |
| React | ^18.3.1 | Frontend framework | Already in use |
| Chakra UI v3 | ^3.31.0 | UI components | Already configured with RTL Hebrew support |
| Recharts | ^3.6.0 | Charts and visualizations | Already installed for dashboard |

### Analytics-Specific Additions
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @convex-dev/aggregate | ^0.2.1 | Efficient counts, sums, time-series aggregations | Official Convex component; O(log N) lookups instead of O(N) scans; necessary for scale |
| @convex-dev/migrations | latest | Backfill aggregates for existing data | For populating aggregates with historical events |

### Supporting Patterns
| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| Triggers (convex-helpers) | Auto-update aggregates on CRUD | HIGHLY RECOMMENDED to avoid aggregate corruption |
| Denormalized counters | Daily/weekly view counts | Use Aggregate component instead of manual counters |

## Why @convex-dev/aggregate?

Convex deliberately doesn't offer `SELECT COUNT(*)` because it requires scanning all rows - a performance disaster at scale. The Aggregate component:

1. **Maintains a BTree index** internally for O(log N) lookups
2. **Supports range queries** for time-series data (daily views, weekly active users)
3. **Provides real-time updates** through Convex's reactive subscriptions
4. **Handles high throughput** without locking issues

**Critical:** Without this component, your dashboard will scan the entire `analyticsEvents` table on every page load - failing at scale.

## Installation

```bash
# Install the aggregate component
npm install @convex-dev/aggregate

# Install migrations for backfilling
npm install @convex-dev/migrations

# Install triggers helper (optional but recommended)
npm install convex-helpers
```

## Configuration

Create `convex/convex.config.ts`:

```typescript
import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();

// Define aggregates for different metrics
app.use(aggregate, { name: "dailyViews" });
app.use(aggregate, { name: "activeUsers" });
app.use(aggregate, { name: "productViews" });

export default app;
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Aggregation | @convex-dev/aggregate | Manual counters in separate table | Requires manual synchronization, easy to get out of sync |
| Aggregation | @convex-dev/aggregate | Collect all events in query | O(N) scan - doesn't scale |
| Time-series | Convex aggregates with timestamp key | InfluxDB/TimescaleDB | Adds infrastructure complexity; Convex handles your scale |
| External Analytics | Convex internal | Google Analytics 4 / Mixpanel | Adds third-party dependency, data leaves your system; keep internal for real-time dashboard |

## Hybrid Approach Recommendation

Use **both** internal Convex analytics AND external GA4:
- **Convex analytics**: Real-time dashboard, user-specific insights, order correlation
- **GA4**: Marketing attribution, audience demographics, cross-domain tracking

This gives you best of both worlds - real-time internal metrics + marketing platform integration.

## Sources

- Convex Aggregate Component Docs: https://www.npmjs.com/package/@convex-dev/aggregate (HIGH confidence)
- Convex Stack Article: https://stack.convex.dev/efficient-count-sum-max-with-the-aggregate-component (HIGH confidence)
