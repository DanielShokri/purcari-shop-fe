# Domain Pitfalls: Analytics Implementation

**Domain:** E-commerce Analytics with Convex
**Researched:** February 12, 2026

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Aggregate Corruption via Dashboard Edits

**What goes wrong:** Editing data in the Convex dashboard UI doesn't trigger hooks, so aggregates get out of sync with actual data

**Why it happens:** Dashboard edits bypass application code; triggers only fire from mutations

**Consequences:** Analytics show incorrect numbers; data inconsistency; hard to detect

**Prevention:** 
- Never edit analytics tables directly in dashboard
- Use admin API endpoints for corrections
- Document this restriction for team members

**Detection:** Regular data audits; compare aggregate counts to raw event counts

### Pitfall 2: Unbounded Event Table Queries

**What goes wrong:** Querying all analytics events in dashboard queries (`ctx.db.query("analyticsEvents").collect()`)

**Why it happens:** Developer assumes small data volume; copies pattern from other tables

**Consequences:** Query times out or uses excessive compute; dashboard fails to load

**Prevention:**
- Always use aggregates for counts/sums
- Paginate raw event queries with `.take(N)`
- Use time-based filters with indexes

**Detection:** Monitor query latency in Convex dashboard; set alerts

### Pitfall 3: Missing Trigger Updates

**What goes wrong:** Adding events but forgetting to update aggregates in mutation code

**Why it happens:** Multiple aggregates to update; easy to forget one; no compile-time checking

**Consequences:** Aggregate counts drift from reality; dashboard shows stale/incorrect data

**Prevention:**
- Use convex-helpers triggers library for automatic synchronization
- Write unit tests that verify aggregate updates
- Code review checklist for analytics mutations

**Detection:** Compare aggregate values to raw counts periodically

## Moderate Pitfalls

### Pitfall 1: Event Naming Inconsistency

**What goes wrong:** Different event names for same action (e.g., `product_view` vs `product_viewed`)

**Prevention:** Define strict event taxonomy; use TypeScript enums; document conventions

### Pitfall 2: Anonymous/User ID Confusion

**What goes wrong:** Not handling both authenticated and anonymous users; double-counting users

**Prevention:** Always use `anonymousId` for unauthenticated; merge on login

### Pitfall 3: Timezone Handling

**What goes wrong:** Using local time vs UTC; "daily" stats shift based on server location

**Prevention:** Store all timestamps in UTC; convert to local time for display only

### Pitfall 4: Session Definition Ambiguity

**What goes wrong:** Unclear what constitutes a "session"; inconsistent DAU calculation

**Prevention:** Define session timeout (e.g., 30 minutes inactivity); document calculation method

## Minor Pitfalls

### Pitfall 1: Chart Re-rendering Performance

**What goes wrong:** Recharts re-renders on every data update causing jank

**Prevention:** Use `useMemo` for chart data; implement data debouncing

### Pitfall 2: Missing Index on Timestamp

**What goes wrong:** No index on `timestamp` field; time-range queries scan all events

**Prevention:** Already fixed in your schema (`.index("by_timestamp", ["timestamp"])` exists)

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Event Tracking | Privacy/GDPR violations | Anonymize IPs; add consent banner; document data retention |
| Event Tracking | Race conditions on anonymousId | Generate ID once, store in localStorage |
| Aggregations | Forgetting triggers | Use convex-helpers triggers library |
| Aggregations | Existing data migration | Use @convex-dev/migrations to backfill |
| Dashboard | RTL chart issues | Set `style={{ direction: 'ltr' }}` on chart containers (already done) |
| Dashboard | Loading states | Handle undefined from useQuery properly (already done) |

## Recovery Procedures

### If Aggregates Get Corrupted

1. Stop event recording temporarily
2. Clear affected aggregates
3. Run migration to backfill from raw events
4. Resume event recording

### If Event Volume Explodes

1. Implement event sampling (record 10% of events)
2. Increase aggregation granularity (hourly instead of per-event)
3. Archive old raw events to cold storage

## Sources

- Convex Stack Article on Aggregates: https://stack.convex.dev/efficient-count-sum-max-with-the-aggregate-component (HIGH confidence)
- Convex Community Discord discussions on pitfalls (MEDIUM confidence)
