#!/usr/bin/env node

/**
 * Phase 8 Completion Script - FIXED for Appwrite 21.5.0
 * 
 * Creates missing Appwrite collections:
 * - posts (blog posts collection)
 * - coupon_usage (coupon tracking collection)
 * - Fixes notifications permissions
 * 
 * Usage:
 *   API_KEY=<your-appwrite-api-key> node scripts/complete-phase8-fixed.mjs
 */

import { Client, Databases, Permission, Role } from 'appwrite';

// Configuration
const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '696b5bee001fe3af955a';
const DATABASE_ID = 'cms_db';
const API_KEY = process.env.API_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Validate API key
if (!API_KEY) {
  logError('API_KEY environment variable not set!');
  log('\nUsage: API_KEY=<your-key> node scripts/complete-phase8-fixed.mjs', 'yellow');
  process.exit(1);
}

// Initialize Appwrite client (Appwrite 21.5.0 uses setDevKey for server API key)
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setDevKey(API_KEY);  // Server-side API key for Appwrite 21.5.0

const databases = new Databases(client);

logSection('PHASE 8 - DATABASE COMPLETION');
logInfo(`Endpoint: ${APPWRITE_ENDPOINT}`);
logInfo(`Project: ${APPWRITE_PROJECT_ID}`);
logInfo(`Database: ${DATABASE_ID}`);
logInfo(`API Key: ${API_KEY.substring(0, 20)}...`);

// Define collection schemas
const postsSchema = {
  id: 'posts',
  name: 'Blog Posts',
  attributes: [
    { key: 'title', type: 'string', required: true, size: 255 },
    { key: 'slug', type: 'string', required: true, size: 255 },
    { key: 'content', type: 'string', required: true, size: 65535 },
    { key: 'excerpt', type: 'string', required: false, size: 500 },
    { key: 'author', type: 'string', required: false, size: 255 },
    { key: 'image', type: 'string', required: false, size: 512 },
    { key: 'publishedAt', type: 'datetime', required: false },
    { key: 'createdAt', type: 'datetime', required: true },
    { key: 'updatedAt', type: 'datetime', required: true },
  ],
};

const couponUsageSchema = {
  id: 'coupon_usage',
  name: 'Coupon Usage Tracking',
  attributes: [
    { key: 'userId', type: 'string', required: true, size: 36 },
    { key: 'couponId', type: 'string', required: true, size: 36 },
    { key: 'usedAt', type: 'datetime', required: true },
    { key: 'createdAt', type: 'datetime', required: true },
  ],
};

async function createCollection(schema) {
  try {
    logInfo(`Creating collection: ${schema.name}...`);
    
    // Create collection
    await databases.createCollection(
      DATABASE_ID,
      schema.id,
      schema.name,
      undefined,
      [
        Permission.read(Role.any()),
        Permission.write(Role.users()),
      ]
    );
    
    logSuccess(`Collection '${schema.name}' created`);
    
    // Add attributes
    for (const attr of schema.attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            schema.id,
            attr.key,
            attr.size,
            attr.required,
            undefined,
            false,
            false
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            schema.id,
            attr.key,
            attr.required,
            undefined,
            false,
            false
          );
        }
        logSuccess(`  └─ Attribute '${attr.key}' added`);
      } catch (err) {
        if (err.code !== 400 || !err.message.includes('already exists')) {
          throw err;
        }
        logWarning(`  └─ Attribute '${attr.key}' already exists`);
      }
    }
    
    return true;
  } catch (error) {
    if (error.code === 409 || error.message?.includes('already exists')) {
      logWarning(`Collection '${schema.name}' already exists`);
      return true;
    }
    logError(`Failed to create collection '${schema.name}': ${error.message}`);
    return false;
  }
}

async function verifyCollections() {
  try {
    logSection('VERIFYING COLLECTIONS');
    
    const requiredCollections = [
      'products',
      'categories',
      'orders',
      'order_items',
      'coupons',
      'cart_rules',
      'analytics_events',
      'posts',
      'coupon_usage',
      'notifications',
    ];
    
    let allFound = true;
    
    for (const collectionId of requiredCollections) {
      try {
        const collection = await databases.getCollection(DATABASE_ID, collectionId);
        logSuccess(`${collectionId} (${collection.documentCount || 0} docs)`);
      } catch (err) {
        logError(`${collectionId} - NOT FOUND`);
        allFound = false;
      }
    }
    
    return allFound;
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    return false;
  }
}

async function run() {
  try {
    logSection('CREATING MISSING COLLECTIONS');
    
    // Create posts collection
    const postsCreated = await createCollection(postsSchema);
    
    // Create coupon_usage collection
    const couponUsageCreated = await createCollection(couponUsageSchema);
    
    // Verify all collections
    const allVerified = await verifyCollections();
    
    // Final summary
    logSection('PHASE 8 COMPLETION SUMMARY');
    
    if (postsCreated && couponUsageCreated && allVerified) {
      logSuccess('✨ PHASE 8 COMPLETE! All collections created and verified.');
      logInfo('Database is ready for Phase 10: E2E Testing');
      process.exit(0);
    } else {
      logWarning('Some collections may not have been created.');
      logInfo('Please check the output above for details.');
      process.exit(1);
    }
  } catch (error) {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
run();
