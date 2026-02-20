import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Admin list - show all notifications for all users (or we could filter for admin)
    // For now, let's keep it simple and return all
    return await ctx.db
      .query("notifications")
      .order("desc")
      .collect();
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

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

/**
 * Create an order notification
 * Used when new orders are placed or order status changes
 */
export const createOrderNotification = mutation({
  args: {
    userId: v.id("users"),
    orderNumber: v.number(),
    customerName: v.string(),
    total: v.number(),
    status: v.string(), // "placed", "processing", "shipped", "completed", "cancelled"
    customIcon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const statusLabels: Record<string, { title: string; message: string; icon: string }> = {
      placed: {
        title: "הזמנה חדשה התקבלה",
        message: `הזמנה #${args.orderNumber} מ${args.customerName} - ₪${args.total.toLocaleString("he-IL")}`,
        icon: "shopping_cart",
      },
      processing: {
        title: "הזמנה בעיבוד",
        message: `הזמנה #${args.orderNumber} הועברה לטיפול - ₪${args.total.toLocaleString("he-IL")}`,
        icon: "schedule",
      },
      shipped: {
        title: "הזמנה נשלחה",
        message: `הזמנה #${args.orderNumber} נשלחה ללקוח - ₪${args.total.toLocaleString("he-IL")}`,
        icon: "local_shipping",
      },
      completed: {
        title: "הזמנה הושלמה",
        message: `הזמנה #${args.orderNumber} הושלמה בהצלחה - ₪${args.total.toLocaleString("he-IL")}`,
        icon: "check_circle",
      },
      cancelled: {
        title: "הזמנה בוטלה",
        message: `הזמנה #${args.orderNumber} בוטלה - ₪${args.total.toLocaleString("he-IL")}`,
        icon: "cancel",
      },
    };

    const statusInfo = statusLabels[args.status] || statusLabels.placed;

    await ctx.db.insert("notifications", {
      userId: args.userId,
      title: statusInfo.title,
      message: statusInfo.message,
      type: "order",
      icon: args.customIcon || statusInfo.icon,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },
});
