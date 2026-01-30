# Phase 8 - Completion Instructions

**Status:** Ready to Complete (Option A)  
**Time Required:** 15-20 minutes  
**Date:** January 31, 2026

---

## ⚠️ BEFORE YOU START

You need your **Appwrite API Key** to complete this phase. Here's how to get it:

### Getting Your Appwrite API Key

1. **Go to Appwrite Console:**
   ```
   https://cloud.appwrite.io
   ```

2. **Select your project:**
   - Project: `696b5bee001fe3af955a`

3. **Navigate to Settings:**
   - Click **Settings** (bottom left icon or menu)
   - Select **API Keys**

4. **Copy your API Key:**
   - You'll see a list of API keys
   - Copy the **API Key** value (it looks like a long random string)
   - ⚠️ **IMPORTANT:** This is sensitive - keep it secure!

---

## Option A: Automated Script (RECOMMENDED)

We've created a script that automatically creates all missing collections for you.

### Step 1: Run the Script

```bash
cd /Users/danielshmuel.mirshukri/Downloads/purcari-israel

# Replace YOUR_API_KEY with the key you copied above
API_KEY=YOUR_API_KEY node scripts/complete-phase8.mjs
```

**Example:**
```bash
API_KEY=<insert your actual key here> node scripts/complete-phase8.mjs
```

### Step 2: What the Script Does

✅ Creates `posts` collection with proper schema  
✅ Creates `coupon_usage` collection with indexes  
✅ Creates necessary attributes and permissions  
✅ Verifies all 10 collections are accessible  
✅ Reports results

### Step 3: Verify Success

The script will output something like:

```
✅ products (28 documents)
✅ categories (4 documents)
✅ orders (5 documents)
✅ order_items (8 documents)
✅ coupons (1 document)
✅ cart_rules (1 document)
✅ analytics_events (532 documents)
✅ posts (0 documents)
✅ coupon_usage (0 documents)
✅ notifications (? documents)

Results: 10/10 collections accessible
✅ ALL COLLECTIONS VERIFIED!
```

**If you see this:** Phase 8 is complete! Proceed to "Next Steps" below.

---

## Option B: Manual Creation (If Script Fails)

If the automated script doesn't work, you can create collections manually in Appwrite Console.

### Collection 1: posts

**Location:** https://cloud.appwrite.io  
**Navigation:** Project → Database (cms_db) → Collections → Create Collection

**Create Collection:**
- Collection ID: `posts`
- Collection Name: `Blog Posts`

**Add Attributes:**

| Attribute | Type | Required | Size |
|-----------|------|----------|------|
| title | String | Yes | 255 |
| slug | String | Yes | 255 |
| content | String | Yes | 65535 |
| excerpt | String | No | 500 |
| author | String | No | 255 |
| image | String | No | 512 |
| publishedAt | DateTime | No | - |
| createdAt | DateTime | Yes | - |
| updatedAt | DateTime | Yes | - |

**Set Permissions:**
- Readers: `any`
- Writers: `users`

---

### Collection 2: coupon_usage

**Navigation:** Project → Database (cms_db) → Collections → Create Collection

**Create Collection:**
- Collection ID: `coupon_usage`
- Collection Name: `Coupon Usage Tracking`

**Add Attributes:**

| Attribute | Type | Required | Size |
|-----------|------|----------|------|
| userId | String | Yes | 36 |
| couponId | String | Yes | 36 |
| usedAt | DateTime | Yes | - |
| createdAt | DateTime | Yes | - |

**Create Indexes:**
1. Index Key: `userId_couponId`
   - Type: `key`
   - Attributes: `userId`, `couponId`

2. Index Key: `userId`
   - Type: `key`
   - Attributes: `userId`

**Set Permissions:**
- Readers: `users`
- Writers: `users`

---

### Collection 3: notifications (Permissions Fix)

**Navigation:** Project → Database (cms_db) → Collections → notifications → Settings

**Update Permissions:**
- Readers: `users`
- Writers: `cloud-functions`

---

## Next Steps After Completion

### 1. Verify Everything Works

Run the verification script:

```bash
node scripts/test-appwrite-simple.mjs
```

Should show:
```
✅ All basic verifications passed!
```

### 2. Make Final Commit

```bash
git add -A
git commit -m "Phase 8 - All 10 collections created and verified"
```

### 3. Update Project Status

Phase 8 is now **COMPLETE** ✅

### 4. Next Phase

You can now start **Phase 10: E2E Testing**

See: `.planning/NEXT_PHASES_ROADMAP.md`

---

## Troubleshooting

### Error: "API Key not provided"

```
❌ MISSING API KEY
You need to provide your Appwrite API key to complete Phase 8.
```

**Solution:** Follow "Getting Your Appwrite API Key" section at top of this document.

---

### Error: "API key is invalid"

```
❌ Failed with 401 Unauthorized
```

**Solution:**
1. Double-check you copied the full API key (no spaces before/after)
2. Verify the API key is still valid (it might have been regenerated)
3. Get a fresh API key from Appwrite Console → Settings → API Keys

---

### Error: "Cannot connect to Appwrite"

```
❌ Network error: Unable to reach endpoint
```

**Solution:**
1. Check your internet connection
2. Verify endpoint is correct: `https://fra.cloud.appwrite.io/v1`
3. Try from a different network if possible

---

### Error: "Project not found"

```
❌ Project ID mismatch
```

**Solution:**
- Verify you're in the correct project: `696b5bee001fe3af955a`
- Check the URL: https://cloud.appwrite.io

---

### Partial Success: Some Collections Created, Others Failed

This is normal if some collections already exist. The script logs:
- ✅ Created successfully
- ⚠️ Already exists (no action needed)
- ❌ Error (may need manual creation)

**Solution:** Verify with:
```bash
node scripts/test-appwrite-simple.mjs
```

If all 10 show ✅, you're good to proceed.

---

## What Gets Created

### posts Collection

**Purpose:** Blog posts and content management  
**Fields:**
- `title`: Post title
- `slug`: URL-friendly identifier
- `content`: Full post content
- `excerpt`: Short summary
- `author`: Author name
- `image`: Featured image URL
- `publishedAt`: Publication date
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Used by:**
- Admin dashboard: Create/edit/delete blog posts
- Future: Blog page on storefront

---

### coupon_usage Collection

**Purpose:** Track which users have used which coupons  
**Fields:**
- `userId`: User who used the coupon
- `couponId`: Coupon that was used
- `usedAt`: When it was used
- `createdAt`: Record creation time

**Used by:**
- Storefront: Prevent duplicate coupon usage
- Admin: View coupon usage statistics

---

### notifications Collection (Fix)

**Purpose:** Admin notifications and alerts  
**Status:** Already exists, just needs permission fix  
**Permissions needed:**
- Read: Users (to see their own notifications)
- Write: Cloud Functions (for backend to create notifications)

---

## Files Involved

**Scripts:**
- `scripts/complete-phase8.mjs` - Automated creation script
- `scripts/test-appwrite-simple.mjs` - Verification script

**Documentation:**
- `.planning/PHASE_8_COMPLETION_INSTRUCTIONS.md` - This file
- `.planning/PHASE_8_STATUS_REPORT.md` - Detailed findings
- `.planning/PHASE_8_NEXT_ACTIONS.md` - Decision guide

**Configuration:**
- `.env.local` - Already has Appwrite credentials (verified working)

---

## Support

If you encounter issues:

1. **Check documentation:**
   - See "Troubleshooting" section above
   - Review `.planning/PHASE_8_STATUS_REPORT.md`
   - Check `.planning/PHASE_8_NEXT_ACTIONS.md`

2. **Verify setup:**
   - API key is valid and not expired
   - Internet connection is stable
   - Appwrite project ID is correct

3. **Try manual approach:**
   - If automated script fails repeatedly
   - Use "Option B: Manual Creation" section
   - Steps are simple and straightforward

---

## Timeline

- **Phase 8 so far:** ~1.5 hours (research + verification)
- **Phase 8 remaining:** 15-20 minutes (this step)
- **Total Phase 8:** ~2 hours
- **Total project so far:** ~4 hours (Phases 1-8)

---

**Status:** Ready for completion  
**Next Phase:** Phase 10 (E2E Testing)  
**Recommendation:** Use automated script (Option A)

When ready, follow "Option A: Automated Script" section above.
