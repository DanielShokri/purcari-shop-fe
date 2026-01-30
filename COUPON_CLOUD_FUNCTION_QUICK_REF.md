# Quick Reference: Coupon Cloud Function Setup

## TL;DR - Quick Steps

1. **Create Collection** in Appwrite:
   ```
   Name: coupon_usage
   Fields: userId, userEmail, couponId, couponCode, usageCount, lastUsedAt
   Index: (userEmail, couponId), (couponCode)
   ```

2. **Create Cloud Function** in Appwrite:
   ```
   Name: increment-coupon-usage
   Runtime: Node.js 18+
   Function ID: increment-coupon-usage
   ```

3. **Copy Code** from `COUPON_CLOUD_FUNCTION_SETUP.md` (Implementation section)

4. **Set Environment Variables**:
   ```
   APPWRITE_API_ENDPOINT = https://your-domain/v1
   APPWRITE_PROJECT_ID = your-id
   APPWRITE_API_KEY = service-key
   APPWRITE_DATABASE_ID = default
   COUPONS_COLLECTION_ID = coupons
   COUPON_USAGE_COLLECTION_ID = coupon_usage
   ```

5. **Deploy** and test

## Function Signature

**Input:**
```json
{
  "couponCode": "SUMMER2024",
  "userEmail": "customer@example.com",
  "userId": "user_123" // optional
}
```

**Output:**
```json
{
  "success": true,
  "message": "Coupon usage incremented successfully",
  "usageCount": 1,
  "couponCode": "SUMMER2024",
  "userEmail": "customer@example.com"
}
```

## What It Does

- ✅ Looks up coupon by code
- ✅ Finds or creates usage record for this user + coupon
- ✅ Increments usage count
- ✅ Updates last used timestamp
- ✅ Handles errors gracefully

## When It's Called

After successful order creation:
1. Customer places order with applied coupon
2. Order document is created in database
3. Cloud Function is called to track usage
4. Frontend logs result but doesn't block

## Database Schema

```
coupon_usage
├── userId (String, optional) - Appwrite user ID
├── userEmail (String, required) - Customer email
├── couponId (String, required) - Reference to coupon
├── couponCode (String, required) - Uppercase code
├── usageCount (Integer, required) - Times used
└── lastUsedAt (DateTime, required) - Last usage

Indexes:
- (userEmail, couponId) - Primary lookup
- (couponCode) - Verification
```

## Testing

```bash
# Test with curl
curl -X POST \
  https://your-domain/v1/functions/increment-coupon-usage/executions \
  -H "X-Appwrite-Project: your-project-id" \
  -H "X-Appwrite-Key: your-api-key" \
  -d '{"couponCode":"TEST","userEmail":"test@example.com","userId":"user_1"}'
```

## Frontend Config

Ensure in `.env`:
```
VITE_APPWRITE_FUNCTION_INCREMENT_COUPON_USAGE=increment-coupon-usage
```

## Monitoring

- Check logs: Appwrite Console → Functions → increment-coupon-usage → Executions
- Browser console: `[OrdersApi] Coupon usage incremented successfully`
- No special error handling needed - order succeeds regardless of function result

## Common Errors

| Error | Fix |
|-------|-----|
| 404 Function not found | Deploy function and verify ID |
| 404 Coupon not found | Check coupon exists with uppercase code |
| Database permission denied | Use service account API key |
| Collection not found | Create coupon_usage collection |

## Full Documentation

See `COUPON_CLOUD_FUNCTION_SETUP.md` for detailed implementation guide.
