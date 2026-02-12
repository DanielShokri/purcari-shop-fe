# Project State: Purcari Wine E-commerce

**Last updated:** February 12, 2026

---

## Current Position

**Active phase:** Phase 01 - Analytics Infrastructure (ready to plan)

**Current blockers:**
- None

**Recently completed:**
- Research phase for analytics implementation

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

- [ ] Install @convex-dev/aggregate package
- [ ] Create convex.config.ts with aggregate definitions
- [ ] Set up TableAggregate instances
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

1. Run `/gsd-execute-phase analytics` to begin implementation
2. Follow plans 01-01 through 01-04 sequentially

