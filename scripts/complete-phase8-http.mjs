#!/usr/bin/env node

/**
 * Phase 8 Completion Script - Using Appwrite REST API directly
 * 
 * Creates missing Appwrite collections using HTTP requests
 * - posts (blog posts collection)
 * - coupon_usage (coupon tracking collection)
 * 
 * Usage:
 *   API_KEY=<your-appwrite-api-key> node scripts/complete-phase8-http.mjs
 */

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
  log('\nUsage: API_KEY=<your-key> node scripts/complete-phase8-http.mjs', 'yellow');
  process.exit(1);
}

// Helper function for API requests
async function apiCall(method, endpoint, body = null) {
  const url = `${APPWRITE_ENDPOINT}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Key': API_KEY,
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

logSection('PHASE 8 - DATABASE COMPLETION');
logInfo(`Endpoint: ${APPWRITE_ENDPOINT}`);
logInfo(`Project: ${APPWRITE_PROJECT_ID}`);
logInfo(`Database: ${DATABASE_ID}`);
logInfo(`API Key: ${API_KEY.substring(0, 20)}...`);

// Create collections
async function createPostsCollection() {
  logInfo('Creating "posts" collection...');
  
  try {
    await apiCall('POST', `/databases/${DATABASE_ID}/collections`, {
      collectionId: 'posts',
      name: 'Blog Posts',
      permissions: ['read("any")', 'write("users")'],
    });
    
    logSuccess('Collection "posts" created');
    
    // Add attributes
    const attributes = [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'slug', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 65535, required: true },
      { key: 'excerpt', type: 'string', size: 500, required: false },
      { key: 'author', type: 'string', size: 255, required: false },
      { key: 'image', type: 'string', size: 512, required: false },
      { key: 'publishedAt', type: 'datetime', required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true },
    ];
    
    for (const attr of attributes) {
      try {
        const endpoint = `/databases/${DATABASE_ID}/collections/posts/attributes/${attr.type}`;
        await apiCall('POST', endpoint, {
          key: attr.key,
          size: attr.size || undefined,
          required: attr.required,
        });
        
        logSuccess(`  └─ Attribute '${attr.key}' added`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          logWarning(`  └─ Attribute '${attr.key}' already exists`);
        } else {
          throw err;
        }
      }
    }
    
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      logWarning('Collection "posts" already exists');
      return true;
    }
    logError(`Failed to create "posts" collection: ${error.message}`);
    return false;
  }
}

async function createCouponUsageCollection() {
  logInfo('Creating "coupon_usage" collection...');
  
  try {
    await apiCall('POST', `/databases/${DATABASE_ID}/collections`, {
      collectionId: 'coupon_usage',
      name: 'Coupon Usage Tracking',
      permissions: ['read("users")', 'write("users")'],
    });
    
    logSuccess('Collection "coupon_usage" created');
    
    // Add attributes
    const attributes = [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'couponId', type: 'string', size: 36, required: true },
      { key: 'usedAt', type: 'datetime', required: true },
      { key: 'createdAt', type: 'datetime', required: true },
    ];
    
    for (const attr of attributes) {
      try {
        const endpoint = `/databases/${DATABASE_ID}/collections/coupon_usage/attributes/${attr.type}`;
        await apiCall('POST', endpoint, {
          key: attr.key,
          size: attr.size || undefined,
          required: attr.required,
        });
        
        logSuccess(`  └─ Attribute '${attr.key}' added`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          logWarning(`  └─ Attribute '${attr.key}' already exists`);
        } else {
          throw err;
        }
      }
    }
    
    // Add indexes
    try {
      await apiCall('POST', `/databases/${DATABASE_ID}/collections/coupon_usage/indexes`, {
        key: 'userId_couponId',
        type: 'key',
        attributes: ['userId', 'couponId'],
      });
      logSuccess(`  └─ Index 'userId_couponId' added`);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        throw err;
      }
      logWarning(`  └─ Index 'userId_couponId' already exists`);
    }
    
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      logWarning('Collection "coupon_usage" already exists');
      return true;
    }
    logError(`Failed to create "coupon_usage" collection: ${error.message}`);
    return false;
  }
}

async function verifyCollections() {
  logSection('VERIFYING ALL COLLECTIONS');
  
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
  let count = 0;
  
  for (const collectionId of requiredCollections) {
    try {
      const collection = await apiCall('GET', `/databases/${DATABASE_ID}/collections/${collectionId}`);
      logSuccess(`${collectionId} (${collection.documentCount || 0} docs)`);
      count++;
    } catch (err) {
      logError(`${collectionId} - NOT FOUND`);
      allFound = false;
    }
  }
  
  logInfo(`Total: ${count}/${requiredCollections.length} collections found`);
  return allFound;
}

async function run() {
  try {
    logSection('CREATING MISSING COLLECTIONS');
    
    const postsCreated = await createPostsCollection();
    logInfo('');
    const couponUsageCreated = await createCouponUsageCollection();
    
    const allVerified = await verifyCollections();
    
    logSection('PHASE 8 COMPLETION SUMMARY');
    
    if (allVerified) {
      logSuccess('✨ PHASE 8 COMPLETE! All 10 collections are accessible.');
      logInfo('Database is ready for Phase 10: E2E Testing');
      process.exit(0);
    } else {
      logWarning('Not all collections could be verified.');
      if (postsCreated && couponUsageCreated) {
        logInfo('Missing collections were created but may need time to sync.');
        logInfo('Try running verification again in a moment.');
      }
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
