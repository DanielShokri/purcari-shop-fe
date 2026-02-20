# Architecture Patterns for Analytics

**Domain:** E-commerce Analytics (Convex-based)
**Researched:** February 12, 2026

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Event Tracker  │  │ Analytics Hooks │  │  Dashboard UI   │ │
│  │   (trackEvent)  │  │  (useAnalytics) │  │  (Charts/Stats) │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
└───────────┼───────────────────┼───────────────────┼──────────┘
            │                   │                   │
            ▼                   │                   │
┌───────────────────────────┐  │                   │
│    trackEvent mutation    │  │                   │
│  (inserts analyticsEvents)│  │                   │
└─────────────┬─────────────┘  │                   │
              │                │                   │
              ▼                ▼                   ▼
┌──────────────────────────────────────────────────────────────┐
│                     CONVEX BACKEND                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐│
│  │  analyticsEvents│  │ @convex-dev/    │  │  Aggregated    ││
│  │   (raw events)  │  │ aggregate       │  │   Metrics      ││
│  │                 │  │  (BTree index)  │  │  (real-time)   ││
│  └─────────────────┘  └─────────────────┘  └────────────────┘│
│         ▲                      ▲                           │
│         │                      │                           │
│         └──────────────────────┘                           │
│              (Triggers auto-update aggregates)             │
└──────────────────────────────────────────────────────────────┘
```

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Event Tracker | Capture user interactions (page views, clicks) | trackEvent mutation |
| trackEvent Mutation | Insert raw events into analyticsEvents table | analyticsEvents table, aggregate triggers |
| Aggregate Component | Maintain efficient counters and indexes | analyticsEvents via triggers |
| Analytics Hooks | React hooks for querying aggregated data | Dashboard queries |
| Dashboard Queries | Return aggregated metrics for charts | Aggregate component |
| Dashboard UI | Visualize metrics with Recharts | Analytics hooks |

## Data Flow

### Recording an Event

```
User Action → trackEvent() → analyticsEvents.insert()
                                    ↓
                              Trigger fires
                                    ↓
                    aggregate.insert() / update()
```

### Reading Dashboard Data

```
Dashboard Component → useQuery(api.analytics.getSummary)
                                    ↓
                         aggregate.count() / sum()
                                    ↓
                              Real-time update
```

## Patterns to Follow

### Pattern 1: Event Sourcing with Pre-aggregation

**What:** Store every event, but also maintain pre-computed aggregates for fast queries

**Why:** Raw events provide audit trail and flexibility; aggregates provide performance

**Implementation:**
```typescript
// In mutation
const eventId = await ctx.db.insert("analyticsEvents", {
  event: "product_viewed",
  userId,
  productId,
  timestamp: Date.now(),
});

// Trigger automatically updates aggregate
await dailyViewsAggregate.insert(ctx, { 
  key: getDayKey(), 
  sumValue: 1 
});
```

### Pattern 2: Namespaced Aggregates

**What:** Use different aggregate instances for different metric types

**Why:** Isolates data, improves performance, easier reasoning

**Implementation:**
```typescript
// convex.config.ts
app.use(aggregate, { name: "dailyPageViews" });
app.use(aggregate, { name: "dailyActiveUsers" });
app.use(aggregate, { name: "productViewCounts" });
```

### Pattern 3: Time-Series with Composite Keys

**What:** Use [date, dimension] as sort key for flexible time-series queries

**Why:** Enables filtering by date range AND category

**Implementation:**
```typescript
const productViewsByDate = new TableAggregate<{
  Key: [string, string]; // [date, productId]
  DataModel: DataModel;
  TableName: "analyticsEvents";
}>(components.productViews, {
  sortKey: (event) => [event.date, event.productId],
  sumValue: () => 1,
});

// Query views for specific product in date range
const views = await productViewsByDate.sum(ctx, {
  bounds: { 
    prefix: ["2026-02"], // February 2026
    lower: { key: ["2026-02-01", productId] },
    upper: { key: ["2026-02-28", productId] }
  }
});
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Query All Events

**What:** `ctx.db.query("analyticsEvents").collect()` in dashboard queries

**Why bad:** Scans entire table; fails at scale; performance degrades linearly

**Instead:** Use aggregates for counts; paginate raw events only for detailed views

### Anti-Pattern 2: Manual Counter Updates

**What:** Separate counter table updated manually in each mutation

**Why bad:** Easy to forget updates; race conditions; inconsistency

**Instead:** Use triggers + Aggregate component for automatic synchronization

### Anti-Pattern 3: Dashboard Direct Table Edits

**What:** Editing analyticsEvents in Convex dashboard UI

**Why bad:** Triggers don't fire; aggregates become out of sync; corrupted data

**Instead:** Only edit through API; use migrations for corrections

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Event writes | Direct insert | Direct insert (Convex handles throughput) | Consider batching if needed |
| Dashboard reads | Aggregate queries | Aggregate queries | Aggregate queries (O(log N)) |
| Data retention | Keep all events | Keep all events | Archive old events; keep aggregates |
| Real-time updates | All events | All events | Sample or aggregate before streaming |

## File Structure Recommendation

```
convex/
├── analytics/
│   ├── events.ts           # Event recording mutations
│   ├── aggregates.ts       # Aggregate component setup
│   ├── queries.ts          # Dashboard data queries
│   └── triggers.ts         # Database triggers
├── convex.config.ts        # Component configuration
└── schema.ts               # analyticsEvents table (exists)
```

## Sources

- Convex Aggregate Component: https://stack.convex.dev/efficient-count-sum-max-with-the-aggregate-component (HIGH confidence)
- Convex Triggers: https://github.com/get-convex/convex-helpers (HIGH confidence)
