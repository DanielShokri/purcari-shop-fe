---
phase: "01"
plan: "05"
type: "feature"
autonomous: true
wave: "1"
depends_on: []
subsystem: "analytics"
tags: ["analytics", "identity-stitching", "event-tracking", "guest-to-user"]
context: "EXTENDS .planning/phases/01-analytics/01-analytics-04-SUMMARY.md"
---

# Phase 1 Plan 5: Convex-Native Analytics & Identity Stitching Implementation

## Objective

Implement a 100% Convex-native analytics system with identity stitching capabilities. This enables real-time business intelligence, abandoned cart recovery, and personalized user experiences without relying on external third-party cookies or high-latency external platforms. The system will bridge the "Identity Gap" by linking anonymous guest browsing history to authenticated User IDs once they log in.

## Context

The current analytics infrastructure captures events but lacks identity resolution. Users browsing anonymously before login have disconnected event histories, preventing accurate attribution, funnel analysis, and personalized recommendations. This plan extends the existing analytics system with:

- **Enhanced Schema Design**: Optimized indexes for event queries and identity stitching operations
- **Identity Resolution**: Automatic linking of anonymous events to authenticated users
- **Unified Tracking API**: Consistent event tracking across authenticated and anonymous users
- **Standardized Event Taxonomy**: Business-critical events with required properties
- **Data Governance**: Pruning policies and security guidelines

## Success Criteria

- [ ] Analytics events table supports identity stitching with efficient indexes
- [ ] Anonymous browsing history links to user profile after authentication
- [ ] Frontend team has unified hook for all tracking operations
- [ ] Standard event set implemented across key user journeys
- [ ] 180-day data retention policy implemented via cron job
- [ ] No sensitive data (PII, passwords, tokens) tracked in event properties
- [ ] Event tracking latency < 50ms average

## Technical Approach

### Enhanced Schema with Identity Support

The existing `analyticsEvents` table will be extended with optimized indexes for identity stitching queries. The composite index `by_anon_id` enables efficient batch updates when linking anonymous events to users.

```typescript
// convex/schema.ts additions
analyticsEvents: defineTable({
  userId: v.optional(v.id("users")),
  anonymousId: v.optional(v.string()),
  event: v.string(),
  properties: v.any(),
  timestamp: v.string(),
})
  .index("by_event_timestamp", ["event", "timestamp"])
  .index("by_userId_event", ["userId", "event"])
  .index("by_anon_id", ["anonymousId"])
```

**Why these indexes matter:**

1. `by_event_timestamp`: Optimizes time-range queries for dashboards and reports. Dashboard queries aggregate events by date ranges frequently.

2. `by_userId_event`: Enables user-level event sequences for personalization and attribution. Required for building user profiles from behavior.

3. `by_anon_id`: Critical for identity stitching batch operations. Without this index, linking guest history to users would require full table scans (prohibited by Convex).

### Identity Stitching Architecture

The stitching mutation handles the identity resolution transition. When a guest authenticates, we batch-update all their anonymous events to include the new userId. This preserves behavioral continuity while maintaining GDPR compliance (data remains attributed to the same individual).

**Implementation considerations:**

- **Batch processing**: Uses Convex's efficient `collect()` + `patch()` pattern for batch updates
- **Idempotency**: The filter ensures only events without userId get updated (prevents double-linking)
- **Audit trail**: Mutation returns count of linked events for debugging

### Frontend Identity Management

The `useAnalytics` hook manages the dual-identity state (anonymousId + authenticated userId). Key design decisions:

- **localStorage persistence**: Anonymous ID survives browser sessions (30-day TTL recommended)
- **Automatic identification**: `identify()` called on login/register completion
- **Graceful degradation**: System works without anonymousId if localStorage unavailable
- **UUID generation**: Uses UUID v4 for collision-resistant anonymous identifiers

### Standard Event Taxonomy

Standardized events enable consistent analytics across the application. Each event includes required properties for business intelligence.

**Event naming convention**: past tense verbs (`product_viewed`, `cart_item_added`) for consistency

| Event | Trigger | Required Properties | Business Value |
|-------|---------|---------------------|----------------|
| `product_viewed` | Product page mount | productId, name, price, category, variant | Conversion funnel, product performance |
| `cart_item_added` | Add to cart click | productId, quantity, price, cartTotal | Abandoned cart recovery, upsell analysis |
| `checkout_started` | Checkout button click | cartId, itemCount, totalValue | Funnel conversion, checkout friction |
| `order_completed` | Payment success | orderId, total, items, paymentMethod | Revenue attribution, LTV calculation |
| `search_performed` | Search form submit | query, resultsCount, filtersApplied | Search relevance, inventory gaps |
| `page_viewed` | Route change | path, referrer, scrollDepth | Traffic sources, content engagement |
| `wishlist_item_added` | Wishlist click | productId, price, name | Product interest signals |
| `filter_applied` | Filter selection | filterType, filterValues, resultCount | Faceted search optimization |

### Data Governance Framework

**180-Day Retention Policy**: Analytics data grows exponentially. A cron job will periodically delete events older than 180 days.

```typescript
// convex/cron.ts
export const pruneOldEvents = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 180);
    
    let deleted = 0;
    for await (const event of ctx.db
      .query("analyticsEvents")
      .filter((q) => q.lt(q.field("timestamp"), cutoff.toISOString()))) {
      await ctx.db.delete(event._id);
      deleted++;
    }
    return { deleted };
  },
});
```

**Security constraints:**

- Never track: passwords, tokens, API keys, session data
- Avoid tracking: full PII (email ok, phone number no), credit card numbers
- Required: userId or anonymousId on every event (validation in mutation)
- Optional: properties field for contextual data (product info, UI state)

## Implementation Tasks

### Task 1: Schema Update with Identity Indexes

**Type:** `feature`
**TDD:** `false`

**Behavior:**

Update `convex/schema.ts` to add the `by_anon_id` index to the `analyticsEvents` table. The index enables efficient identity stitching queries.

**Implementation:**

```typescript
// convex/schema.ts
analyticsEvents: defineTable({
  userId: v.optional(v.id("users")),
  anonymousId: v.optional(v.string()),
  event: v.string(),
  properties: v.any(),
  timestamp: v.string(),
})
  .index("by_event_timestamp", ["event", "timestamp"])
  .index("by_userId_event", ["userId", "event"])
  .index("by_anon_id", ["anonymousId"])
```

**Verification:**

- Convex dev server accepts schema update
- Index appears in `npx convex schema show`
- Query with `withIndex("by_anon_id")` returns expected results

**Done Criteria:**

- [ ] `by_anon_id` index visible in schema
- [ ] Index query returns events for known anonymousId
- [ ] No duplicate index names

---

### Task 2: Global Tracking Mutation

**Type:** `feature`
**TDD:** `false`

**Behavior:**

Create `convex/analytics.ts` with the `track` mutation. This mutation handles all incoming analytics events, capturing both authenticated and anonymous user context.

**Implementation:**

```typescript
// convex/analytics.ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const track = mutation({
  args: {
    event: v.string(),
    properties: v.any(),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("analyticsEvents", {
      userId: userId ?? undefined,
      anonymousId: args.anonymousId,
      event: args.event,
      properties: args.properties,
      timestamp: new Date().toISOString(),
    });
  },
});
```

**Verification:**

- Test mutation via Convex dashboard
- Event appears in analyticsEvents table
- userId populated when authenticated, undefined when anonymous
- anonymousId captured when provided

**Done Criteria:**

- [ ] Track mutation created in convex/analytics.ts
- [ ] Events insert successfully with correct field population
- [ ] Authenticated user events have userId
- [ ] Anonymous events have anonymousId

---

### Task 3: Identity Stitching Mutation

**Type:** `feature`
**TDD:** `false`

**Behavior:**

Add `linkIdentity` mutation to `convex/analytics.ts`. This mutation links anonymous guest events to an authenticated user when they log in.

**Implementation:**

```typescript
// Add to convex/analytics.ts
export const linkIdentity = mutation({
  args: { anonymousId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { linked: 0 };

    const guestEvents = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_anon_id", (q) => q.eq("anonymousId", args.anonymousId))
      .filter((q) => q.eq(q.field("userId"), undefined))
      .collect();

    for (const event of guestEvents) {
      await ctx.db.patch(event._id, { userId });
    }
    return { linked: guestEvents.length };
  },
});
```

**Verification:**

- Create anonymous events with known anonymousId
- Call linkIdentity after authentication
- Verify all events now have userId populated
- Count returned matches number of updated events

**Done Criteria:**

- [ ] linkIdentity mutation implemented
- [ ] Anonymous events get userId after linking
- [ ] Already-linked events excluded (filter works)
- [ ] Mutation returns accurate linked count

---

### Task 4: Frontend useAnalytics Hook

**Type:** `feature`
**TDD:** `false`

**Behavior:**

Create `hooks/useAnalytics.ts` with unified tracking API. This hook manages identity state and provides simple `track()` and `identify()` methods.

**Implementation:**

```typescript
// hooks/useAnalytics.ts
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { v4 as uuidv4 } from 'uuid';

export const useAnalytics = () => {
  const logEvent = useMutation(api.analytics.track);
  const linkId = useMutation(api.analytics.linkIdentity);

  const track = (event: string, properties: Record<string, any> = {}) => {
    let anonId = localStorage.getItem("convex_anon_id");
    if (!anonId) {
      anonId = uuidv4();
      localStorage.setItem("convex_anon_id", anonId);
    }
    logEvent({ event, properties, anonymousId: anonId });
  };

  const identify = async () => {
    const anonId = localStorage.getItem("convex_anon_id");
    if (anonId) await linkId({ anonymousId: anonId });
  };

  return { track, identify };
};
```

**Verification:**

- Import hook in React component
- Call track() with event name and properties
- Verify event appears in Convex dashboard
- After login, call identify() and verify events update

**Done Criteria:**

- [ ] useAnalytics hook created
- [ ] Anonymous ID persists in localStorage
- [ ] Track calls log events to Convex
- [ ] Identify links anonymous events to user

---

### Task 5: Implement Standard Event Tracking

**Type:** `feature`
**TDD:** `false`

**Behavior:**

Wire up the standard event set to the appropriate frontend components. Implement tracking in the specified locations with required properties.

**Implementation:**

1. **Product page (product_viewed):**

```typescript
// ProductPage.tsx
const { track } = useAnalytics();

useEffect(() => {
  track('product_viewed', {
    productId: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    variant: product.variant
  });
}, [product]);
```

2. **Add to cart button (cart_item_added):**

```typescript
// AddToCartButton.tsx
const handleClick = () => {
  addToCart(product);
  track('cart_item_added', {
    productId: product.id,
    quantity: 1,
    price: product.price,
    cartTotal: cart.total
  });
};
```

3. **Checkout button (checkout_started):**

```typescript
// CartPage.tsx
const handleCheckout = () => {
  navigate('/checkout');
  track('checkout_started', {
    cartId: cart.id,
    itemCount: cart.items.length,
    totalValue: cart.total
  });
};
```

4. **Payment success page (order_completed):**

```typescript
// OrderConfirmation.tsx
useEffect(() => {
  if (order) {
    track('order_completed', {
      orderId: order.id,
      total: order.total,
      items: order.items,
      paymentMethod: order.paymentMethod
    });
  }
}, [order]);
```

5. **Search results (search_performed):**

```typescript
// SearchResults.tsx
const handleSearch = (query: string) => {
  const results = performSearch(query);
  track('search_performed', {
    query,
    resultsCount: results.length,
    filtersApplied: currentFilters
  });
};
```

**Verification:**

- Browse product page, verify product_viewed event
- Add item to cart, verify cart_item_added event
- Click checkout, verify checkout_started event
- Complete purchase, verify order_completed event
- Perform search, verify search_performed event

**Done Criteria:**

- [ ] Product page fires product_viewed with all required properties
- [ ] Add to cart fires cart_item_added
- [ ] Checkout button fires checkout_started
- [ ] Payment success fires order_completed
- [ ] Search fires search_performed with query and results

---

### Task 6: 180-Day Data Retention Cron Job

**Type:** `feature`
**TDD:** `false`

**Behavior:**

Create cron job to prune analytics events older than 180 days. This prevents unbounded data growth.

**Implementation:**

```typescript
// convex/cron.ts
import { internalMutation } from "./_generated/server";

export const pruneOldEvents = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 180);
    
    let deleted = 0;
    for await (const event of ctx.db
      .query("analyticsEvents")
      .filter((q) => q.lt(q.field("timestamp"), cutoff.toISOString()))) {
      await ctx.db.delete(event._id);
      deleted++;
    }
    return { deleted };
  },
});
```

Add to `convex.config.ts`:

```typescript
export default defineConfig({
  cron: {
    pruneAnalytics: {
      job: "cron.pruneOldEvents()",
      schedule: "every day at 2am",
    },
  },
});
```

**Verification:**

- Manually trigger prune for testing
- Verify events older than 180 days deleted
- Verify events within  retention period preserved
- Cron scheduled correctly in config

**Done Criteria:**

- [ ] Cron job created for daily pruning
- [ ] Events older than 180 days deleted
- [ ] Events within 180 days preserved
- [ ] Cron schedule configured in convex.config.ts

---

### Task 7: Update Login/Register Forms with Identify

**Type:** `feature`
**TDD:** `false`

**Behavior:**

Update Login and Register components to call `identify()` after successful authentication. This triggers identity stitching for users who browsed anonymously.

**Implementation:**

```typescript
// LoginForm.tsx
const LoginForm = () => {
  const { signIn } = useConvexAuth();
  const { identify } = useAnalytics();
  const router = useRouter();

  const handleSubmit = async (values: LoginValues) => {
    await signIn("password", values);
    await identify();
    router.push("/");
  };

  return <Form onSubmit={handleSubmit}>{/* form fields */}</Form>;
};

// RegisterForm.tsx
const RegisterForm = () => {
  const { signUp } = useConvexAuth();
  const { identify } = useAnalytics();
  const router = useRouter();

  const handleSubmit = async (values: RegisterValues) => {
    await signUp(values);
    await identify();
    router.push("/");
  };

  return <Form onSubmit={handleSubmit}>{/* form fields */}</Form>;
};
```

**Verification:**

- Login as anonymous user (browse first)
- Check analytics events have anonymousId
- Login with credentials
- Verify identify() called in .then() block
- Check previous anonymous events now have userId

**Done Criteria:**

- [ ] Login form calls identify() on success
- [ ] Register form calls identify() on success
- [ ] Anonymous events link to user after auth
- [ ] No double-linking (userId already set events unchanged)

---

## Deviation Protocol

This plan follows the standard deviation rules:

1. **Rule 1 - Auto-fix bugs**: If tracking mutation crashes or returns errors, fix inline
2. **Rule 2 - Auto-add missing functionality**: Add validation for required properties, error handling for edge cases
3. **Rule 3 - Auto-fix blocking issues**: Fix missing imports, type errors, build issues
4. **Rule 4 - Ask about architectural changes**: If schema changes beyond indexes required, pause for decision

## Output Specifications

### Summary File: `01-analytics-05-SUMMARY.md`

Create summary in `.planning/phases/01-analytics/` with:

- **Frontmatter**: phase, plan, subsystem, tags, dependency graph
- **One-liner**: "Convex-native analytics with identity stitching for guest-to-user event attribution"
- **Key files**: Created/modified files list
- **Decisions**: Index selection rationale, event naming convention
- **Deviations**: Any auto-fixes applied
- **Metrics**: Execution time, tasks completed

### State Updates

After summary creation:

1. Advance plan counter via `gsd-tools state advance-plan`
2. Update progress bar via `gsd-tools state update-progress`
3. Record metrics via `gsd-tools state record-metric`
4. Add decisions via `gsd-tools state add-decision`

## Estimated Effort

| Task | Effort |
|------|--------|
| Schema Update | 30 min |
| Tracking Mutation | 45 min |
| Identity Stitching | 45 min |
| Frontend Hook | 1 hour |
| Event Tracking | 2 hours |
| Cron Job | 30 min |
| Login Integration | 1 hour |
| **Total** | **~6 hours** |
