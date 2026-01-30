/**
 * Shared Constants Package
 * Configuration and constants used across both apps
 */

// ============================================================================
// APPWRITE CONFIGURATION
// ============================================================================

export const APPWRITE_CONFIG = {
  ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID || '696b5bee001fe3af955a',
  DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'cms_db',
  
  // Collection IDs
  COLLECTIONS: {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    ORDERS: 'orders',
    ORDER_ITEMS: 'order_items',
    COUPONS: 'coupons',
    COUPON_USAGE: 'coupon_usage',
    CART_RULES: 'cart_rules',
    ANALYTICS_EVENTS: 'analytics_events',
    NOTIFICATIONS: 'notifications',
    POSTS: 'posts',
  },
  
  // Storage Bucket IDs
  BUCKETS: {
    MEDIA: 'media',
  },
} as const;

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// ============================================================================
// BUSINESS RULES
// ============================================================================

export const BUSINESS_RULES = {
  // Shipping
  FREE_SHIPPING_THRESHOLD: 300, // Free shipping for orders >= 300 ILS
  
  // Tax
  DEFAULT_TAX_RATE: 0.17, // 17% VAT in Israel
  
  // Coupons
  MAX_DISCOUNT_PERCENTAGE: 100,
  MIN_COUPON_CODE_LENGTH: 3,
  MAX_COUPON_CODE_LENGTH: 20,
  
  // Cart
  MAX_ITEMS_PER_PRODUCT: 10,
  MIN_ORDER_VALUE: 50, // Minimum order value in ILS
  
  // Wine
  MINIMUM_AGE_FOR_WINE: 18,
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  
  // Toast
  TOAST_DURATION: 4000, // 4 seconds
  
  // Debounce/Throttle
  SEARCH_DEBOUNCE: 300, // 300ms
  SCROLL_THROTTLE: 100, // 100ms
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  ENABLE_COUPON_SYSTEM: import.meta.env.VITE_ENABLE_COUPON_SYSTEM !== 'false',
  ENABLE_AGE_VERIFICATION: import.meta.env.VITE_ENABLE_AGE_VERIFICATION !== 'false',
  ENABLE_CART_RULES: true,
  ENABLE_NOTIFICATIONS: true,
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\+\(\)]+$/,
  POSTAL_CODE: /^\d{5}$/,
  COUPON_CODE: /^[A-Z0-9]{3,20}$/,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  // Auth
  INVALID_EMAIL: 'כתובת דוא"ל לא תקינה',
  INVALID_PASSWORD: 'סיסמה חלשה מדי',
  UNAUTHORIZED: 'אין לך הרשאה לביצוע פעולה זו',
  
  // Network
  NETWORK_ERROR: 'שגיאת חיבור. נסה שוב.',
  REQUEST_TIMEOUT: 'הבקשה קלתה זמן. נסה שוב.',
  
  // Validation
  REQUIRED_FIELD: 'שדה חובה',
  INVALID_FORMAT: 'פורמט לא תקין',
  
  // Cart/Order
  OUT_OF_STOCK: 'מוצר אינו זמין',
  INVALID_COUPON: 'קוד קופון לא תקין',
  MINIMUM_ORDER_NOT_MET: 'הזמנה מינימלית לא הושגה',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  LOGIN: 'התחברות הצליחה',
  LOGOUT: 'התנתקות הצליחה',
  CREATED: 'נוצר בהצלחה',
  UPDATED: 'עודכן בהצלחה',
  DELETED: 'נמחק בהצלחה',
  COUPON_APPLIED: 'קוד קופון הוחל בהצלחה',
} as const;

// ============================================================================
// ROUTES
// ============================================================================

export const ROUTES = {
  // Public
  HOME: '/',
  SHOP: '/shop',
  PRODUCT: (id: string) => `/product/${id}`,
  ABOUT: '/about',
  CONTACT: '/contact',
  SHIPPING: '/shipping',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  
  // Auth
  LOGIN: '/login',
  LOGOUT: '/logout',
  REGISTER: '/register',
  
  // User
  DASHBOARD: '/dashboard',
  
  // Checkout
  CHECKOUT: '/checkout',
  ORDER_CONFIRMATION: (orderId: string) => `/order-confirmation/${orderId}`,
  
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_COUPONS: '/admin/coupons',
  ADMIN_CART_RULES: '/admin/cart-rules',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_SEARCH: '/admin/search',
} as const;
