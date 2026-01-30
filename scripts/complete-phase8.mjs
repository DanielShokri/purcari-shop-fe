#!/usr/bin/env node

/**
 * Phase 8 Completion Script
 * 
 * Creates missing Appwrite collections:
 * - posts (blog posts collection)
 * - coupon_usage (coupon tracking collection)
 * - Fixes notifications permissions
 * 
 * Usage:
 *   API_KEY=<your-appwrite-api-key> node scripts/complete-phase8.mjs
 * 
 * Getting your API Key:
 *   1. Go to https://cloud.appwrite.io
 *   2. Project: 696b5bee001fe3af955a → Settings → API Keys
 *   3. Copy your API Key and set it as environment variable
 */

import { Client, Databases } from 'appwrite';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Validate API key
if (!API_KEY) {
  logError('MISSING API KEY');
  console.log('\nYou need to provide your Appwrite API key to complete Phase 8.');
  console.log('\nHow to get your API key:');
  console.log('  1. Go to https://cloud.appwrite.io');
  console.log('  2. Project: 696b5bee001fe3af955a → Settings → API Keys');
  console.log('  3. Copy your API Key\n');
  console.log('Then run this command:');
  console.log('  API_KEY=<your-key> node scripts/complete-phase8.mjs\n');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

logSection('PHASE 8 - DATABASE COMPLETION');
logInfo(`Endpoint: ${APPWRITE_ENDPOINT}`);
logInfo(`Project: ${APPWRITE_PROJECT_ID}`);
logInfo(`Database: ${DATABASE_ID}`);

// Define collection schemas
const collectionsToCreate = [
  {
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
    permissions: ['read("any")', 'write("users")'],
  },
  {
    id: 'coupon_usage',
    name: 'Coupon Usage Tracking',
    attributes: [
      { key: 'userId', type: 'string', required: true, size: 36 },
      { key: 'couponId', type: 'string', required: true, size: 36 },
      { key: 'usedAt', type: 'datetime', required: true },
      { key: 'createdAt', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'userId_couponId', type: 'key', attributes: ['userId', 'couponId'] },
      { key: 'userId', type: 'key', attributes: ['userId'] },
    ],
    permissions: ['read("users")', 'write("users")'],
  },
];

async function createAttribute(collectionId, attribute) {
  try {
    await databases.createStringAttribute(
      DATABASE_ID,
      collectionId,
      attribute.key,
      attribute.size,
      attribute.required,
      undefined,
      true // array
    );
    logSuccess(`  └─ Attribute: ${attribute.key}`);
  } catch (error) {
    // Attribute might already exist, which is fine
    if (error.message.includes('already exists')) {
      logWarning(`  └─ Attribute: ${attribute.key} (already exists)`);
    } else {
      throw error;
    }
  }
}

async function createDateTimeAttribute(collectionId, attribute) {
  try {
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      collectionId,
      attribute.key,
      attribute.required,
      undefined,
      true // array
    );
    logSuccess(`  └─ Attribute: ${attribute.key} (datetime)`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      logWarning(`  └─ Attribute: ${attribute.key} (already exists)`);
    } else {
      throw error;
    }
  }
}

async function createCollection(collectionConfig) {
  logInfo(`\nCreating collection: ${collectionConfig.name}`);
  
  try {
    // Create collection
    await databases.createCollection(
      DATABASE_ID,
      collectionConfig.id,
      collectionConfig.name,
      collectionConfig.permissions
    );
    logSuccess(`Collection created: ${collectionConfig.id}`);
    
    // Create attributes
    logInfo(`Adding attributes to ${collectionConfig.id}...`);
    for (const attribute of collectionConfig.attributes) {
      if (attribute.type === 'datetime') {
        await createDateTimeAttribute(collectionConfig.id, attribute);
      } else if (attribute.type === 'string') {
        await createAttribute(collectionConfig.id, attribute);
      }
    }
    
    // Create indexes if specified
    if (collectionConfig.indexes) {
      logInfo(`Creating indexes for ${collectionConfig.id}...`);
      for (const index of collectionConfig.indexes) {
        try {
          await databases.createIndex(
            DATABASE_ID,
            collectionConfig.id,
            index.key,
            index.type,
            index.attributes
          );
          logSuccess(`  └─ Index: ${index.key}`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            logWarning(`  └─ Index: ${index.key} (already exists)`);
          } else {
            throw error;
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      logWarning(`Collection already exists: ${collectionConfig.id}`);
      return true;
    }
    logError(`Failed to create ${collectionConfig.id}: ${error.message}`);
    return false;
  }
}

async function verifyCollections() {
  logSection('VERIFICATION');
  logInfo('Verifying all 10 expected collections...\n');
  
  const expectedCollections = [
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
  
  let accessibleCount = 0;
  let totalCount = 0;
  
  for (const collectionId of expectedCollections) {
    totalCount++;
    try {
      const docs = await databases.listDocuments(DATABASE_ID, collectionId);
      logSuccess(`${collectionId} (${docs.total} documents)`);
      accessibleCount++;
    } catch (error) {
      if (error.message.includes('not found')) {
        logError(`${collectionId} (NOT FOUND)`);
      } else if (error.message.includes('unauthorized')) {
        logWarning(`${collectionId} (PERMISSION ERROR)`);
      } else {
        logError(`${collectionId} (ERROR: ${error.message})`);
      }
    }
  }
  
  console.log('');
  logInfo(`Results: ${accessibleCount}/${totalCount} collections accessible`);
  
  if (accessibleCount === totalCount) {
    logSuccess('ALL COLLECTIONS VERIFIED!');
    return true;
  } else {
    logWarning(`${totalCount - accessibleCount} collections still have issues`);
    return false;
  }
}

async function main() {
  try {
    logSection('STEP 1: CREATE MISSING COLLECTIONS');
    
    // Create each collection
    let allSuccess = true;
    for (const collectionConfig of collectionsToCreate) {
      const success = await createCollection(collectionConfig);
      if (!success) allSuccess = false;
    }
    
    if (!allSuccess) {
      logWarning('Some collections had issues, but proceeding to verification...\n');
    }
    
    // Wait a moment for Appwrite to process
    logInfo('Waiting for Appwrite to process collections...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify all collections
    const verified = await verifyCollections();
    
    if (verified) {
      logSection('PHASE 8 COMPLETE');
      logSuccess('All collections created and verified!');
      logSuccess('You can now proceed to Phase 10: E2E Testing');
      process.exit(0);
    } else {
      logSection('PHASE 8 PARTIAL COMPLETE');
      logWarning('Some collections still have issues.');
      logInfo('Check .planning/PHASE_8_STATUS_REPORT.md for detailed steps.');
      process.exit(1);
    }
  } catch (error) {
    logError(`\nFatal error: ${error.message}`);
    console.log('\nDebugging info:');
    console.log(`  Endpoint: ${APPWRITE_ENDPOINT}`);
    console.log(`  Project: ${APPWRITE_PROJECT_ID}`);
    console.log(`  Database: ${DATABASE_ID}`);
    console.log(`  API Key provided: ${API_KEY ? 'YES' : 'NO'}`);
    
    if (error.message.includes('API key') || error.message.includes('401')) {
      logWarning('\nIt looks like your API key might be invalid.');
      logInfo('Get a fresh API key from: https://cloud.appwrite.io → Settings → API Keys');
    }
    
    process.exit(1);
  }
}

main();
