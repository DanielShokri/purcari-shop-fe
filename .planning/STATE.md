# Project State: Purcari Wine E-commerce

**Last updated:** February 12, 2026 (11:27 UTC)

---

## Current Position

**Active phase:** Phase 01 - Analytics Infrastructure (in progress)
**Current plan:** 01-analytics-03 (ready to execute)
**Plans completed:** 2 of 4

**Current blockers:**
- None

**Recently completed:**
- Plan 01-analytics-02: TableAggregate instances
  - Date utilities (getDayKey, getWeekKey, getMonthKey) for UTC bucketing
  - dailyViewsAggregate for page view counts
  - activeUsersAggregate with composite [date, userId] key for DAU/WAU/MAU
  - productViewsAggregate with composite [date, productId] key for product analytics
  - All aggregates exported through convex/analytics/index.ts

---

## Decisions

### Locked (non-negotiable)

| Decision | Context | Made |
|----------|---------|------|
| Use @convex-dev/aggregate component | Prevents unbounded table scans | 2026-02-12 |
| Maintain RTL Hebrew UI | Business requirement | Existing |
| Use Convex for all backend | Architecture decision | Existing |

### Claude's Discretion

| Area | Current thinking |
|------|------------------|
| Event naming convention | Use past tense: `page_viewed`, `product_viewed`, `added_to_cart` |
| Time bucketing | Daily granularity for MVP; hourly can be added later |
| Anonymous ID storage | localStorage with 30-minute session timeout |
| Date handling | UTC for all aggregation to ensure consistent timezone behavior |
| Aggregate keys | Composite [date, dimension] keys enable multi-dimensional queries |

### Deferred

| Idea | Reason for deferral |
|------|---------------------|
| GA4 integration | Can be added later without affecting internal dashboard |
| Funnel tracking | Requires checkout flow instrumentation first |
| A/B testing | Not enough traffic to justify complexity |

---

## Pending Todos

- [x] Install @convex-dev/aggregate package
- [x] Create convex.config.ts with aggregate definitions
- [x] Set up TableAggregate instances
- [ ] Create trackEvent mutation
- [ ] Implement useAnalytics hook
- [ ] Wire up dashboard queries
- [ ] Test with real page views

---

## Context

### Technical Context
- Monorepo with pnpm workspace
- Convex backend with reactive queries
- React + Vite frontend
- Chakra UI v3 with RTL Hebrew support
- Recharts for visualizations

### Business Context
- Wine e-commerce for Israeli market
- Admin dashboard for store management
- Need visibility into product performance
- Conversion tracking important for ROI

---

## Next Actions

1. Execute plan 01-analytics-03: Create trackEvent mutation
2. Continue through remaining plans (01-04) sequentially

