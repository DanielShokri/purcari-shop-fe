#!/usr/bin/env node
/**
 * Simple Appwrite Connection Test (Node.js compatible)
 * Tests connection to Appwrite database without Vite
 */

require('dotenv').config({ path: '.env.local' });

const { Client, Databases } = require('appwrite');

const endpoint = process.env.VITE_APPWRITE_ENDPOINT;
const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
const databaseId = 'cms_db';

console.log('🧪 Appwrite Connection Test');
console.log('================================\n');

if (!endpoint || !projectId) {
  console.error('❌ Missing Appwrite configuration');
  console.error('   VITE_APPWRITE_ENDPOINT:', endpoint || 'NOT SET');
  console.error('   VITE_APPWRITE_PROJECT_ID:', projectId || 'NOT SET');
  console.error('\nPlease check .env.local file');
  process.exit(1);
}

console.log('✅ Configuration found:');
console.log(`   Endpoint: ${endpoint}`);
console.log(`   Project: ${projectId}`);
console.log(`   Database: ${databaseId}\n`);

const client = new Client();
client.setEndpoint(endpoint).setProject(projectId);

const databases = new Databases(client);

const expectedCollections = [
  'posts',
  'products',
  'categories',
  'orders',
  'order_items',
  'coupons',
  'coupon_usage',
  'cart_rules',
  'analytics_events',
  'notifications',
];

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: List database
  try {
    const db = await databases.get(databaseId);
    console.log(`✅ Database found: ${db.name} (ID: ${db.$id})`);
    passed++;
  } catch (error) {
    console.error(`❌ Database not found: ${error.message}`);
    failed++;
    process.exit(1);
  }

  // Test 2: List collections
  try {
    const response = await databases.listCollections(databaseId);
    const collections = response.collections || [];
    console.log(`✅ Found ${collections.length} collections\n`);

    const collectionNames = collections.map(c => c.name);
    console.log('Collections in database:');
    collections.forEach(c => {
      console.log(`   - ${c.name} (${c.documentCount} documents)`);
    });

    // Check for expected collections
    console.log('\nExpected collections verification:');
    expectedCollections.forEach(expected => {
      const found = collectionNames.includes(expected);
      if (found) {
        console.log(`   ✅ ${expected}`);
        passed++;
      } else {
        console.log(`   ❌ ${expected} (MISSING)`);
        failed++;
      }
    });

    passed++;
  } catch (error) {
    console.error(`❌ Failed to list collections: ${error.message}`);
    failed++;
  }

  // Summary
  console.log('\n================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.error('\n⚠️  Some verifications failed. Check Appwrite console.');
    process.exit(1);
  } else {
    console.log('\n✅ All basic verifications passed!');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
