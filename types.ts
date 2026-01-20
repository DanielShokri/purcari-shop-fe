export interface Product {
  $id: string;                // Appwrite document ID
  productName: string;
  productNameHe: string;      // Displayed name
  description?: string;
  descriptionHe?: string;     // Displayed description
  shortDescription?: string;
  shortDescriptionHe?: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  quantityInStock: number;
  sku: string;
  category: string;
  dateAdded?: string;
  tags?: string[];
  relatedProducts?: string[];
  isFeatured?: boolean;
  featuredImage?: string;
  images?: string[];          // For compatibility with existing code
  wineType?: 'Red' | 'White' | 'Rosé' | 'Sparkling';
  region?: string;
  vintage?: number;
  alcoholContent?: number;
  volume?: string;
  tastingNotes?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imgSrc: string;
}

export interface Category {
  $id: string;
  name: string;
  nameHe: string;
  slug: string;
  parentId?: string | null;
  status: 'active' | 'inactive';
  displayOrder: number;
  description?: string;
  image?: string;
  icon?: string;
  iconColor?: string;
}

export interface OrderItem {
  $id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  variant?: string;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'shipped';

export interface Order {
  $id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  status: OrderStatus;
  $createdAt: string;
  // Flattened shipping address
  shippingStreet: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  // Flattened payment info
  paymentMethod: string;
  paymentTransactionId: string;
  paymentChargeDate: string;
}

export enum CouponDiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
  FREE_PRODUCT = 'free_product',
  BUY_X_GET_Y = 'buy_x_get_y'
}

export interface Coupon {
  $id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  startDate: string;
  endDate?: string;
  minimumOrder?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usageCount: number;
  categoryIds?: string[];
  productIds?: string[];
  status: 'active' | 'inactive';
}

export interface AuthUser {
  $id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Address {
  id: string;
  name: string; // Label for the address (e.g. Home, Work)
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UserPreferences {
  addresses?: Address[];
  phone?: string;
}

export interface AnalyticsEvent {
  $id: string;
  type: 'page_view' | 'product_view' | 'add_to_cart' | 'checkout';
  productId?: string;
  userId?: string;
  $createdAt: string;
}
