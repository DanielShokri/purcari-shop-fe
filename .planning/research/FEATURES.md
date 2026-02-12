# Feature Landscape: Analytics Dashboard

**Domain:** E-commerce Analytics (Wine Shop)
**Researched:** February 12, 2026

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Page view tracking | Basic web analytics standard | Low | Track page loads with URL, timestamp |
| DAU/MAU metrics | Standard engagement measurement | Medium | Requires aggregation component |
| Product view counts | E-commerce essential | Low | Track product page visits |
| Sales/conversion metrics | Business-critical | Medium | Orders, revenue, conversion rate |
| Traffic sources | Where visitors come from | Medium | Referrer, UTM parameters |
| Time-series charts | Visual trend analysis | Low | Recharts already configured |
| Top products | Most viewed/purchased | Low | Simple aggregation query |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Real-time dashboard | Live updates without refresh | Low | Convex subscriptions built-in |
| Wine-specific metrics | Category performance, vintage tracking | Medium | Leverage wine schema fields |
| Cohort retention | Customer return behavior | High | Requires cohort analysis logic |
| Funnel visualization | Checkout drop-off points | Medium | Track checkout steps |
| Admin notifications | Alerts for anomalies | Low | Reuse existing notification system |
| RTL-first analytics | Hebrew-native reporting | Low | Already RTL UI |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Custom SQL queries | Not possible in Convex | Use Convex query patterns + aggregations |
| Real-time raw event stream | Too much data, not useful | Aggregate first, then display |
| User-level activity feed | Privacy concern, low value | Keep aggregates only |
| Predictive analytics | Overkill for current scale | Focus on descriptive analytics |
| A/B testing framework | Premature complexity | Add when you have significant traffic |
| Data export to CSV | Use Convex dashboard for now | Defer until requested |

## Feature Dependencies

```
Event Tracking (trackEvent mutation)
  ├── Daily Views Aggregate
  │   └── Views Time-series Chart
  ├── Active Users Aggregate
  │   ├── DAU/WAU/MAU Cards
  │   └── User Growth Chart
  ├── Product View Events
  │   └── Top Products Table
  └── Order Completion Events
      ├── Conversion Rate Metric
      └── Revenue Chart
```

## MVP Recommendation

Prioritize:
1. **Page view tracking** - Foundation for everything
2. **Daily view aggregation** - Simple time-series chart
3. **Product view counter** - Per-product view counts
4. **Order conversion tracking** - Revenue + conversion rate
5. **DAU/MAU metrics** - User engagement snapshot

Defer:
- **Cohort retention**: High complexity, wait for user base growth
- **Funnel analysis**: Useful but requires multiple checkout steps tracked
- **Traffic attribution**: Important for marketing but secondary to core metrics

## Wine-Specific Analytics

Given this is a wine shop, consider tracking:

| Metric | Why Valuable | Implementation |
|--------|--------------|----------------|
| Views by wine type | Red vs White vs Rosé popularity | Filter by `wineType` field |
| Vintage interest | Which years are trending | Group by `vintage` field |
| Region popularity | Moldavian vs other regions | Filter by `region` field |
| Price range views | Budget vs premium interest | Bucket by `price` ranges |

## Sources

- E-commerce Analytics Best Practices: UXCam, WebFX 2025 guides (MEDIUM confidence)
- Convex patterns: Official docs and Stack articles (HIGH confidence)
