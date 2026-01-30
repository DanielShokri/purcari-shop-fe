# Phase 8: Database/Appwrite Verification

**Status:** IN PROGRESS
**Date Started:** January 31, 2026
**Priority:** CRITICAL (Blocks Phases 10, 12, 14)
**Estimated Duration:** 2-3 days

---

## EXECUTIVE SUMMARY

Phase 8 verifies that the Appwrite backend integration works end-to-end before proceeding to testing, deployment, and documentation phases. This phase is critical because:

1. **Unblocks dependent phases:** Phases 10 (E2E testing), 12 (deployment), 14 (documentation)
2. **Validates data model:** Ensures collections match code expectations
3. **Tests core flows:** Verifies user auth, CRUD operations, and relationships work
4. **Identifies schema issues:** Catches mismatches between code and backend early

---

## APPWRITE CONFIGURATION VERIFIED

### Environment Variables ✅
```
✅ VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
✅ VITE_APPWRITE_PROJECT_ID=696b5bee001fe3af955a
✅ Database ID: cms_db (from appwrite.ts)
✅ Geoapify API Key: Configured (for location services)
```

**Files:**
- `.env.local` - Contains endpoint and project ID
- `.env.example` - Documents all expected variables
- `packages/shared-services/src/appwrite.ts` - Appwrite client configuration

### Expected Collections

The code expects these **11 collections** in the Appwrite database:

```
Database: cms_db

Collections:
1. ✓ posts              - Blog posts/content
2. ✓ products           - Product catalog
3. ✓ categories         - Product categories
4. ✓ orders             - Customer orders
5. ✓ order_items        - Individual items in orders (1:N relationship to orders)
6. ✓ coupons            - Discount coupons
7. ✓ coupon_usage       - Per-user coupon tracking (1:N to users)
8. ✓ cart_rules         - Shopping cart rules/conditions
9. ✓ analytics_events   - User behavior tracking (optional but configured)
10. ✓ notifications     - Admin notifications
11. ✓ (implicit) users  - Appwrite built-in users collection

Storage Buckets:
1. ✓ media             - Product images and media files
```

---

## VERIFICATION CHECKLIST

### PART 1: APPWRITE CONSOLE INSPECTION

**What to check:** Does the Appwrite console contain all expected collections?

**Steps:**
1. Open [Appwrite Console](https://cloud.appwrite.io)
2. Navigate to project: `696b5bee001fe3af955a`
3. Check Databases → cms_db
4. Verify all 11 collections exist

**Collections to verify:**
- [ ] posts
- [ ] products
- [ ] categories
- [ ] orders
- [ ] order_items
- [ ] coupons
- [ ] coupon_usage
- [ ] cart_rules
- [ ] analytics_events
- [ ] notifications
- [ ] Storage: media bucket

**Expected outcome:** All 11 collections present, each with appropriate attributes

---

### PART 2: SCHEMA VALIDATION

**What to check:** Do collections have the expected attributes and types?

**Critical attributes to verify:**

#### products collection
- [ ] id (string, primary)
- [ ] title (string)
- [ ] description (string)
- [ ] price (float)
- [ ] category (string, relation to categories)
- [ ] image (string, URL to media bucket)
- [ ] stock (integer)
- [ ] createdAt (datetime)
- [ ] updatedAt (datetime)

#### categories collection
- [ ] id (string, primary)
- [ ] name (string)
- [ ] slug (string)
- [ ] description (string)

#### orders collection
- [ ] id (string, primary)
- [ ] userId (string)
- [ ] status (enum: pending, processing, shipped, delivered, cancelled)
- [ ] total (float)
- [ ] createdAt (datetime)
- [ ] updatedAt (datetime)

#### order_items collection
- [ ] id (string, primary)
- [ ] orderId (string, relation to orders)
- [ ] productId (string)
- [ ] quantity (integer)
- [ ] price (float)

#### coupons collection
- [ ] id (string, primary)
- [ ] code (string, unique)
- [ ] discountType (enum: percentage, fixed)
- [ ] discountValue (float)
- [ ] maxUses (integer)
- [ ] expiresAt (datetime)
- [ ] active (boolean)

#### coupon_usage collection
- [ ] id (string, primary)
- [ ] userId (string)
- [ ] couponId (string, relation to coupons)
- [ ] usedAt (datetime)

#### cart_rules collection
- [ ] id (string, primary)
- [ ] name (string)
- [ ] condition (string, JSON)
- [ ] discount (float)
- [ ] active (boolean)

#### analytics_events collection
- [ ] id (string, primary)
- [ ] userId (string)
- [ ] eventType (string)
- [ ] eventData (string, JSON)
- [ ] timestamp (datetime)

#### notifications collection
- [ ] id (string, primary)
- [ ] adminId (string)
- [ ] title (string)
- [ ] message (string)
- [ ] read (boolean)
- [ ] createdAt (datetime)

---

### PART 3: API CONNECTION TEST

**What to check:** Can the app connect to Appwrite and perform basic operations?

**Test commands:**
```bash
cd /Users/danielshmuel.mirshukri/Downloads/purcari-israel

# Test 1: Build admin app (should succeed if Appwrite client initializes)
pnpm build 2>&1 | tail -20

# Test 2: Check if app loads without errors
pnpm dev -F admin 2>&1 | head -30
# (Ctrl+C to stop)
```

**Expected outcome:**
- Admin app builds without errors
- App initializes Appwrite client successfully
- No "Missing Appwrite configuration" errors

---

### PART 4: USER AUTHENTICATION TEST

**What to check:** Can users sign up and log in?

**Manual test:**
1. Run admin or storefront app in dev mode
2. Attempt user signup with test credentials:
   - Email: test@example.com
   - Password: TestPassword123
3. Verify account creation succeeds
4. Attempt login with created account
5. Verify authentication token is stored and persisted

**Expected outcome:**
- User creation succeeds
- Login succeeds
- User session persists across page reloads
- User ID is stored in app state

**Files involved:**
- `apps/admin/services/api/authApi.ts` - Admin auth service
- `apps/storefront/services/api/authApi.ts` - Storefront auth service

---

### PART 5: CRUD OPERATIONS TEST

**What to check:** Can the app read, create, update, delete data?

#### Read Test (GET)
```bash
# Test 1: Load products
# In browser console (admin app):
// Should return array of products from products collection
```

#### Create Test (POST)
```bash
# Test 2: Create product
# In admin app, create new product
# Verify it appears in Appwrite console
```

#### Update Test (PATCH)
```bash
# Test 3: Edit product
# Modify product details in admin
# Verify changes in Appwrite console
```

#### Delete Test (DELETE)
```bash
# Test 4: Delete product
# Delete product from admin
# Verify it's removed from Appwrite console
```

**Expected outcome:**
- All CRUD operations succeed
- Data persists in Appwrite
- Changes visible in both app and console

**Files involved:**
- `apps/admin/services/api/productsApi.ts`
- `apps/admin/services/api/ordersApi.ts`
- `apps/admin/services/api/couponsApi.ts`
- etc.

---

### PART 6: RELATIONSHIPS TEST

**What to check:** Do relationships between collections work?

**Test scenarios:**
1. Create product with category reference
   - [ ] Product creation accepts categoryId
   - [ ] Product correctly relates to category
   - [ ] Category can be queried through product

2. Create order with items
   - [ ] Order creation succeeds
   - [ ] Order_items relate correctly to order
   - [ ] Querying order shows its items

3. Coupon usage tracking
   - [ ] User can apply coupon
   - [ ] Coupon usage is recorded
   - [ ] Same user cannot reuse expired coupon

**Expected outcome:**
- All relationship queries work
- Foreign keys resolve correctly
- Join operations work as expected

---

### PART 7: PERMISSIONS TEST

**What to check:** Do collection permissions restrict access correctly?

**Test scenarios:**
1. Anonymous user cannot:
   - [ ] Delete products
   - [ ] Access admin notifications
   - [ ] Modify coupons

2. Authenticated user can:
   - [ ] View products
   - [ ] Create orders for themselves
   - [ ] View their own orders

3. Admin user can:
   - [ ] Manage all products
   - [ ] View all orders
   - [ ] Create admin notifications

**Expected outcome:**
- Permissions enforced at Appwrite level
- Unauthorized operations rejected
- Error messages clear and helpful

---

## COMMON ISSUES & SOLUTIONS

### Issue 1: "Collection Not Found" Error
**Symptom:** API calls fail with "Collection does not exist" error
**Causes:**
- Collection not created in Appwrite console
- Collection name mismatch (typo, case sensitivity)
- Wrong database ID

**Solution:**
1. Check Appwrite console for collection
2. Verify collection name matches `appwrite.ts`
3. Verify database ID is correct (`cms_db`)
4. Create missing collection in Appwrite console

### Issue 2: "Missing Appwrite Configuration" Error
**Symptom:** App throws error on load about missing env variables
**Causes:**
- `.env.local` file missing
- `VITE_APPWRITE_ENDPOINT` or `VITE_APPWRITE_PROJECT_ID` missing
- Wrong endpoint URL (should be `https://fra.cloud.appwrite.io/v1`)

**Solution:**
1. Ensure `.env.local` exists in project root
2. Copy from `.env.example` and fill in values
3. Restart dev server after changing .env

### Issue 3: "Permission Denied" on Read/Write
**Symptom:** API calls fail with permission denied even for basic operations
**Causes:**
- Collection permissions not set correctly
- User session invalid
- Collection requires admin API key (for server operations)

**Solution:**
1. Check collection permissions in Appwrite console
2. Ensure user is authenticated
3. For admin operations, use server-side functions
4. Check user has appropriate roles

### Issue 4: Relationships Not Working
**Symptom:** Foreign key queries fail or return null
**Causes:**
- Relationship attribute not created in target collection
- Reference to non-existent collection
- Wrong field name in relationship

**Solution:**
1. Verify relationship attribute exists in both collections
2. Ensure target collection exists
3. Verify field names match exactly
4. Check data has valid references (no orphaned records)

### Issue 5: Cloud Functions Not Found
**Symptom:** "Cloud Function 'users-management' not found" error
**Causes:**
- Function not deployed to Appwrite
- Function has different ID than expected
- Function not executable

**Solution:**
1. Deploy `users-management` Cloud Function
2. See `functions/users-management/README.md` for deployment instructions
3. Verify function ID matches `FUNCTION_USERS` in appwrite.ts
4. Test function execution in Appwrite console

---

## VALIDATION SCRIPT

Run this script to test critical operations programmatically:

```typescript
// test-appwrite-connection.ts
// (To be created in Part 3 of verification)

import { databases, APPWRITE_CONFIG } from '@shared/services/appwrite';
import { Query } from 'appwrite';

async function testAppwriteConnection() {
  console.log('🧪 Starting Appwrite Verification Tests...\n');
  
  const results: any = {
    connection: false,
    collections: {},
    operations: {}
  };
  
  try {
    // Test 1: Can we list collections?
    console.log('Test 1: Listing collections...');
    const collections = await databases.listCollections(
      APPWRITE_CONFIG.DATABASE_ID
    );
    console.log(`✅ Found ${collections.total} collections\n`);
    results.connection = true;
    
    // Test 2: Check each expected collection
    const expectedCollections = [
      'products', 'categories', 'orders', 'coupons',
      'coupon_usage', 'cart_rules', 'analytics_events',
      'notifications'
    ];
    
    for (const collName of expectedCollections) {
      try {
        const exists = collections.collections.some(
          (c: any) => c.name === collName
        );
        results.collections[collName] = exists ? '✅' : '❌';
        console.log(`${results.collections[collName]} ${collName}`);
      } catch (error: any) {
        results.collections[collName] = '❌';
        console.log(`❌ ${collName}`);
      }
    }
    
    console.log('\n✅ Verification Complete');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (error: any) {
    console.error('❌ Verification Failed:', error.message);
    process.exit(1);
  }
}

testAppwriteConnection();
```

---

## SUCCESS CRITERIA

Phase 8 is complete when:

✅ All 11 collections exist in Appwrite console
✅ Collection schemas match code expectations
✅ App connects to Appwrite without errors
✅ User signup/login works end-to-end
✅ CRUD operations succeed for all major collections
✅ Relationships work (products have categories, etc.)
✅ Permissions enforce correctly
✅ Cloud Functions (if used) deploy and execute
✅ No "collection not found" or permission errors during normal operations
✅ Sample data exists to support testing

---

## NEXT STEPS AFTER PHASE 8

### If Verification Succeeds ✅
→ Proceed to **Phase 10: E2E Testing & QA**
- Create comprehensive test scenarios
- Automate user flow testing
- Set up CI/CD test pipeline

### If Issues Found ⚠️
→ Create GitHub issues for each problem
→ Fix and re-verify in Phase 8 continuation
→ Document solutions in PITFALLS.md

### Parallel Work
→ Can start **Phase 6: Testing Infrastructure** while verification continues
- Setup Jest configuration
- Create test utilities
- Document testing patterns

---

## RESOURCES

**Appwrite Documentation:**
- [Databases & Collections](https://appwrite.io/docs/databases)
- [Relationships](https://appwrite.io/docs/relationships)
- [Permissions](https://appwrite.io/docs/permissions)
- [Cloud Functions](https://appwrite.io/docs/functions)
- [Storage](https://appwrite.io/docs/storage)

**Project Configuration:**
- `.env.local` - Environment variables
- `packages/shared-services/src/appwrite.ts` - Appwrite client
- `apps/admin/services/api/*` - API services expecting collections
- `apps/storefront/services/api/*` - Storefront API services

---

**Phase Owner:** DevOps/Database Specialist
**Next Review:** After completing collection verification
**Last Updated:** January 31, 2026
