#!/usr/bin/env tsx
/**
 * Appwrite Connection Test Script
 * 
 * Tests critical Appwrite integration:
 * 1. Environment variables configured
 * 2. Database connection works
 * 3. Collections exist
 * 4. Can perform basic operations
 * 
 * Usage:
 *   npm run test:appwrite
 *   pnpm test:appwrite
 */

import { databases, APPWRITE_CONFIG } from '../packages/shared-services/src/appwrite';
import { Query } from 'appwrite';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function test(
  name: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    await fn();
    results.push({ name, status: 'PASS', message: '✅ Passed' });
    console.log(`✅ ${name}`);
  } catch (error: any) {
    const message = error?.message || String(error);
    results.push({ name, status: 'FAIL', message, details: error });
    console.log(`❌ ${name}: ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Appwrite Verification Tests\n');
  console.log(`Database ID: ${APPWRITE_CONFIG.DATABASE_ID}`);
  console.log('Endpoint: ' + import.meta.env.VITE_APPWRITE_ENDPOINT);
  console.log('---\n');

  // Test 1: Check environment variables
  await test('Environment: VITE_APPWRITE_ENDPOINT configured', async () => {
    if (!import.meta.env.VITE_APPWRITE_ENDPOINT) {
      throw new Error('VITE_APPWRITE_ENDPOINT not set');
    }
  });

  await test('Environment: VITE_APPWRITE_PROJECT_ID configured', async () => {
    if (!import.meta.env.VITE_APPWRITE_PROJECT_ID) {
      throw new Error('VITE_APPWRITE_PROJECT_ID not set');
    }
  });

  // Test 2: Database connection
  await test('Connection: Can connect to Appwrite database', async () => {
    const collections = await databases.listCollections(
      APPWRITE_CONFIG.DATABASE_ID
    );
    if (!collections) {
      throw new Error('Failed to list collections');
    }
  });

  // Test 3: Check each expected collection
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
    'notifications'
  ];

  let foundCollections = new Set<string>();

  await test('Collections: List all collections', async () => {
    const response = await databases.listCollections(
      APPWRITE_CONFIG.DATABASE_ID
    );
    
    if (!response.collections || response.collections.length === 0) {
      throw new Error('No collections found in database');
    }

    response.collections.forEach((col: any) => {
      foundCollections.add(col.name);
    });

    console.log(
      `   Found ${response.collections.length} collections: ${
        response.collections.map((c: any) => c.name).join(', ')
      }`
    );
  });

  // Test 4: Check each critical collection
  for (const collName of expectedCollections) {
    await test(`Collection: '${collName}' exists`, async () => {
      if (!foundCollections.has(collName)) {
        throw new Error(`Collection '${collName}' not found`);
      }
    });
  }

  // Test 5: Try reading from products collection
  await test('Operation: Can read from products collection', async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTION_PRODUCTS,
        [Query.limit(1)]
      );
      console.log(`   Found ${response.total} products in database`);
    } catch (error: any) {
      if (error?.code === 404 || error?.type === 'document_not_found') {
        console.log('   (No products yet - this is OK)');
      } else {
        throw error;
      }
    }
  });

  // Summary
  console.log('\n---\n📊 Test Summary\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;

  console.log(`✅ Passed: ${passed}`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);
  if (warned > 0) console.log(`⚠️  Warned: ${warned}`);

  console.log(`\nTotal: ${results.length} tests\n`);

  if (failed > 0) {
    console.log('❌ Some tests failed. See details above.\n');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!\n');
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});
