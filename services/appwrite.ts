import { Client, Account, Databases, Storage } from 'appwrite';

// Appwrite Project: purcari
const client = new Client();

client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('696b5bee001fe3af955a');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

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
  COLLECTION_CATEGORIES: 'categories',
  BUCKET_MEDIA: 'media'
};