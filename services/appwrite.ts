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
  BUCKET_MEDIA: 'media',
  FUNCTION_USERS: 'users-management' // Cloud Function ID for user management
};

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
      const errorMessage = error.message || 'שגיאה בקריאה לפונקציה';
      
      // Provide helpful error message if function doesn't exist
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        throw new Error('הפונקציה לא נמצאה. אנא ודא שהפונקציה users-management מוגדרת ומופעלת ב-Appwrite Console.');
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