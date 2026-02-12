# Project Roadmap: Purcari Wine E-commerce

**Vision:** A modern, RTL Hebrew-first e-commerce platform for Purcari wines with real-time analytics dashboard

---

## Phase Overview

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 01 | **Analytics Infrastructure** | Ready to plan | 4 plans |

---

## Active Phase

### Phase 01: Analytics Infrastructure

**Goal:** Implement scalable analytics system with @convex-dev/aggregate for real-time dashboard metrics

**Why now:** Dashboard exists but shows stubbed data. Need event tracking pipeline for business insights.

**Success criteria:**
- [ ] Page views tracked and aggregated daily
- [ ] Product view counts per product
- [ ] DAU/WAU/MAU metrics calculated efficiently
- [ ] Dashboard displays real data from aggregates
- [ ] No unbounded table scans in production

**Dependencies:**
- Existing analyticsEvents table (✅ exists in schema.ts)
- Existing Analytics.tsx dashboard UI (✅ exists)
- @convex-dev/aggregate component (to be installed)

**Plans:**

**Plan 01-01:** Install and Configure Aggregate Component
- Install `@convex-dev/aggregate` package
- Create `convex.convex.config.ts` with aggregate definitions
- Configure dailyViews, activeUsers, and productViews aggregates
- **Files modified:** `package.json`, `convex/convex.config.ts` (new)

**Plan 01-02:** Create Aggregate Infrastructure
- Set up TableAggregate instances in `convex/analytics/aggregates.ts`
- Define time-series keys for date-based aggregation
- Create helper functions for date bucketing
- **Files modified:** `convex/analytics/aggregates.ts` (new), `convex/analytics/index.ts` (new)

**Plan 01-03:** Implement Event Tracking System
- Create `trackEvent` mutation for recording analytics events
- Implement page view tracking hook for storefront
- Add product view tracking on product pages
- Set up anonymousId generation and persistence
- **Files modified:** `convex/analytics/events.ts` (new), `apps/storefront/hooks/useAnalytics.ts` (new)

**Plan 01-04:** Wire Up Dashboard Queries
- Replace stubbed analytics queries with aggregate-based implementations
- Connect `getSummary`, `getViewsSeries`, `getNewUsersSeries` to real data
- Add top products query based on view counts
- Test dashboard displays real-time data
- **Files modified:** `convex/analytics.ts`, `convex/analytics/queries.ts` (new)

**Research reference:**
- @.planning/research/SUMMARY.md
- @.planning/research/STACK.md
- @.planning/research/ARCHITECTURE.md
- @.planning/research/PITFALLS.md

**Deferred ideas:**
- Funnel analysis (checkout steps tracking)
- Cohort retention metrics
- Traffic source attribution
- Integration with external analytics (GA4)
- Real-time event streaming

---

## Completed Phases

*None yet*

---

## Future Phases (Backlog)

*To be planned based on business priorities*

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-12 | Use @convex-dev/aggregate component | Prevents O(N) scans; officially supported by Convex |
| 2026-02-12 | Implement internal analytics alongside GA4 | Keep real-time dashboard in-house; use GA4 for marketing attribution |
| 2026-02-12 | Track anonymous users | Wine purchases often happen in same session; need session tracking |

