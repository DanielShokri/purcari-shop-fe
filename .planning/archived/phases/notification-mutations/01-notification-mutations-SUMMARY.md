# Notification Mutations - SUMMARY

## Completion Date
February 15, 2026

## What Was Added

Added **6 specialized mutation functions** to `convex/notifications.ts` for creating notifications of each new type with type-specific fields and validation.

---

## 1. Inventory Alert Mutation

```typescript
createInventoryAlert({
  userId,           // Target admin/user
  productId?,       // Optional product reference
  productName,      // Required: "יין קברנה"
  quantity,         // Required: 5 (remaining units)
  threshold?,       // Optional: 10 (alert threshold)
  customIcon?       // Optional: override icon
})
```

**Creates Hebrew notification:**
- Title: "הודעת מלאי נמוך"
- Message: "יין קברנה - נשאר בעד 5 יחידות (סף: 10)"
- Type: `inventory`
- Icon: `warehouse` (customizable)

**Use cases:**
- Product stock falls below minimum threshold
- Low inventory alerts for managers
- Stock replenishment reminders

---

## 2. User Action Notification

```typescript
createUserActionNotification({
  userId,           // Target user
  actionType,       // "registration" | "login" | "password_reset" | "account_updated"
  userName,         // "דוד כהן"
  actionDetails?,   // Optional extra info
  customIcon?       // Optional: override icon
})
```

**Creates Hebrew notification with action-specific titles:**
- "משתמש חדש הרשם" (registration)
- "כניסה למערכת" (login)
- "איפוס סיסמה" (password_reset)
- "פרטי חשבון עודכנו" (account_updated)

**Type:** `user_action`
**Icon:** `person_add` (customizable)

**Use cases:**
- New user registrations
- Admin logins for security auditing
- Password changes
- Account updates (email, phone, etc.)

---

## 3. Payment Notification

```typescript
createPaymentNotification({
  userId,           // Target user
  paymentStatus,    // "success" | "failed" | "refunded" | "pending"
  orderId?,         // "#123" (order reference)
  amount,           // 250.50 (numeric)
  method?,          // "card" | "paypal" | "bank_transfer"
  transactionId?,   // External transaction ID
  customIcon?       // Optional: override icon
})
```

**Creates Hebrew notification with status-specific titles:**
- "תשלום בוצע בהצלחה" → icon: `payment`
- "תשלום נכשל" → icon: `payment_cancel`
- "החזר כספי" → icon: `money_off`
- "תשלום ממתין" → icon: `hourglass_empty`

**Message format:** "₪250.50 הזמנה #123 דרך card"

**Type:** `payment`

**Use cases:**
- Order payment completion
- Failed payment alerts
- Refund notifications
- Payment method changes

---

## 4. Promotion Notification

```typescript
createPromotionNotification({
  userId,           // Target user
  promotionType,    // "campaign" | "flash_sale" | "discount" | "limited_time"
  promotionName,    // "הנחה על יינות אדומים"
  discount?,        // "20%" or "₪50"
  validUntil?,      // ISO date: "2026-02-28T23:59:59Z"
  customIcon?       // Optional: override icon
})
```

**Creates Hebrew notification with type-specific titles:**
- "קמפיין חדש" (campaign)
- "מבצע הבזק" (flash_sale)
- "הנחה חדשה" (discount)
- "הצעה זמנית" (limited_time)

**Message format:** "הנחה על יינות אדומים - הנחה של 20% (תוקף עד 28 בפברואר, 2026)"

**Type:** `promotion`
**Icon:** `sell` (customizable)

**Use cases:**
- Campaign launches
- Flash sales
- Discount announcements
- Limited-time offers

---

## 5. Price Change Notification

```typescript
createPriceChangeNotification({
  userId,           // Target user
  productId?,       // Optional product reference
  productName,      // "יין קברנה 2020"
  oldPrice,         // 200 (numeric)
  newPrice,         // 220 (numeric)
  changeType?,      // "price_up" | "price_down" | "sale_started" | "sale_ended"
  customIcon?       // Optional: override icon
})
```

**Creates Hebrew notification with type-specific labels:**
- "עלייה במחיר" (price_up)
- "הנחה או ירידה במחיר" (price_down)
- "מבצע החל" (sale_started)
- "מבצע הסתיים" (sale_ended)

**Calculates and displays:**
- Percentage change: (220-200)/200 * 100 = 10%
- Directional emoji: ⬆️ for increases, ⬇️ for decreases
- Message: "⬆️ ₪200 → ₪220 (+10%)"

**Type:** `price_change`
**Icon:** `trending_up` (customizable)

**Use cases:**
- Price adjustments
- Sale start/end notifications
- Dynamic pricing updates
- Bulk price changes

---

## 6. System Error Notification

```typescript
createSystemErrorNotification({
  userId,           // Target admin/user
  errorType,        // "payment_service" | "database" | "email_service" | "api_error"
  errorMessage,     // "כשל בחיבור לשרת התשלומים"
  severity?,        // "critical" | "high" | "medium"
  affectedService?, // "Stripe Gateway" | "Database"
  customIcon?       // Optional: override icon
})
```

**Creates Hebrew notification with severity-specific titles:**
- "🔴 שגיאה קריטית" (critical)
- "🟠 שגיאה חמורה" (high)
- "🟡 בעיה במערכת" (medium)

**Message format:** "כשל בחיבור לשרת התשלומים - Stripe Gateway"

**Type:** `system_error`
**Icon:** `bug_report` (customizable)

**Use cases:**
- Payment gateway failures
- Database connection errors
- Email service failures
- API timeouts
- System maintenance alerts

---

## Common Features

All 6 mutations include:
- ✅ **Type-specific validation** - args properly typed
- ✅ **Hebrew localization** - all titles/messages in Hebrew
- ✅ **Auto-timestamps** - `createdAt: new Date().toISOString()`
- ✅ **Default icons** - semantic icons for each type
- ✅ **Custom icon override** - optional `customIcon` parameter
- ✅ **Read status** - all created as `isRead: false`
- ✅ **Correct type field** - uses proper enum value

---

## Integration Examples

### In Order System
```typescript
// When payment succeeds
await ctx.runMutation(api.notifications.createPaymentNotification, {
  userId: order.customerId,
  paymentStatus: "success",
  orderId: order._id,
  amount: order.total,
  method: "card",
});
```

### In Inventory System
```typescript
// When stock falls low
if (product.quantityInStock < MIN_STOCK_LEVEL) {
  await ctx.runMutation(api.notifications.createInventoryAlert, {
    userId: adminUserId,
    productId: product._id,
    productName: product.productName,
    quantity: product.quantityInStock,
    threshold: MIN_STOCK_LEVEL,
  });
}
```

### In Auth System
```typescript
// When user registers
await ctx.runMutation(api.notifications.createUserActionNotification, {
  userId: newUser._id,
  actionType: "registration",
  userName: newUser.name,
  actionDetails: `from ${signupSource}`,
});
```

### In Pricing System
```typescript
// When product price changes
await ctx.runMutation(api.notifications.createPriceChangeNotification, {
  userId: adminUserId,
  productId: product._id,
  productName: product.productName,
  oldPrice: product.price,
  newPrice: newPrice,
  changeType: newPrice > product.price ? "price_up" : "price_down",
});
```

### In Campaign System
```typescript
// When campaign launches
await ctx.runMutation(api.notifications.createPromotionNotification, {
  userId: adminUserId,
  promotionType: "campaign",
  promotionName: "Purim Special 2026",
  discount: "30%",
  validUntil: "2026-03-15T23:59:59Z",
});
```

### In System Monitoring
```typescript
// When critical error occurs
await ctx.runMutation(api.notifications.createSystemErrorNotification, {
  userId: adminUserId,
  errorType: "payment_service",
  errorMessage: "Payment gateway timeout",
  severity: "critical",
  affectedService: "Stripe API",
});
```

---

## Files Modified

1. **convex/notifications.ts** (+228 lines)
   - Added 6 specialized mutation functions
   - Each with full documentation comments
   - Type-specific args and Hebrew localization

---

## Next Steps

### Phase 2: Error Handling & Logging
- Add error handling wrappers
- Log all notification creation events
- Track notification delivery success/failure

### Phase 3: Bulk Operations
- Create notifications for multiple users
- Batch create from events
- Scheduled notifications

### Phase 4: Notification Preferences
- User opt-in/opt-out for each type
- Frequency settings
- Delivery method preferences

### Phase 5: Webhook Integration
- External system triggers
- Payment gateway webhooks
- Inventory management integration

---

## Testing the Mutations

In the Convex dashboard, test directly:

```typescript
// Test inventory alert
await mutations.notifications.createInventoryAlert({
  userId: "user_123",
  productName: "Cabernet 2020",
  quantity: 3,
  threshold: 10,
})

// Test payment notification
await mutations.notifications.createPaymentNotification({
  userId: "user_123",
  paymentStatus: "success",
  orderId: "order_456",
  amount: 250.50,
})
```

---

## Summary

✅ All 6 mutation functions created and tested
✅ Hebrew localization for all notifications
✅ Type-specific icon defaults
✅ Optional custom icon override
✅ Build passes without errors
✅ Ready for backend integration

**Status:** ✅ COMPLETE - Ready for production integration
