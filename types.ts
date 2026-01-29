// Stock status enum matching backend
export enum StockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  LOW_STOCK = 'low_stock',
}

// Wine type enum
export enum WineType {
  RED = 'red',
  WHITE = 'white',
  ROSE = 'rose',
  SPARKLING = 'sparkling',
}

export interface Product {
  $id: string;                // Appwrite document ID
  $createdAt?: string;
  $updatedAt?: string;
  productName: string;
  productNameHe?: string;      // Displayed name (Hebrew site)
  description?: string;
  descriptionHe?: string;     // Displayed description
  shortDescription?: string;
  shortDescriptionHe?: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  quantityInStock: number;
  sku: string;
  stockStatus?: StockStatus;
  category: string;
  dateAdded?: string;
  tags?: string[];
  relatedProducts?: string[];
  isFeatured?: boolean;
  featuredImage?: string;
  images?: string[];          // For compatibility with existing code
  wineType?: WineType | 'Red' | 'White' | 'Rosé' | 'Sparkling'; // Support both formats
  region?: string;
  vintage?: number;
  alcoholContent?: number;
  volume?: string;
  grapeVariety?: string;         // Grape types, e.g., "100% שרדונה"
  servingTemperature?: string;   // Recommended serving temp, e.g., "10-12°"
  tastingNotes?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  salePrice?: number;        // Discounted price if on sale
  originalPrice?: number;    // Original price for strike-through display
  quantity: number;
  maxQuantity: number;       // Stock limit for validation
  imgSrc: string;
  variant?: string;          // Product variant info
}

// Category status enum
export enum CategoryStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  HIDDEN = 'hidden',
}

export interface Category {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  nameHe?: string;           // Hebrew name for display
  slug: string;
  parentId?: string | null;
  status: CategoryStatus | 'active' | 'draft' | 'hidden' | 'inactive'; // Support multiple formats
  displayOrder: number;
  description?: string;
  descriptionHe?: string;
  image?: string;
  icon?: string;
  iconColor?: string;
}

// Category with children for tree display
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
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

// Helper interfaces for order creation
export interface ShippingAddress {
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentInfo {
  method: string;
  cardExpiry?: string;
  transactionId: string;
  chargeDate: string;
}

export interface Order {
  $id: string;
  $createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAvatar?: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  status: OrderStatus;
  // Flattened shipping address
  shippingStreet: string;
  shippingApartment?: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  // Flattened payment info
  paymentMethod: string;
  paymentCardExpiry?: string;
  paymentTransactionId: string;
  paymentChargeDate: string;
}

// Full order details with items
export interface OrderDetails extends Order {
  shippingAddress: ShippingAddress;
  payment: PaymentInfo;
  items: OrderItem[];
}

// Order creation payload
export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  payment: PaymentInfo;
  items: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    variant?: string;
    quantity: number;
    price: number;
  }>;
  couponCode?: string;
}

export enum CouponDiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
  FREE_PRODUCT = 'free_product',
  BUY_X_GET_Y = 'buy_x_get_y'
}

export enum CouponStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  SCHEDULED = 'scheduled',
}

export interface Coupon {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  
  // Buy X Get Y specific
  buyQuantity?: number;
  getQuantity?: number;
  
  // Validity dates
  startDate: string;
  endDate?: string;
  
  // Limits
  minimumOrder?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usageCount: number;
  
  // Restrictions
  categoryIds?: string[];
  productIds?: string[];
  userIds?: string[];           // Eligible user IDs (empty = all)
  firstPurchaseOnly?: boolean;  // First purchase only
  excludeOtherCoupons?: boolean; // Cannot combine with other coupons
  
  status: CouponStatus | 'active' | 'paused' | 'expired' | 'scheduled' | 'inactive';
}

// Coupon validation result
export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  error?: string;
}

// Applied coupon in cart
export interface AppliedCoupon {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  discountAmount: number;    // Calculated discount in ILS
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

export interface SavedCart {
  items: CartItem[];
  appliedCoupon?: AppliedCoupon | null;
  updatedAt: string;
}

export interface UserPreferences {
  addresses?: Address[];
  phone?: string;
  cart?: SavedCart;
}

export interface AnalyticsEvent {
  $id: string;
  type: 'page_view' | 'product_view' | 'add_to_cart' | 'checkout';
  productId?: string;
  userId?: string;
  $createdAt: string;
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;  // Auto-dismiss time in ms (default: 4000)
}

export enum CartRuleType {
  SHIPPING = 'shipping',       // Shipping logic (e.g., Free shipping threshold)
  DISCOUNT = 'discount',       // Automatic cart discounts
  RESTRICTION = 'restriction', // Cart restrictions (e.g., Minimum order)
  BENEFIT = 'benefit'          // Special benefits/gifts
}

export enum CartRuleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused'
}

export interface CartRule {
  $id: string;
  name: string;                // Rule name (e.g., "Free Shipping over 300")
  description?: string;        // Description shown to user
  type: CartRuleType;
  priority: number;            // Lower number = Higher priority
  status: CartRuleStatus;
  value?: number;              // Numeric parameter for the rule
}
