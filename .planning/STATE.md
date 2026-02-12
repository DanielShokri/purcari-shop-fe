# Project State: Purcari Wine E-commerce

**Last updated:** February 12, 2026 (11:24 UTC)

---

## Current Position

**Active phase:** Phase 01 - Analytics Infrastructure (in progress)
**Current plan:** 01-analytics-02 (ready to execute)
**Plans completed:** 1 of 4

**Current blockers:**
- None

**Recently completed:**
- Plan 01-analytics-01: Aggregate component setup
  - @convex-dev/aggregate@0.2.1 installed
  - convex.config.ts created with three aggregate instances
  - convex/analytics/index.ts module structure established

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
- [ ] Set up TableAggregate instances (next plan)
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

1. Execute plan 01-analytics-02: TableAggregate instances and tracking setup
2. Continue through remaining plans (01-03, 01-04) sequentially

