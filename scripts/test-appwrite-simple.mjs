#!/usr/bin/env node
/**
 * Simple Appwrite Connection Test (Node.js ESM)
 * Tests connection to Appwrite database without Vite
 */

import * as dotenv from 'dotenv';
import { Client, Databases } from 'appwrite';

// Load .env.local
dotenv.config({ path: '.env.local' });

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

  console.log('Testing each collection...\n');

  // Test each collection by trying to list documents
  for (const collectionName of expectedCollections) {
    try {
      const response = await databases.listDocuments(databaseId, collectionName);
      console.log(`✅ ${collectionName} (${response.total} documents)`);
      passed++;
    } catch (error) {
      if (error.message.includes('not found') || error.code === 404) {
        console.error(`❌ ${collectionName} (NOT FOUND)`);
      } else {
        console.error(`⚠️  ${collectionName} (Error: ${error.message})`);
      }
      failed++;
    }
  }

  // Summary
  console.log('\n================================');
  console.log(`Results: ${passed} collections found, ${failed} missing`);

  if (failed > 0) {
    console.error('\n⚠️  Some collections are missing or inaccessible.');
    console.error('   Next steps:');
    console.error('   1. Check Appwrite console: https://cloud.appwrite.io');
    console.error('   2. Verify project: 696b5bee001fe3af955a');
    console.error('   3. Navigate to Database → cms_db');
    console.error('   4. Create missing collections');
    console.error('\n   See .planning/PHASE_8_DATABASE_VERIFICATION.md for collection schemas');
    process.exit(1);
  } else {
    console.log('\n✅ All collections are accessible!');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('Fatal error:', error.message);
  console.error('\nTroubleshooting:');
  console.error('- Check internet connection');
  console.error('- Verify Appwrite endpoint is accessible');
  console.error('- Check project credentials in .env.local');
  process.exit(1);
});
