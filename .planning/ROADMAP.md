# Project Roadmap: Purcari Wine E-commerce

**Vision:** A modern, RTL Hebrew-first e-commerce platform for Purcari wines with real-time analytics dashboard

---

## Phase Overview

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 01 | **Analytics Infrastructure** | ✓ Complete | 4/4 |

---

## Completed Phases

### Phase 01: Analytics Infrastructure

**Status:** ✓ Complete (February 12, 2026)

**Goal achieved:** Scalable analytics system with @convex-dev/aggregate for real-time dashboard metrics

**Deliverables:**
- @convex-dev/aggregate component installed and configured
- Three TableAggregate instances: dailyViews, activeUsers, productViews
- Event tracking system with useAnalytics hooks
- Dashboard queries wired to real aggregate data

**Success criteria met:**
- [x] Page views tracked and aggregated daily
- [x] Product view counts per product
- [x] DAU/WAU/MAU metrics calculated efficiently
- [x] Dashboard displays real data from aggregates
- [x] No unbounded table scans in production

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

