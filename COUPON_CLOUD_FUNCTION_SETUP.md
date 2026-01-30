# Coupon Cloud Function Setup Guide

## Overview

This guide provides instructions for the Admin Dashboard team to create the required Appwrite Cloud Function for incrementing coupon usage. This function is critical for the complete Coupon System Integration.

## Current Status

The **Storefront Frontend** (`purcari-israel`) has been updated to:
- Validate coupons with per-user usage limit checks
- Store coupon snapshots in orders
- Call the Cloud Function after successful order creation
- **All frontend code is production-ready and fully typed**

The function is currently **not yet implemented** and needs to be created by the Admin Dashboard team.

---

## Cloud Function Requirements

### Function Details

| Property | Value |
|----------|-------|
| **Function Name** | `increment-coupon-usage` |
| **Function ID** | `increment-coupon-usage` |
| **Runtime** | Node.js 18+ (or latest compatible) |
| **Timeout** | 30 seconds (default) |
| **Environment Variable** | `VITE_APPWRITE_FUNCTION_INCREMENT_COUPON_USAGE` |

### Input Payload Format

The function receives a JSON payload with the following structure:

```json
{
  "couponCode": "SUMMER2024",
  "userEmail": "customer@example.com",
  "userId": "user_123" // Optional - only for authenticated users
}
```

**Field Descriptions:**
- **couponCode** (string, required): Coupon code in UPPERCASE
- **userEmail** (string, required): Customer email address (used for tracking)
- **userId** (string, optional): Appwrite user ID (only provided for authenticated users; guest users won't have this)

### Expected Behavior

1. **Receive** the execution request with the payload
2. **Check** if a usage record exists for this user + coupon combination in `coupon_usage` collection
3. **If exists**: Increment the `usageCount` by 1 and update `lastUsedAt` timestamp
4. **If not exists**: Create a new usage record with:
   - `usageCount: 1`
   - `lastUsedAt: ISO timestamp`
   - `userEmail: from payload`
   - `userId: from payload (if provided)`
   - `couponId: coupon document ID (lookup from code)`
   - `couponCode: from payload (uppercase)`
5. **Return** success response
6. **Handle errors** gracefully (log but don't crash)

### Return Response

**Success Case:**
```json
{
  "success": true,
  "message": "Coupon usage incremented successfully",
  "usageCount": 3
}
```

**Error Cases:**
```json
{
  "success": false,
  "error": "Coupon not found",
  "code": "COUPON_NOT_FOUND"
}
```

---

## Database Collections

The function will work with these Appwrite collections:

### 1. `coupons` Collection
**Purpose**: Store coupon definitions (read-only)

**Key Fields:**
- `$id` - Document ID
- `code` - Coupon code (stored in UPPERCASE)
- `status` - 'active' | 'inactive' | 'archived'
- `discountType` - 'percentage' | 'fixed' | 'free_shipping' | 'free_product' | 'buy_x_get_y'
- `discountValue` - Discount amount or percentage
- `usageLimitTotal` - Max total uses (optional)
- `usageLimitPerUser` - Max uses per customer (default: 1)

### 2. `coupon_usage` Collection (NEW)
**Purpose**: Track per-user coupon usage

**Schema (create if not exists):**
```
Collection Name: coupon_usage
Attributes:
  - userId: String (optional) - Appwrite user ID for authenticated users
  - userEmail: String (required) - Customer email for tracking
  - couponId: String (required) - Reference to coupon document
  - couponCode: String (required) - Coupon code (uppercase)
  - usageCount: Integer (required) - Number of times used
  - lastUsedAt: DateTime (required) - Last usage timestamp
  
Indexes:
  - Compound index: (userEmail, couponId) - for fast lookups
  - Index on couponCode - for verification
```

### 3. `orders` Collection
**Purpose**: Store customer orders (will now include coupon snapshot)

**New Fields Added:**
```
- appliedCouponCode: String (optional) - Code that was applied
- appliedCouponDiscount: Double (optional) - Discount amount in ILS
- appliedCouponType: String (optional) - Type of discount
```

---

## Implementation Guide

### Step 1: Create Database Collection (if not exists)

In Appwrite Console:

1. Go to **Database** → **Collections**
2. Click **Create Collection**
3. Name: `coupon_usage`
4. Add Attributes:

```
Attribute Name          Type        Size    Required    Default
userId                  String      256     No          -
userEmail               String      255     Yes         -
couponId                String      256     Yes         -
couponCode              String      50      Yes         -
usageCount              Integer     -       Yes         1
lastUsedAt              DateTime    -       Yes         now()
```

5. Create Indexes:
   - **Index 1**: Attributes: `[userEmail, couponId]` - Type: Unique (for lookup)
   - **Index 2**: Attributes: `[couponCode]` - Type: Key (for verification)

6. **Permissions**: Allow the Cloud Function service account to read/write

### Step 2: Create Cloud Function

In Appwrite Console:

1. Go to **Functions** → **Create Function**
2. Set Details:
   - Name: `increment-coupon-usage`
   - Runtime: `Node.js 18` (or latest)
   - Events: (leave empty - called manually)
   - Execute as: `Server` (default)
3. Copy the function ID (usually auto-generated)
4. Create function and proceed to code editor

### Step 3: Implement Cloud Function Code

Replace the default function code with:

```javascript
/**
 * Appwrite Cloud Function: Increment Coupon Usage
 * 
 * Atomically increments the usage count for a coupon by a specific user.
 * If no usage record exists, creates a new one.
 * 
 * Triggered by: Storefront Frontend after successful order creation
 * 
 * Expected Payload:
 * {
 *   "couponCode": "SUMMER2024",
 *   "userEmail": "customer@example.com",
 *   "userId": "user_123" // Optional
 * }
 */

const sdk = require('node-appwrite');

module.exports = async function (req, res) {
  // Initialize Appwrite SDK
  const client = new sdk.Client();
  const databases = new sdk.Databases(client);

  // Set credentials from environment
  client
    .setEndpoint(process.env.APPWRITE_API_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  try {
    // Parse payload
    const payload = JSON.parse(req.body);
    const { couponCode, userEmail, userId } = payload;

    // Validate input
    if (!couponCode || !userEmail) {
      return res.json(
        { success: false, error: 'Missing required fields', code: 'INVALID_PAYLOAD' },
        400
      );
    }

    const normalizedCode = couponCode.toUpperCase();
    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'default';
    const COUPONS_COLLECTION_ID = process.env.COUPONS_COLLECTION_ID || 'coupons';
    const USAGE_COLLECTION_ID = process.env.COUPON_USAGE_COLLECTION_ID || 'coupon_usage';

    console.log(`[IncrementCouponUsage] Processing: ${normalizedCode} for ${userEmail}`);

    // Step 1: Lookup coupon by code
    let coupon;
    try {
      const couponsResponse = await databases.listDocuments(
        DATABASE_ID,
        COUPONS_COLLECTION_ID,
        [new sdk.Query.equal('code', normalizedCode), new sdk.Query.limit(1)]
      );

      if (couponsResponse.documents.length === 0) {
        console.error(`[IncrementCouponUsage] Coupon not found: ${normalizedCode}`);
        return res.json(
          { success: false, error: 'Coupon not found', code: 'COUPON_NOT_FOUND' },
          404
        );
      }

      coupon = couponsResponse.documents[0];
    } catch (error) {
      console.error(`[IncrementCouponUsage] Error looking up coupon:`, error);
      throw error;
    }

    // Step 2: Check for existing usage record
    let usageRecord;
    let isNewRecord = false;

    try {
      const usageResponse = await databases.listDocuments(
        DATABASE_ID,
        USAGE_COLLECTION_ID,
        [
          new sdk.Query.equal('userEmail', userEmail),
          new sdk.Query.equal('couponId', coupon.$id),
          new sdk.Query.limit(1),
        ]
      );

      if (usageResponse.documents.length > 0) {
        usageRecord = usageResponse.documents[0];
      } else {
        isNewRecord = true;
      }
    } catch (error) {
      console.error(`[IncrementCouponUsage] Error checking usage record:`, error);
      throw error;
    }

    // Step 3: Update or create usage record
    try {
      const now = new Date().toISOString();

      if (isNewRecord) {
        // Create new usage record
        usageRecord = await databases.createDocument(
          DATABASE_ID,
          USAGE_COLLECTION_ID,
          sdk.ID.unique(),
          {
            userId: userId || undefined,
            userEmail,
            couponId: coupon.$id,
            couponCode: normalizedCode,
            usageCount: 1,
            lastUsedAt: now,
          }
        );

        console.log(
          `[IncrementCouponUsage] Created new usage record: ${usageRecord.$id}`
        );
      } else {
        // Update existing usage record
        const newUsageCount = (usageRecord.usageCount || 0) + 1;

        usageRecord = await databases.updateDocument(
          DATABASE_ID,
          USAGE_COLLECTION_ID,
          usageRecord.$id,
          {
            usageCount: newUsageCount,
            lastUsedAt: now,
          }
        );

        console.log(
          `[IncrementCouponUsage] Updated usage record: ${usageRecord.$id}, new count: ${newUsageCount}`
        );
      }

      // Success response
      return res.json({
        success: true,
        message: 'Coupon usage incremented successfully',
        usageCount: usageRecord.usageCount,
        couponCode: normalizedCode,
        userEmail,
      });
    } catch (error) {
      console.error(`[IncrementCouponUsage] Error updating usage record:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`[IncrementCouponUsage] Unexpected error:`, error);
    return res.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      500
    );
  }
};
```

### Step 4: Configure Environment Variables

In Appwrite Console → Function Settings:

Add these environment variables:

```
Key                                Value
APPWRITE_API_ENDPOINT              https://your-appwrite-domain/v1
APPWRITE_PROJECT_ID                your-project-id
APPWRITE_API_KEY                   your-api-key (service account key)
APPWRITE_DATABASE_ID               default
COUPONS_COLLECTION_ID              coupons
COUPON_USAGE_COLLECTION_ID         coupon_usage
```

**Getting API Key:**
1. Go to **Settings** → **API Keys**
2. Create a new API key with scopes:
   - `databases.read`
   - `databases.write`
   - `documents.read`
   - `documents.write`

### Step 5: Deploy Function

1. Click **Deploy** in the function editor
2. Wait for deployment to complete
3. Note the **Function ID** (usually: `increment-coupon-usage`)

### Step 6: Test Function

Use Appwrite Console or cURL:

```bash
curl -X POST \
  https://your-appwrite-domain/v1/functions/increment-coupon-usage/executions \
  -H "X-Appwrite-Project: your-project-id" \
  -H "X-Appwrite-Key: your-api-key" \
  -d '{
    "couponCode": "SUMMER2024",
    "userEmail": "test@example.com",
    "userId": "user_123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Coupon usage incremented successfully",
  "usageCount": 1,
  "couponCode": "SUMMER2024",
  "userEmail": "test@example.com"
}
```

---

## Configuration in Storefront Frontend

Once the Cloud Function is deployed, the Admin Dashboard team should:

### Update Environment Variable

In the Storefront Frontend project (`.env` file), ensure:

```env
VITE_APPWRITE_FUNCTION_INCREMENT_COUPON_USAGE=increment-coupon-usage
```

Or update `services/appwrite.ts` if the function ID is different:

```typescript
export const APPWRITE_CONFIG = {
  // ... existing config
  FUNCTION_INCREMENT_COUPON_USAGE: import.meta.env.VITE_APPWRITE_FUNCTION_INCREMENT_COUPON_USAGE || 'increment-coupon-usage',
};
```

### Verify Connection

The Frontend will automatically:
1. Call the function after order creation
2. Pass the coupon code, customer email, and user ID (if authenticated)
3. Log function execution results to browser console
4. Non-blocking: Orders succeed even if function call fails

---

## Error Handling & Logging

### Cloud Function Logs

Monitor function execution in Appwrite Console:
1. Go to **Functions** → **increment-coupon-usage** → **Executions**
2. View logs for each execution
3. Check for errors in execution details

### Frontend Logging

The Frontend logs all function calls to browser console:

```javascript
[OrdersApi] Incrementing coupon usage for: SUMMER2024
[OrdersApi] Coupon usage incremented successfully
// OR
[OrdersApi] Error incrementing coupon usage: Function execution failed
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Function not found" | Verify function ID is correct and deployed |
| "Database not found" | Check DATABASE_ID environment variable |
| "Collection not found" | Ensure `coupon_usage` collection exists |
| "Permission denied" | Verify API key has correct scopes |
| "Coupon not found" | Ensure coupon code exists in `coupons` collection (uppercase) |

---

## Verification Checklist

Before marking as complete:

- [ ] `coupon_usage` collection created with all required attributes
- [ ] Indexes created on (userEmail, couponId) and couponCode
- [ ] Cloud Function `increment-coupon-usage` deployed
- [ ] Environment variables configured
- [ ] Function tested successfully with test payload
- [ ] Storefront Frontend environment variable updated
- [ ] Function ID matches configuration
- [ ] Error logging configured
- [ ] Database permissions set for function service account

---

## Integration Points

### Frontend Integration (Already Implemented)

**Files Modified:**
- `services/appwrite.ts` - Added Functions import and config
- `services/api/couponsApi.ts` - Added incrementCouponUsage mutation
- `services/api/ordersApi.ts` - Calls function after order creation
- `types.ts` - Added CouponUsageRecord interface

**How It Works:**
1. Customer validates coupon in checkout (calls `validateCoupon` query)
2. Customer applies coupon to order
3. On order submission, `createOrder` mutation runs
4. After order document is created, `incrementCouponUsage` function is called
5. Frontend logs result but doesn't block order creation

### Expected Data Flow

```
Checkout Form
    ↓
Validate Coupon (validateCoupon query)
    ↓
Apply Coupon to Cart (Redux action)
    ↓
Submit Order (createOrder mutation)
    ↓
Create Order Document (databases.createDocument)
    ↓
Call Cloud Function (incrementCouponUsage)
    ↓
Create/Update coupon_usage Record
    ↓
Order Confirmation Page
```

---

## Performance Considerations

### Database Indexes

The compound index on (userEmail, couponId) ensures:
- O(1) lookup for existing usage records
- Fast per-user limit checks
- Efficient duplicate prevention

### Cloud Function Performance

- **Expected execution time**: 200-500ms
- **Timeout**: 30 seconds (default)
- **Retries**: Non-blocking (order succeeds regardless)

### Atomic Operations

- Creation and updates are atomic
- No race conditions possible with Appwrite's document locking
- Safe for concurrent requests

---

## Maintenance & Monitoring

### Regular Checks

1. **Weekly**: Review function execution logs for errors
2. **Monthly**: Check usage statistics:
   ```
   SELECT COUNT(*) as total_uses FROM coupon_usage
   SELECT userEmail, COUNT(*) as uses FROM coupon_usage GROUP BY userEmail
   ```
3. **Quarterly**: Review and optimize indexes if needed

### Alerts to Configure

Set up monitoring for:
- Function execution errors
- Timeout events
- Database permission errors
- Invalid payload submissions

### Backup & Recovery

- Ensure regular database backups
- Test recovery procedures quarterly
- Document rollback procedures

---

## Support & Questions

**For Issues:**
1. Check function execution logs in Appwrite Console
2. Verify environment variables are set correctly
3. Test function directly with cURL
4. Check browser console for Frontend error messages

**Documentation References:**
- [Appwrite Cloud Functions](https://appwrite.io/docs/products/functions)
- [Node.js SDK](https://appwrite.io/docs/sdk/nodejs)
- [Database API](https://appwrite.io/docs/apis/rest#databases)

---

## Timeline & Handoff

**This setup should take approximately:**
- 15-30 minutes: Database collection creation and indexing
- 15-20 minutes: Cloud Function implementation and deployment
- 10-15 minutes: Environment configuration and testing
- **Total: ~45-60 minutes**

Once complete, the Coupon System will be fully operational end-to-end!

---

**Version**: 1.0  
**Last Updated**: 2026-01-30  
**Status**: Ready for Implementation
