---
phase: notification-types
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/shared-types/src/index.ts
  - convex/schema.ts
  - apps/admin/components/notifications/NotificationItem.tsx
autonomous: true

must_haves:
  truths:
    - "Admin can see notifications with 10+ different types (SUCCESS, INFO, WARNING, ERROR, ORDER, SYSTEM, INVENTORY, USER_ACTION, PAYMENT, PROMOTION)"
    - "Each notification type displays a context-appropriate icon (check_circle for success, shopping_cart for order, etc.)"
    - "Color coding matches notification type (green for success, red for error, orange for warning, purple for order, etc.)"
    - "Icon names can be stored in database and overridden per notification"
  artifacts:
    - path: packages/shared-types/src/index.ts
      provides: "Extended NotificationType enum with 10+ types"
      min_lines: 15
    - path: convex/schema.ts
      provides: "Updated notifications table with icon field"
      contains: "icon: v.optional(v.string())"
    - path: apps/admin/components/notifications/NotificationItem.tsx
      provides: "Icon mapping for all notification types with colors"
      min_lines: 50
  key_links:
    - from: packages/shared-types/src/index.ts
      to: convex/schema.ts
      via: "Type definitions used in schema validation"
      pattern: "NotificationType.*union"
    - from: apps/admin/components/notifications/NotificationItem.tsx
      to: packages/shared-types/src/index.ts
      via: "Component imports and uses NotificationType"
      pattern: "import.*NotificationType"
---

<objective>
Add 6 new notification types to the admin panel's notification system (INVENTORY, USER_ACTION, PAYMENT, PROMOTION, PRICE_CHANGE, SYSTEM_ERROR) with appropriate Material Icons and color-coded styling for each type.

Purpose: Enable richer notification categorization so admins can distinguish between different event types at a glance
Output: Extended notification infrastructure ready for backend to create notifications of new types
</objective>

<execution_context>
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@apps/admin/components/notifications/NotificationItem.tsx
@packages/shared-types/src/index.ts
@convex/schema.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend NotificationType enum with 6 new types</name>
  <files>packages/shared-types/src/index.ts</files>
  <action>
Add 6 new notification types to the NotificationType enum (lines 86-93):
- INVENTORY = 'inventory' — Low stock alerts, restocking notifications
- USER_ACTION = 'user_action' — User registered, logged in, account changes
- PAYMENT = 'payment' — Payment succeeded, failed, or refunded
- PROMOTION = 'promotion' — Sale started, discount activated, campaign updates
- PRICE_CHANGE = 'price_change' — Product price updated, sale began/ended
- SYSTEM_ERROR = 'system_error' — System failures, critical errors, service issues

Keep existing types: SUCCESS, INFO, WARNING, ERROR, ORDER, SYSTEM.

Update the Notification interface (line 387) type field union to include string literals for backwards compatibility:
`type: NotificationType | 'info' | 'warning' | 'error' | 'success' | 'order' | 'system' | 'inventory' | 'user_action' | 'payment' | 'promotion' | 'price_change' | 'system_error';`
  </action>
  <verify>
grep -A 20 "export enum NotificationType" packages/shared-types/src/index.ts | grep -E "(INVENTORY|USER_ACTION|PAYMENT|PROMOTION|PRICE_CHANGE|SYSTEM_ERROR)"
  </verify>
  <done>NotificationType enum contains 12 types: SUCCESS, INFO, WARNING, ERROR, ORDER, SYSTEM, INVENTORY, USER_ACTION, PAYMENT, PROMOTION, PRICE_CHANGE, SYSTEM_ERROR</done>
</task>

<task type="auto">
  <name>Task 2: Update notifications schema to include optional icon field</name>
  <files>convex/schema.ts</files>
  <action>
Add optional icon field to the notifications table (after message field, line 299):
`icon: v.optional(v.string()),`

This allows storing custom Material icon names per notification (e.g., "inventory_2" for inventory alerts). If not provided, the frontend will use the default icon for the notification type.

Keep all existing fields and indexes unchanged.
  </action>
  <verify>
grep -A 10 "notifications: defineTable" convex/schema.ts | grep "icon"
  </verify>
  <done>notifications table includes optional icon field for custom icon overrides</done>
</task>

<task type="auto">
  <name>Task 3: Create icon and color mapping for all 12 notification types</name>
  <files>apps/admin/components/notifications/NotificationItem.tsx</files>
  <action>
Replace the getNotificationStyle function (lines 28-72) to support all 12 notification types with appropriate icons and colors:

SUCCESS (check_circle, green)
INFO (info, blue)
WARNING (warning, amber)
ERROR (error, red)
ORDER (shopping_cart, purple)
SYSTEM (description, gray)
INVENTORY (warehouse, cyan) — Low stock/inventory alerts
USER_ACTION (person_add, indigo) — User registrations, account events
PAYMENT (payment, emerald) — Payment transactions
PROMOTION (sell, yellow) — Sales and promotions
PRICE_CHANGE (trending_up, lime) — Price updates
SYSTEM_ERROR (bug_report, rose) — Critical system errors

For each type, return:
- icon: Material icon name (string)
- iconBg: Background color for light mode (e.g., 'green.100')
- iconBgDark: Background color for dark mode (e.g., 'green.900/30')
- iconColor: Icon color for light mode (e.g., 'green.600')
- iconColorDark: Icon color for dark mode (e.g., 'green.400')

Use semantic color names from Chakra's palette. See existing SUCCESS and ERROR cases for pattern.
  </action>
  <verify>
grep -c "case NotificationType" apps/admin/components/notifications/NotificationItem.tsx
  </verify>
  <done>getNotificationStyle function handles all 12 notification types with unique icons and color schemes</done>
</task>

<task type="auto">
  <name>Task 4: Update NotificationItem to use custom icon if provided</name>
  <files>apps/admin/components/notifications/NotificationItem.tsx</files>
  <action>
In the NotificationItem component (line 88-89), update the icon assignment logic:

Change from:
```
const style = getNotificationStyle(notification.type as NotificationType);
const iconName = notification.icon || style.icon;
```

To ensure custom icons are respected. The logic already supports this (line 88-89 is correct), but verify it's being used:
- If notification.icon is set → use that (database override)
- If notification.icon is not set → use style.icon (default for type)

No code change needed if already correct. Just verify the pattern is in place.

Line 147 uses iconName correctly: `{iconName}`
  </action>
  <verify>
grep -A 5 "const iconName = " apps/admin/components/notifications/NotificationItem.tsx
  </verify>
  <done>NotificationItem correctly prioritizes custom icon from notification data, falls back to type-specific default</done>
</task>

</tasks>

<verification>
After all tasks complete, verify:
1. Run build to ensure no TypeScript errors: `npm run build` (in workspace root)
2. In admin app, check Notifications.tsx renders without errors
3. Inspect a notification element in browser DevTools to see correct icon name from getNotificationStyle
4. Test theme switching (light/dark mode) shows correct icon colors
5. Search codebase for "NotificationType" to ensure no stale references to old enum
</verification>

<success_criteria>
- [ ] NotificationType enum contains all 12 types
- [ ] Notification interface type field accepts all 12 types
- [ ] convex/schema.ts notifications table has icon field
- [ ] getNotificationStyle returns correct icon + colors for all 12 types
- [ ] NotificationItem prioritizes custom icon over default
- [ ] Build passes without TypeScript errors
- [ ] Notifications page renders without console errors
- [ ] Each notification type visually distinct (different icon + color)
</success_criteria>

<output>
After completion, create `.planning/phases/notification-types/01-notification-types-SUMMARY.md` with:
- List of 12 notification types added
- Icon mapping reference table
- Example notification creation for each type
- Next steps: Implement backend notification creation functions
</output>
