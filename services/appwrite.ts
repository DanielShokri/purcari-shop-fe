import { Client, Account, Databases, Storage, Functions } from 'appwrite';

// Appwrite Project: purcari
const client = new Client();

const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '696b5bee001fe3af955a';

client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

/**
 * Pings the Appwrite backend to verify the SDK setup.
 * This function is automatically called when the app starts.
 */
export const pingAppwrite = async (): Promise<void> => {
    try {
        await client.ping();
        console.log('✅ Appwrite connection successful!');
    } catch (error) {
        console.error('❌ Appwrite connection failed:', error);
    }
};

export const APPWRITE_CONFIG = {
  DATABASE_ID: 'cms_db',
  COLLECTION_POSTS: 'posts',
  COLLECTION_PRODUCTS: 'products',
  COLLECTION_CATEGORIES: 'categories',
  COLLECTION_ORDERS: 'orders',
  COLLECTION_ORDER_ITEMS: 'order_items',
  COLLECTION_ANALYTICS_EVENTS: 'analytics_events',
  COLLECTION_NOTIFICATIONS: 'notifications',
  COLLECTION_COUPONS: 'coupons',
  BUCKET_MEDIA: 'media',
  FUNCTION_USERS: 'users-management' // Cloud Function ID for user management
};

/**
 * Analytics Events Collection Schema:
 * 
 * Required fields:
 * - type: string (e.g., 'page_view', 'product_view', 'user_action')
 * - userId: string (optional, for anonymous tracking)
 * - productId: string (optional, for product-specific events)
 * 
 * Appwrite auto-fields:
 * - $id: string (document ID)
 * - $createdAt: string (ISO timestamp)
 * - $updatedAt: string (ISO timestamp)
 * 
 * Recommended indexes:
 * - type (string index)
 * - userId (string index)
 * - productId (string index)
 * - $createdAt (datetime index)
 */

/**
 * Coupons Collection Schema:
 * 
 * Required fields:
 * - code: string (unique coupon code)
 * - discountType: enum (percentage, fixed_amount, free_shipping, free_product, buy_x_get_y)
 * - discountValue: float (discount amount/percentage)
 * - startDate: datetime (when coupon becomes active)
 * - usageCount: integer (current usage count, default: 0)
 * - status: enum (active, paused, expired, scheduled)
 * 
 * Optional fields:
 * - description: string (internal description)
 * - buyQuantity: integer (for buy_x_get_y type)
 * - getQuantity: integer (for buy_x_get_y type)
 * - endDate: datetime (when coupon expires)
 * - minimumOrder: float (minimum order amount)
 * - maximumDiscount: float (maximum discount cap)
 * - usageLimit: integer (total usage limit)
 * - usageLimitPerUser: integer (per-user usage limit)
 * - categoryIds: string[] (restrict to specific categories)
 * - productIds: string[] (restrict to specific products)
 * - userIds: string[] (restrict to specific users)
 * - firstPurchaseOnly: boolean (first purchase only)
 * - excludeOtherCoupons: boolean (cannot combine with other coupons)
 * 
 * Appwrite auto-fields:
 * - $id: string (document ID)
 * - $createdAt: string (ISO timestamp)
 * - $updatedAt: string (ISO timestamp)
 * 
 * Indexes:
 * - code_unique (unique index on code)
 * - status_idx (key index on status)
 * - discountType_idx (key index on discountType)
 * - startDate_idx (key index on startDate)
 * - endDate_idx (key index on endDate)
 */

/**
 * Users API - Server-side operations via Appwrite Cloud Functions
 * 
 * IMPORTANT: You need to create and deploy a Cloud Function with ID 'users-management'
 * See the Cloud Function code in functions/users-management/index.js
 */
export const usersApi = {
  // Call Cloud Function with proper error handling
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

  // List all users
  async list() {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'list'
    });
  },

  // Get a single user by ID
  async get(userId: string) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'get',
      userId
    });
  },

  // Create a new user
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

  // Update user name
  async updateName(userId: string, name: string) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'updateName',
      userId,
      name
    });
  },

  // Update user email
  async updateEmail(userId: string, email: string) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'updateEmail',
      userId,
      email
    });
  },

  // Update user status (active/blocked)
  async updateStatus(userId: string, status: boolean) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'updateStatus',
      userId,
      status
    });
  },

  // Update user labels (for roles)
  async updateLabels(userId: string, labels: string[]) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'updateLabels',
      userId,
      labels
    });
  },

  // Update user prefs (for avatar, etc.)
  async updatePrefs(userId: string, prefs: Record<string, any>) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'updatePrefs',
      userId,
      prefs
    });
  },

  // Delete a user
  async delete(userId: string) {
    return this.callFunction(APPWRITE_CONFIG.FUNCTION_USERS, {
      action: 'delete',
      userId
    });
  },
};