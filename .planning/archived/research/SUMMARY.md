# Research Summary: Analytics for Purcari Wine E-commerce

**Domain:** E-commerce Analytics Dashboard
**Researched:** February 12, 2026
**Overall confidence:** HIGH

## Executive Summary

Your Purcari wine e-commerce app already has the foundation for analytics with the `analyticsEvents` table in Convex and an Analytics dashboard page in the admin panel. However, the analytics backend functions are currently stubbed out (returning zeros and empty arrays), and you need a complete event tracking pipeline.

The recommended approach for Convex-based analytics is a two-tier system:
1. **Raw Event Collection**: Store individual user interactions (page views, clicks, purchases) in `analyticsEvents`
2. **Pre-aggregated Metrics**: Use Convex's Aggregate component for efficient real-time counts (DAU, WAU, MAU) without scanning entire tables

This pattern aligns with Convex's design philosophy - no unbounded scans, predictable performance. For e-commerce specifically, you should track: product views, add-to-cart actions, checkout funnel events, and purchase completions. These feed into key metrics like conversion rate, average order value, and customer lifetime value.

## Key Findings

**Stack:** React + Vite + Convex + Chakra UI v3 + Recharts (already in place) + @convex-dev/aggregate (recommended addition)
**Architecture:** Event sourcing with pre-aggregated counters for dashboard metrics
**Critical pitfall:** Forgetting to update aggregates when dashboard editing causes data corruption

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Event Tracking Infrastructure** - Core foundation
   - Addresses: Page views, user sessions, product interactions
   - Avoids: Missing events that can't be recovered later

2. **Pre-aggregated Metrics** - Real-time dashboard
   - Addresses: DAU/WAU/MAU counts, product view counts, conversion metrics
   - Avoids: Scanning entire analyticsEvents table (performance disaster)

3. **Dashboard Visualization** - Already partially built
   - Addresses: Charts, tables, trend analysis
   - Avoids: None - recharts is already integrated

4. **Advanced Analytics** - Future differentiators
   - Addresses: Cohort retention, funnel analysis, A/B testing
   - Avoids: Premature optimization before core metrics work

**Phase ordering rationale:**
- Event tracking MUST come first (data collection is time-sensitive)
- Aggregations MUST come before dashboard at scale (performance)
- Dashboard exists but needs data
- Advanced analytics can be deferred

**Research flags for phases:**
- Phase 1 (Event Tracking): Needs careful event naming taxonomy
- Phase 2 (Aggregations): HIGH priority - use @convex-dev/aggregate component
- Phase 3 (Dashboard): LOW research risk - recharts already configured
- Phase 4 (Advanced): Likely needs deeper research (funnel tracking patterns)

## Current State Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| Schema | ✅ Exists | `analyticsEvents` table defined with proper indexes |
| Backend Queries | ⚠️ Stubbed | Functions return zeros/empty arrays |
| Frontend Dashboard | ✅ Built | Analytics.tsx with recharts, RTL Hebrew UI |
| Event Recording | ❌ Missing | No mutations to insert analytics events |
| Aggregations | ❌ Missing | No @convex-dev/aggregate component installed |

## Recommended Implementation Order

1. Install `@convex-dev/aggregate` component
2. Define pre-aggregated counters (daily views, active users)
3. Create `trackEvent` mutation for recording events
4. Implement frontend event tracking hooks
5. Wire up dashboard queries to real data

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Convex docs + official component |
| Features | HIGH | Industry standard e-commerce patterns |
| Architecture | HIGH | Convex Aggregate component officially supported |
| Pitfalls | MEDIUM | Based on community posts + official warnings |

## Gaps to Address

- Event naming convention needs to be defined (e.g., `product_viewed`, `added_to_cart`)
- GDPR/privacy compliance for analytics tracking (if applicable for Israel market)
- Session tracking logic (anonymousId generation and persistence)
- Data retention policy for raw events (how long to keep individual events vs aggregated data)

## Sources

- Convex Aggregate Component: https://stack.convex.dev/efficient-count-sum-max-with-the-aggregate-component (HIGH confidence)
- Convex Documentation: Context7 Convex library (HIGH confidence)
- E-commerce Analytics Best Practices: Multiple 2025 sources (MEDIUM confidence)
