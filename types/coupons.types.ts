// Coupon Types

export enum CouponDiscountType {
  PERCENTAGE = 'percentage',      // אחוז הנחה
  FIXED_AMOUNT = 'fixed_amount',  // סכום קבוע
  FREE_SHIPPING = 'free_shipping', // משלוח חינם
  FREE_PRODUCT = 'free_product',  // מוצר חינם
  BUY_X_GET_Y = 'buy_x_get_y'     // קנה X קבל Y
}

export enum CouponStatus {
  ACTIVE = 'active',       // פעיל
  PAUSED = 'paused',       // מושהה
  EXPIRED = 'expired',     // פג תוקף
  SCHEDULED = 'scheduled'  // מתוזמן
}

export interface Coupon {
  $id: string;
  code: string;                    // קוד קופון (unique)
  description?: string;            // תיאור פנימי
  discountType: CouponDiscountType;
  discountValue: number;           // ערך ההנחה
  // Buy X Get Y specific fields
  buyQuantity?: number;            // קנה X
  getQuantity?: number;            // קבל Y
  // Validity
  startDate: string;               // תאריך התחלה
  endDate?: string;                // תאריך תפוגה
  // Limits
  minimumOrder?: number;           // מינימום הזמנה
  maximumDiscount?: number;        // מקסימום הנחה
  usageLimit?: number;             // הגבלת שימושים כללית
  usageLimitPerUser?: number;      // הגבלה למשתמש
  usageCount: number;              // מספר שימושים נוכחי
  // Restrictions
  categoryIds?: string[];          // קטגוריות מסוימות
  productIds?: string[];           // מוצרים מסוימים
  userIds?: string[];              // משתמשים מסוימים
  firstPurchaseOnly?: boolean;     // רכישה ראשונה בלבד
  excludeOtherCoupons?: boolean;   // לא ניתן לשילוב
  // Status
  status: CouponStatus;
  // Timestamps
  $createdAt?: string;
  $updatedAt?: string;
}
