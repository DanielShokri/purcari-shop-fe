// Order Types

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Order {
  $id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO Date string
}

export interface OrderItem {
  $id: string;
  productName: string;
  productImage?: string;
  variant?: string; // e.g., "צבע: אדום | מידה: 42"
  quantity: number;
  price: number;
  total: number;
}

export interface ShippingAddress {
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentInfo {
  method: string; // e.g., "Visa מסתיים ב-4242"
  cardExpiry?: string;
  transactionId: string;
  chargeDate: string;
}

export interface OrderDetails extends Order {
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  payment: PaymentInfo;
  subtotal: number;
  shippingCost: number;
  tax: number;
}
