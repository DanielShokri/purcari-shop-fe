# Project State: Purcari Wine E-commerce

**Last updated:** February 13, 2026 (13:38 UTC)

---

## Current Position

**Active phase:** Phase 02 - Fix TypeScript Errors (planned)
**Current plan:** 02-02 (ready to execute)
**Plans completed:** 1 of 5

**Current blockers:**
- None

**Recently completed:**
- Plan 02-01: Fix TypeScript Errors in Shared Types
  - Removed duplicate CartRuleType and CartRuleStatus enum declarations
  - Changed Product.quantityInStock and Product.vintage to number (removed bigint)
  - Removed duplicate CartRule interface declaration
  - TypeScript compilation now passes without errors
- Plan 01-analytics-05: Identity Stitching & Standard Event Tracking
  - Added by_anon_id and by_userId_event indexes for efficient identity queries
  - track and linkIdentity mutations for unified tracking API
  - Enhanced useAnalytics hook with identify() function and UUID generation
  - Standard event tracking across storefront (product_viewed, cart_item_added, etc.)
  - 180-day data retention via daily cron job at 2:00 AM UTC
  - AuthForm integration calling identify() after login/registration

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
| Event naming convention | Use past tense: `page_viewed`, `product_viewed`, `cart_item_added` |
| Time bucketing | Daily granularity for MVP; hourly can be added later |
| Anonymous ID storage | localStorage with `convex_anon_id` key |
| Date handling | UTC for all aggregation to ensure consistent timezone behavior |
| Aggregate keys | Composite [date, dimension] keys enable multi-dimensional queries |
| Aggregate query pattern | Use `{ namespace: undefined, bounds: {...} }` for count() API |
| Identity stitching | Link anon events to user on auth via by_anon_id index |
| Data retention | 180 days, pruned daily at 2:00 AM UTC |

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
- [x] Test with real page views
- [x] Identity stitching indexes
- [x] track and linkIdentity mutations
- [x] Standard event tracking across storefront
- [x] 180-day retention cron job
- [x] AuthForm identify() integration

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

1. Phase 02 in progress: Fix TypeScript Errors (1 of 5 plans complete)
2. Continue with Phase 02 Plan 02: Fix remaining TypeScript errors
3. Test shared types integration with storefront and admin packages

---

## Phase 01 Completion Summary

All 5 plans completed:
- Plan 01: Convex aggregate component installation and configuration
- Plan 02: TableAggregate instances with date bucketing utilities
- Plan 03: Event tracking system with automatic page view tracking
- Plan 04: Dashboard queries wired to display real-time data
- Plan 05: Identity stitching, standard event tracking, and data retention

**Result:** Complete analytics infrastructure with identity resolution, event tracking, and 180-day retention.
