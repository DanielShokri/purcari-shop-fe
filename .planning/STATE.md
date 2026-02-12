# Project State: Purcari Wine E-commerce

**Last updated:** February 12, 2026 (11:48 UTC)

---

## Current Position

**Active phase:** Phase 01 - Analytics Infrastructure (complete)
**Current plan:** 01-analytics-04 (completed)
**Plans completed:** 4 of 4

**Current blockers:**
- None

**Recently completed:**
- Plan 01-analytics-04: Dashboard queries and visualization
  - getSummary query using dailyViewsAggregate and activeUsersAggregate
  - getViewsSeries for time-series chart data (daily/weekly/monthly)
  - getNewUsersSeries for user growth visualization
  - getTopProducts for popular products table
  - Analytics.tsx verified compatible with new data structure
  - Dashboard now displays real-time data from aggregates

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
| Aggregate query pattern | Use `{ namespace: undefined, bounds: {...} }` for count() API |

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
- [x] Create trackEvent mutation
- [x] Implement useAnalytics hook
- [x] Wire up dashboard queries
- [ ] Test with real page views

---

## Context

### Technical Context
- Monorepo with pnpm workspace
- Convex backend with reactive queries
- React + Vite frontend
- Chakra UI v3 with RTL Hebrew support
- Recharts for visualizations
- Analytics system complete with aggregates and real-time dashboard

### Business Context
- Wine e-commerce for Israeli market
- Admin dashboard for store management
- Need visibility into product performance
- Conversion tracking important for ROI

---

## Next Actions

1. Phase 01 complete! Analytics infrastructure is ready
2. Test with real page views:
   - Browse storefront pages
   - Check admin Analytics dashboard for live data
   - Verify metrics update in real-time
3. Consider next phase: Enhanced e-commerce features or marketing tools

---

## Phase 01 Completion Summary

All 4 plans completed:
- Plan 01: Convex aggregate component installation and configuration
- Plan 02: TableAggregate instances with date bucketing utilities
- Plan 03: Event tracking system with automatic page view tracking
- Plan 04: Dashboard queries wired to display real-time data

**Result:** Full analytics infrastructure from event collection to dashboard visualization.
