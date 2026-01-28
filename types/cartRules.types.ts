// Cart Rules Types

export enum CartRuleType {
  SHIPPING = 'shipping',       // משלוח
  DISCOUNT = 'discount',       // הנחה
  RESTRICTION = 'restriction', // הגבלות
  BENEFIT = 'benefit'          // הטבה
}

export enum CartRuleStatus {
  ACTIVE = 'active',   // פעיל
  PAUSED = 'paused'    // מושהה
}

export interface CartRule {
  $id: string;
  name: string;                    // שם החוק
  description?: string;            // תיאור / הערות
  type: CartRuleType;              // סוג החוק
  priority: number;                // עדיפות (מספר נמוך = עדיפות גבוהה)
  status: CartRuleStatus;          // סטטוס
  value?: number;                  // ערך (סכום סף, אחוז וכו')
  // Timestamps
  $createdAt?: string;
  $updatedAt?: string;
}
