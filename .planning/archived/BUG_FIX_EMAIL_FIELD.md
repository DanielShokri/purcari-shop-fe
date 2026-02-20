# 🔧 Bug Fix: Missing Email Field Error After Signup

**Issue:** After successful user registration, user is redirected to dashboard but encounters error:
```
ArgumentValidationError: Object is missing the required field `email`
Called by: orders:listByCustomer
```

**Root Cause:** 
The `orders.listByCustomer` query requires an `email` argument, but the user document was being created with `email` as an optional field. If the field was missing or undefined, the query would fail.

**Solution Implemented:**

### 1. Schema Change (convex/schema.ts)
Made `email` and `name` fields **required** (not optional):

```typescript
users: defineTable({
  // Required fields - must always be present after auth
  name: v.string(),
  email: v.string(),
  
  // Optional auth-related fields
  image: v.optional(v.string()),
  phone: v.optional(v.string()),
  // ... other optional fields
})
```

**Why:** Email and name are always provided by the Password auth provider's `profile()` function, and are essential for:
- Looking up users by email
- Querying orders by customer email
- Other downstream queries and features

### 2. Defensive Query Checks (apps/storefront/pages/DashboardPage.tsx)
Added additional defensive checks before passing arguments to queries:

**Before:**
```typescript
const convexOrders = useQuery(api.orders.listByCustomer, convexUser ? { email: convexUser.email } : "skip");
```

**After:**
```typescript
const convexOrders = useQuery(api.orders.listByCustomer, convexUser && convexUser.email ? { email: convexUser.email } : "skip");
```

**Why:** This prevents passing `{ email: undefined }` to the query if the user object exists but the email property is missing or undefined.

Similarly for addresses:
```typescript
const convexAddresses = useQuery(api.userAddresses.list, convexUser && convexUser._id ? { userId: convexUser._id } : "skip");
```

---

## Technical Details

### The Auth Callback Creates User with Email
In `convex/auth.ts`, the createOrUpdateUser callback spreads `args.profile`:

```typescript
return await ctx.db.insert("users", {
  ...args.profile,  // Contains {email, name} from provider
  createdAt: now,
  updatedAt: now,
});
```

The Password provider's `profile()` function always returns:
```typescript
return {
  email: emailResult.data,  // Validated email
  name: name || email.split("@")[0],  // Name or email prefix
};
```

So email and name SHOULD always be present.

### Why Email Being Optional Was Wrong
By marking email as optional (`v.optional(v.string())`), we were:
1. Allowing user documents to be created without email
2. Not ensuring the database schema matches our business requirements
3. Allowing dependent queries to fail with cryptic validation errors

### The Fix is Correct
Now that email and name are required:
1. The database enforces these fields must be present
2. Queries that depend on email can safely assume it exists
3. The code matches the runtime behavior of the auth system

---

## Testing the Fix

1. **Clear browser cache and Convex database** (if testing locally)
2. **Signup with a new account**
3. **Verify:**
   - ✅ User created in Convex with email field populated
   - ✅ Redirect to dashboard succeeds
   - ✅ Orders list loads without errors
   - ✅ No errors in browser console

---

## Related Files Changed
- `convex/schema.ts` - User table schema
- `apps/storefront/pages/DashboardPage.tsx` - Query parameter logic

## Commit
```
ab2f32e fix: make email and name required in users schema, add defensive query checks
```

---

## Summary

✅ **Problem Solved:** Email field is now guaranteed to be present in user documents  
✅ **Defensive Checks Added:** Query parameters validated before use  
✅ **Build Passes:** No errors or TypeScript issues  
✅ **Ready to Test:** Complete signup → dashboard flow should work

