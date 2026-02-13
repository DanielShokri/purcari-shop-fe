# Project Roadmap: Purcari Wine E-commerce

**Vision:** A modern, RTL Hebrew-first e-commerce platform for Purcari wines with real-time analytics dashboard

---

## Phase Overview

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 01 | **Analytics Infrastructure** | ✓ Complete | 4/4 |
| 02 | **Fix TypeScript Errors** | ○ Planned | 5/5 |

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

## In Progress

### Phase 02: Fix TypeScript Errors

**Status:** ○ Planned (February 13, 2026)

**Goal:** Fix all 37 TypeScript compilation errors across the monorepo to ensure type safety and enable clean builds.

**Deliverables:**
- Clean shared-types without duplicate declarations
- Fixed Convex backend functions with proper types
- Fixed admin hooks and pages with proper useQuery patterns
- Fixed React components with proper type narrowing
- Fixed CartRuleEditor form type consistency

**Plans:**
- [ ] 02-01-PLAN.md — Fix shared-types (duplicate declarations, bigint types)
- [ ] 02-02-PLAN.md — Fix Convex backend (ctx.session, unknown types, bigint conversions)
- [ ] 02-03-PLAN.md — Fix admin hooks and pages (useQuery args, Id types)
- [ ] 02-04-PLAN.md — Fix React components (type narrowing, optional props)
- [ ] 02-05-PLAN.md — Fix CartRuleEditor form types

**Success criteria:**
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] All 37 errors resolved
- [ ] No type regressions introduced

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

