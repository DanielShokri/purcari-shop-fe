---
phase: notification-mutations
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - convex/notifications.ts
autonomous: true

must_haves:
  truths:
    - "Admin can create notifications of type INVENTORY with stock quantity data"
    - "Admin can create notifications of type USER_ACTION with user details"
    - "Admin can create notifications of type PAYMENT with transaction info"
    - "Admin can create notifications of type PROMOTION with campaign details"
    - "Admin can create notifications of type PRICE_CHANGE with product price data"
    - "Admin can create notifications of type SYSTEM_ERROR with error details"
    - "Each mutation validates required fields and timestamps automatically"
    - "Notifications can optionally include custom icons and metadata"
  artifacts:
    - path: convex/notifications.ts
      provides: "6 new mutation functions for creating notifications"
      contains: "createInventoryAlert|createUserActionNotification|createPaymentNotification|createPromotionNotification|createPriceChangeNotification|createSystemErrorNotification"
      min_lines: 50
  key_links:
    - from: convex/notifications.ts
      to: convex/schema.ts
      via: "Uses notification table definition"
      pattern: "db.insert\\(\"notifications\""
    - from: convex/notifications.ts
      to: packages/shared-types/src/index.ts
      via: "Uses NotificationType enum for type checking"
      pattern: "type:.*inventory|user_action|payment"
---

<objective>
Create 6 specialized mutation functions in convex/notifications.ts to easily create notifications for each new type (INVENTORY, USER_ACTION, PAYMENT, PROMOTION, PRICE_CHANGE, SYSTEM_ERROR) with type-specific fields and validation.

Purpose: Enable consistent, validated notification creation across the backend (orders, inventory, payment systems)
Output: Ready-to-use mutation functions with proper validation and metadata support
</objective>

<execution_context>
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@convex/notifications.ts
@convex/schema.ts
@packages/shared-types/src/index.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add inventory alert mutation with optional product metadata</name>
  <files>convex/notifications.ts</files>
  <action>
Add after the markAllAsRead mutation:

```typescript
/**
 * Create an inventory alert notification
 * Used when product stock falls below threshold
 */
export const createInventoryAlert = mutation({
  args: {
    userId: v.id("users"),
    productId: v.optional(v.id("products")),
    productName: v.string(),
    quantity: v.number(),
    threshold: v.optional(v.number()),
    customIcon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const title = "הודעת מלאי נמוך";
    const message = `${args.productName} - נשאר בעד ${args.quantity} יחידות${
      args.threshold ? ` (סף: ${args.threshold})` : ""
    }`;

    await ctx.db.insert("notifications", {
      userId: args.userId,
      title,
      message,
      type: "inventory",
      icon: args.customIcon || "warehouse",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },
});
```

This creates Hebrew notifications for low stock with:
- Product name and remaining quantity
- Optional threshold value
- Custom icon support (defaults to "warehouse")
- Auto-timestamps
  </action>
  <verify>
grep -A 15 "export const createInventoryAlert" convex/notifications.ts
  </verify>
  <done>createInventoryAlert mutation added with product metadata and validation</done>
</task>

<task type="auto">
  <name>Task 2: Add user action mutation for registrations and account events</name>
  <files>convex/notifications.ts</files>
  <action>
Add after createInventoryAlert:

```typescript
/**
 * Create a user action notification
 * Used for user registration, login, account changes, etc.
 */
export const createUserActionNotification = mutation({
  args: {
    userId: v.id("users"),
    actionType: v.string(), // e.g., "registration", "login", "password_reset"
    userName: v.string(),
    actionDetails: v.optional(v.string()),
    customIcon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actionLabels: Record<string, string> = {
      registration: "משתמש חדש הרשם",
      login: "כניסה למערכת",
      password_reset: "איפוס סיסמה",
      account_updated: "פרטי חשבון עודכנו",
    };

    const title = actionLabels[args.actionType] || "פעולת משתמש";
    const message = `${args.userName}${args.actionDetails ? ` - ${args.actionDetails}` : ""}`;

    await ctx.db.insert("notifications", {
      userId: args.userId,
      title,
      message,
      type: "user_action",
      icon: args.customIcon || "person_add",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },
});
```

This creates notifications for user events with:
- Action type mapping (registration, login, password reset, etc.)
- User name and optional details
- Hebrew titles based on action type
- Custom icon support (defaults to "person_add")
  </action>
  <verify>
grep -A 20 "export const createUserActionNotification" convex/notifications.ts
  </verify>
  <done>createUserActionNotification mutation added with action type mapping</done>
</task>

<task type="auto">
  <name>Task 3: Add payment notification mutation with transaction details</name>
  <files>convex/notifications.ts</files>
  <action>
Add after createUserActionNotification:

```typescript
/**
 * Create a payment notification
 * Used for successful/failed payments, refunds, chargebacks
 */
export const createPaymentNotification = mutation({
  args: {
    userId: v.id("users"),
    paymentStatus: v.string(), // "success", "failed", "refunded", "pending"
    orderId: v.optional(v.string()),
    amount: v.number(),
    method: v.optional(v.string()), // "card", "paypal", "bank_transfer"
    transactionId: v.optional(v.string()),
    customIcon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const statusLabels: Record<string, { title: string; icon: string }> = {
      success: { title: "תשלום בוצע בהצלחה", icon: "payment" },
      failed: { title: "תשלום נכשל", icon: "payment_cancel" },
      refunded: { title: "החזר כספי", icon: "money_off" },
      pending: { title: "תשלום ממתין", icon: "hourglass_empty" },
    };

    const status = statusLabels[args.paymentStatus] || statusLabels.pending;
    const orderText = args.orderId ? ` הזמנה #${args.orderId}` : "";
    const methodText = args.method ? ` דרך ${args.method}` : "";
    const message = `${args.amount}₪${orderText}${methodText}`;

    await ctx.db.insert("notifications", {
      userId: args.userId,
      title: status.title,
      message,
      type: "payment",
      icon: args.customIcon || status.icon,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },
});
```

This creates payment notifications with:
- Status-specific titles and icons (success, failed, refunded, pending)
- Amount, order ID, payment method
- Optional transaction ID
- Custom icon support
- Currency formatting (₪)
  </action>
  <verify>
grep -A 25 "export const createPaymentNotification" convex/notifications.ts
  </verify>
  <done>createPaymentNotification mutation added with payment status mapping</done>
</task>

<task type="auto">
  <name>Task 4: Add promotion notification mutation for campaigns and sales</name>
  <files>convex/notifications.ts</files>
  <action>
Add after createPaymentNotification:

```typescript
/**
 * Create a promotion notification
 * Used for campaign launches, sales, discount activations
 */
export const createPromotionNotification = mutation({
  args: {
    userId: v.id("users"),
    promotionType: v.string(), // "campaign", "flash_sale", "discount", "limited_time"
    promotionName: v.string(),
    discount: v.optional(v.string()), // e.g., "20%", "₪50"
    validUntil: v.optional(v.string()), // ISO date string
    customIcon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const typeLabels: Record<string, string> = {
      campaign: "קמפיין חדש",
      flash_sale: "מבצע הבזק",
      discount: "הנחה חדשה",
      limited_time: "הצעה זמנית",
    };

    const title = typeLabels[args.promotionType] || "קמפיין חדש";
    const discountText = args.discount ? ` - הנחה של ${args.discount}` : "";
    const validUntilText = args.validUntil
      ? ` (תוקף עד ${new Date(args.validUntil).toLocaleDateString("he-IL")})`
      : "";
    const message = `${args.promotionName}${discountText}${validUntilText}`;

    await ctx.db.insert("notifications", {
      userId: args.userId,
      title,
      message,
      type: "promotion",
      icon: args.customIcon || "sell",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },
});
```

This creates promotion notifications with:
- Promotion type mapping (campaign, flash_sale, discount, limited_time)
- Discount percentage or amount
- Validity dates with Hebrew formatting
- Custom icon support (defaults to "sell")
  </action>
  <verify>
grep -A 25 "export const createPromotionNotification" convex/notifications.ts
  </verify>
  <done>createPromotionNotification mutation added with promotion type mapping</done>
</task>

<task type="auto">
  <name>Task 5: Add price change notification mutation for product updates</name>
  <files>convex/notifications.ts</files>
  <action>
Add after createPromotionNotification:

```typescript
/**
 * Create a price change notification
 * Used when product prices change, sales begin/end
 */
export const createPriceChangeNotification = mutation({
  args: {
    userId: v.id("users"),
    productId: v.optional(v.id("products")),
    productName: v.string(),
    oldPrice: v.number(),
    newPrice: v.number(),
    changeType: v.optional(v.string()), // "price_up", "price_down", "sale_started", "sale_ended"
    customIcon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const difference = args.newPrice - args.oldPrice;
    const percentChange = ((difference / args.oldPrice) * 100).toFixed(1);

    const changeTypeLabels: Record<string, string> = {
      price_up: "עלייה במחיר",
      price_down: "הנחה או ירידה במחיר",
      sale_started: "מבצע החל",
      sale_ended: "מבצע הסתיים",
    };

    const changeLabel = changeTypeLabels[args.changeType || "price_up"] || "שינוי מחיר";
    const title = `${changeLabel} - ${args.productName}`;
    
    const directionEmoji = difference > 0 ? "⬆️" : "⬇️";
    const message = `${directionEmoji} ₪${args.oldPrice} → ₪${args.newPrice} (${percentChange > 0 ? "+" : ""}${percentChange}%)`;

    await ctx.db.insert("notifications", {
      userId: args.userId,
      title,
      message,
      type: "price_change",
      icon: args.customIcon || "trending_up",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },
});
```

This creates price change notifications with:
- Change type mapping (price_up, price_down, sale_started, sale_ended)
- Old and new prices
- Percentage change calculation
- Directional emoji indicator (⬆️⬇️)
- Hebrew type labels
- Custom icon support (defaults to "trending_up")
  </action>
  <verify>
grep -A 25 "export const createPriceChangeNotification" convex/notifications.ts
  </verify>
  <done>createPriceChangeNotification mutation added with price comparison</done>
</task>

<task type="auto">
  <name>Task 6: Add system error notification mutation for critical issues</name>
  <files>convex/notifications.ts</files>
  <action>
Add after createPriceChangeNotification:

```typescript
/**
 * Create a system error notification
 * Used for critical system failures, service issues
 */
export const createSystemErrorNotification = mutation({
  args: {
    userId: v.id("users"),
    errorType: v.string(), // "payment_service", "database", "email_service", "api_error"
    errorMessage: v.string(),
    severity: v.optional(v.string()), // "critical", "high", "medium"
    affectedService: v.optional(v.string()),
    customIcon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const severityLabels: Record<string, string> = {
      critical: "🔴 שגיאה קריטית",
      high: "🟠 שגיאה חמורה",
      medium: "🟡 בעיה במערכת",
    };

    const title =
      severityLabels[args.severity || "high"] ||
      severityLabels.high;
    
    const serviceText = args.affectedService
      ? ` - ${args.affectedService}`
      : "";
    const message = `${args.errorMessage}${serviceText}`;

    await ctx.db.insert("notifications", {
      userId: args.userId,
      title,
      message,
      type: "system_error",
      icon: args.customIcon || "bug_report",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },
});
```

This creates system error notifications with:
- Severity levels (critical, high, medium)
- Severity emojis (🔴🟠🟡)
- Error message and affected service
- Type-specific error labels
- Custom icon support (defaults to "bug_report")
  </action>
  <verify>
grep -A 20 "export const createSystemErrorNotification" convex/notifications.ts
  </verify>
  <done>createSystemErrorNotification mutation added with severity mapping</done>
</task>

</tasks>

<verification>
After all tasks complete, verify:
1. All 6 mutation functions exist in convex/notifications.ts
2. Each mutation has proper args validation
3. Each mutation creates Hebrew titles/messages
4. Each mutation uses correct notification type
5. Each mutation includes optional custom icon support
6. No TypeScript errors in the file
7. Functions follow the same pattern as existing mutations
</verification>

<success_criteria>
- [ ] All 6 new mutations added to convex/notifications.ts
- [ ] Each mutation has type-specific args validation
- [ ] Each mutation creates proper Hebrew titles and messages
- [ ] Each mutation supports optional custom icons
- [ ] Each mutation sets isRead: false and createdAt: auto
- [ ] All mutations use correct notification type from enum
- [ ] File has no TypeScript errors
- [ ] Mutations are exported and ready to use
</success_criteria>

<output>
After completion, create `.planning/phases/notification-mutations/01-notification-mutations-SUMMARY.md` with:
- List of 6 mutation functions added
- Function signatures and args
- Usage examples for each type
- Integration guide for backend systems
- Next steps for error handling
</output>
