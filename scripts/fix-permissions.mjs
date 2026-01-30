#!/usr/bin/env node

/**
 * Fix Collection Permissions for coupon_usage and notifications
 */

const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '696b5bee001fe3af955a';
const DATABASE_ID = 'cms_db';
const API_KEY = process.env.API_KEY;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

if (!API_KEY) {
  log('❌ API_KEY not set', 'red');
  process.exit(1);
}

async function updateCollectionPermissions(collectionId, permissions) {
  const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}`;
  
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
      },
      body: JSON.stringify({ permissions }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    
    log(`✅ Updated permissions for '${collectionId}'`, 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to update '${collectionId}': ${error.message}`, 'red');
    return false;
  }
}

async function run() {
  log('\n' + '='.repeat(70), 'cyan');
  log('Fixing Collection Permissions', 'cyan');
  log('='.repeat(70), 'cyan');
  
  // Update coupon_usage with public read/write
  await updateCollectionPermissions('coupon_usage', [
    'read("any")',
    'write("any")',
  ]);
  
  // Update notifications with public read/write
  await updateCollectionPermissions('notifications', [
    'read("any")',
    'write("any")',
  ]);
  
  log('\n' + '='.repeat(70), 'cyan');
  log('Testing collections...', 'cyan');
  
  // Test both collections
  const testCollections = ['coupon_usage', 'notifications'];
  for (const collectionId of testCollections) {
    try {
      const response = await fetch(
        `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}`,
        {
          headers: {
            'X-Appwrite-Project': APPWRITE_PROJECT_ID,
            'X-Appwrite-Key': API_KEY,
          },
        }
      );
      const data = await response.json();
      log(`✅ ${collectionId} accessible`, 'green');
    } catch (err) {
      log(`❌ ${collectionId} not accessible`, 'red');
    }
  }
}

run();
