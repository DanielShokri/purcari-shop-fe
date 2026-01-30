import { Client, Account, Databases, Storage, Functions } from 'appwrite';

/**
 * Appwrite Client Configuration
 * 
 * Environment Variables:
 * - VITE_APPWRITE_ENDPOINT: Appwrite API endpoint (default: https://fra.cloud.appwrite.io/v1)
 * - VITE_APPWRITE_PROJECT_ID: Your Appwrite project ID (required)
 * - VITE_APPWRITE_DATABASE_ID: Database ID (optional, defaults to 'cms_db')
 * 
 * IMPORTANT: Both VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID must be set.
 * Missing these values will throw an error to prevent silent failures.
 */

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
  throw new Error(
    'Missing Appwrite configuration. Please create a .env.local file with:\n' +
    '  VITE_APPWRITE_ENDPOINT: Appwrite API endpoint (e.g., https://fra.cloud.appwrite.io/v1)\n' +
    '  VITE_APPWRITE_PROJECT_ID: Your Appwrite project ID\n\n' +
    'See .env.example for more details.'
  );
}

const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Core Appwrite Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

/**
 * Appwrite Configuration Constants
 * These IDs must match the Appwrite backend configuration.
 * Shared database: cms_db (used by both admin dashboard and storefront)
 */
export const APPWRITE_CONFIG = {
  // Database
  DATABASE_ID: 'cms_db',
  
  // Collections (flat naming - used in API calls)
  COLLECTION_POSTS: 'posts',
  COLLECTION_PRODUCTS: 'products',
  COLLECTION_CATEGORIES: 'categories',
  COLLECTION_ORDERS: 'orders',
  COLLECTION_ORDER_ITEMS: 'order_items',
  COLLECTION_COUPONS: 'coupons',
  COLLECTION_COUPON_USAGE: 'coupon_usage',  // Per-user coupon tracking
  COLLECTION_CART_RULES: 'cart_rules',
  COLLECTION_ANALYTICS_EVENTS: 'analytics_events',
  COLLECTION_NOTIFICATIONS: 'notifications', // Admin-only notifications
  
  // Cloud Functions
  FUNCTION_INCREMENT_COUPON_USAGE: import.meta.env.VITE_APPWRITE_FUNCTION_INCREMENT_COUPON_USAGE || 'increment-coupon-usage',
  FUNCTION_USERS: 'users-management',  // Cloud Function ID for user management
  
  // Storage Buckets
  BUCKET_MEDIA: import.meta.env.VITE_APPWRITE_BUCKET_ID || 'media',
} as const;

/**
 * Alternative naming pattern (camelCase, matches backend contract style)
 * Use these for cleaner code in type definitions and imports
 */
export const databaseId = APPWRITE_CONFIG.DATABASE_ID;

export const collections = {
  posts: APPWRITE_CONFIG.COLLECTION_POSTS,
  products: APPWRITE_CONFIG.COLLECTION_PRODUCTS,
  categories: APPWRITE_CONFIG.COLLECTION_CATEGORIES,
  orders: APPWRITE_CONFIG.COLLECTION_ORDERS,
  orderItems: APPWRITE_CONFIG.COLLECTION_ORDER_ITEMS,
  coupons: APPWRITE_CONFIG.COLLECTION_COUPONS,
  couponUsage: APPWRITE_CONFIG.COLLECTION_COUPON_USAGE,
  cartRules: APPWRITE_CONFIG.COLLECTION_CART_RULES,
  analyticsEvents: APPWRITE_CONFIG.COLLECTION_ANALYTICS_EVENTS,
  notifications: APPWRITE_CONFIG.COLLECTION_NOTIFICATIONS,
} as const;

export const buckets = {
  media: APPWRITE_CONFIG.BUCKET_MEDIA,
} as const;

/**
 * Users API - Server-side operations via Appwrite Cloud Functions
 * 
 * IMPORTANT: You need to create and deploy a Cloud Function with ID 'users-management'
 * See the Cloud Function code in functions/users-management/index.js
 * 
 * This API provides methods to manage users via Cloud Functions,
 * which is necessary because the Appwrite Admin SDK cannot be used from the browser.
 */
export const usersApi = {
  /**
   * Call a Cloud Function with proper error handling
   * @param functionId - ID of the Cloud Function to call
   * @param data - Data to pass to the function
   * @returns Promise with the function response
   */
  async callFunction(functionId: string, data: any) {
    try {
      const response = await functions.createExecution(functionId, JSON.stringify(data));
      
      // Parse the response body (execution response is in responseBody)
      const result = JSON.parse(response.responseBody || '{}');
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error: any) {
      // Handle execution errors
      const errorMessage = error.message || 'Function execution error';
      const errorCode = error.code || error.type || '';
      
      // Provide helpful error message if function doesn't exist
      if (
        errorCode === 'function_not_found' ||
        errorCode === 404 ||
        errorMessage.toLowerCase().includes('not found') ||
        errorMessage.toLowerCase().includes('404') ||
        errorMessage.toLowerCase().includes('function_not_found')
      ) {
        throw new Error(
          'Cloud Function "users-management" not found. ' +
          'Please create and deploy the function in Appwrite Console. ' +
          'See functions/users-management/README.md for instructions.'
        );
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * List all users
   * @returns Promise<Array> - Array of user objects
   */
  async list() {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'list'
    });
  },

  /**
   * Get a single user by ID
   * @param userId - User ID to retrieve
   * @returns Promise<Object> - User object
   */
  async get(userId: string) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'get',
      userId
    });
  },

  /**
   * Create a new user
   * @param userId - Unique user ID
   * @param email - User email address
   * @param password - User password (will be hashed)
   * @param name - User name (optional)
   * @param role - User role (optional)
   * @returns Promise<Object> - Created user object
   */
  async create(userId: string, email: string, password: string, name?: string, role?: string) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'create',
      userId,
      email,
      password,
      name: name || '',
      role: role || undefined
    });
  },

  /**
   * Update user name
   * @param userId - User ID to update
   * @param name - New user name
   * @returns Promise<Object> - Updated user object
   */
  async updateName(userId: string, name: string) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'updateName',
      userId,
      name
    });
  },

  /**
   * Update user email
   * @param userId - User ID to update
   * @param email - New email address
   * @returns Promise<Object> - Updated user object
   */
  async updateEmail(userId: string, email: string) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'updateEmail',
      userId,
      email
    });
  },

  /**
   * Update user phone
   * @param userId - User ID to update
   * @param phone - New phone number
   * @returns Promise<Object> - Updated user object
   */
  async updatePhone(userId: string, phone: string) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'updatePhone',
      userId,
      phone
    });
  },

  /**
   * Update user status (active/blocked)
   * @param userId - User ID to update
   * @param status - Active/blocked status
   * @returns Promise<Object> - Updated user object
   */
  async updateStatus(userId: string, status: boolean) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'updateStatus',
      userId,
      status
    });
  },

  /**
   * Update user labels (for roles)
   * @param userId - User ID to update
   * @param labels - Array of role labels
   * @returns Promise<Object> - Updated user object
   */
  async updateLabels(userId: string, labels: string[]) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'updateLabels',
      userId,
      labels
    });
  },

  /**
   * Update user preferences (for avatar, theme, etc.)
   * @param userId - User ID to update
   * @param prefs - Preferences object
   * @returns Promise<Object> - Updated user object
   */
  async updatePrefs(userId: string, prefs: Record<string, any>) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'updatePrefs',
      userId,
      prefs
    });
  },

  /**
   * Delete a user
   * @param userId - User ID to delete
   * @returns Promise<void>
   */
  async delete(userId: string) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'delete',
      userId
    });
  },
};
