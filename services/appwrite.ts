import { Client, Account, Databases, Storage } from 'appwrite';

/**
 * Appwrite Client Configuration
 * 
 * Environment Variables:
 * - VITE_APPWRITE_ENDPOINT: Appwrite API endpoint (default: https://fra.cloud.appwrite.io/v1)
 * - VITE_APPWRITE_PROJECT_ID: Your Appwrite project ID (required)
 * - VITE_APPWRITE_BUCKET_ID: Storage bucket ID (optional, defaults to 'media')
 */
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '');

// Appwrite Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

/**
 * Database & Collection IDs
 * These IDs must match the Appwrite backend configuration.
 * Shared database: cms_db (used by both admin dashboard and storefront)
 */
export const APPWRITE_CONFIG = {
  // Database
  DATABASE_ID: 'cms_db',
  
  // Collections (flat naming - used in API calls)
  COLLECTION_PRODUCTS: 'products',
  COLLECTION_CATEGORIES: 'categories',
  COLLECTION_ORDERS: 'orders',
  COLLECTION_ORDER_ITEMS: 'order_items',
  COLLECTION_COUPONS: 'coupons',
  COLLECTION_CART_RULES: 'cart_rules',
  COLLECTION_ANALYTICS_EVENTS: 'analytics_events',
  COLLECTION_NOTIFICATIONS: 'notifications', // Admin-only (not used in storefront)
  
  // Storage Buckets
  BUCKET_MEDIA: import.meta.env.VITE_APPWRITE_BUCKET_ID || 'media',
} as const;

// Alternative naming pattern (matches backend contract style)
export const databaseId = APPWRITE_CONFIG.DATABASE_ID;
export const collections = {
  products: APPWRITE_CONFIG.COLLECTION_PRODUCTS,
  categories: APPWRITE_CONFIG.COLLECTION_CATEGORIES,
  orders: APPWRITE_CONFIG.COLLECTION_ORDERS,
  orderItems: APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
  coupons: APPWRITE_CONFIG.COLLECTION_COUPONS,
  cartRules: APPWRITE_CONFIG.COLLECTION_CART_RULES,
  analyticsEvents: APPWRITE_CONFIG.COLLECTION_ANALYTICS_EVENTS,
} as const;

export const buckets = {
  media: APPWRITE_CONFIG.BUCKET_MEDIA,
} as const;
