# 🚀 Quick Start: Testing the New Auth System

## What Changed?

Your authentication system is now **100% Convex Auth** - no more Appwrite!

- ✅ Registration: Email + password + **phone** (new!)
- ✅ Login: Email + password
- ✅ Server-side validation: Secure, type-safe
- ✅ Notifications: Beautiful Chakra UI toasts in Hebrew
- ✅ Auto-login: Immediate redirect to dashboard after signup

---

## How to Test

### 1. Register a New User

```
URL: http://localhost:5173/login
Tab: "צרו חשבון עכשיו" (Create Account)

Fill:
- Name: דוד כהן (any name, 2+ chars)
- Email: test@example.com (any valid email)
- Password: test1234 (4+ chars)
- Phone: 050-1234567 (standard Israeli format)

Click: הרשמה (Register)

Expect:
- Green toast: "ברוכים הבאים! החשבון נוצר בהצלחה"
- Redirect to /dashboard
- Your name displayed at top
```

### 2. Login with That Account

```
URL: http://localhost:5173/login
Tab: התחברות (default - Sign In)

Fill:
- Email: test@example.com
- Password: test1234

Click: התחברות (Sign In)

Expect:
- Green toast: "התחברת בהצלחה"
- Redirect to /dashboard
- Your profile loads
```

### 3. Logout

```
Mobile: Click hamburger → "התנתקות"
Desktop: Click profile icon → "התנתקות"

Expect:
- Green toast: "התנתקת בהצלחה"
- Redirect to home page
- Auth cleared
```

### 4. Test Error Handling

#### Try duplicate email:
```
Register with same email again
Expected: "כתובת אימייל זו כבר רשומה במערכת"
```

#### Try invalid email:
```
Email: "not-an-email"
Expected: "כתובת אימייל לא תקינה"
```

#### Try short password:
```
Password: "123"
Expected: "הסיסמה חייבת להכיל לפחות 4 תווים"
```

#### Try wrong password on login:
```
Email: test@example.com
Password: wrongpassword
Expected: Auth error message (Convex Auth will reject)
```

### 5. Add Products to Cart (Test Toasts)

```
Homepage: Click on a product
Click: "הוסף לסל" button

Expect:
- Orange/blue Chakra toast: "הוסף לסל" with "המוצר נוסף לסל"
- Redux cart updates (Redux DevTools if you have it)

Remove item from cart:
Expected: 
- Blue Chakra toast: "הסר מסל"
```

---

## Verification Checklist

### Backend (Convex)
- [ ] Go to Convex dashboard
- [ ] Check `users` table
- [ ] Find your test user
- [ ] **IMPORTANT:** Verify `phone` field is populated!
- [ ] All fields present: name, email, phone, status='active'

### Frontend (UI)
- [ ] No red errors in browser console
- [ ] No "authApi is not defined" errors
- [ ] Chakra toasts appear (they're styled with Chakra)
- [ ] Hebrew text displays correctly (right-to-left)

### Build
```bash
npm run type-check  # Should pass
npm run build       # Should succeed
```

---

## Key Files for Reference

**If you need to understand the code:**

```
convex/auth.ts              # Password provider config + validation
convex/users.ts             # createOrUpdateUserProfile mutation
components/login/AuthForm.tsx   # Registration/login form
store/index.ts              # Redux store (simplified)
```

**Old files that are GONE:**
- ❌ `services/api/authApi.ts` (deleted)
- ❌ Redux `useToast` hook (use Chakra instead)

---

## Troubleshooting

### "Index providerAndAccountId not found"
✅ **Fixed** - Schema was already updated

### "userProfile is not a function"
❌ Check that `createOrUpdateUserProfile` mutation is called after signup
📍 AuthForm.tsx line 81

### Toasts not appearing
❌ Check Chakra UI is installed and ChakraProvider is in index.tsx
✅ Already done - should work

### Phone not being stored
❌ Verify createOrUpdateUserProfile is called with phone
✅ It should be - check network tab in DevTools

### "user is undefined"
✅ Normal - user loads asynchronously, dashboard handles this

---

## What's Different?

### Before (Appwrite)
```typescript
const { register } = useRegisterMutation();
await register({ email, password }).unwrap();
// Phone stored in Appwrite preferences (bad UX)
```

### After (Convex) ✨
```typescript
await signIn("password", { email, password, name, flow: "signUp" });
await createUserProfile({ phone, name, email });
// Phone stored in users table (proper normalization)
// Happens automatically!
```

---

## Need Help?

**Check these files for clues:**

1. **Auth not working?** → `convex/auth.ts` (validation rules)
2. **Phone not saving?** → `convex/users.ts` (createOrUpdateUserProfile)
3. **Toasts not showing?** → `apps/storefront/index.tsx` (ChakraProvider)
4. **Login form issues?** → `apps/storefront/components/login/AuthForm.tsx`

---

## Performance Notes

✅ **What improved:**
- Removed large Appwrite SDK
- Simplified Redux store (RTK Query removed)
- Direct Convex queries (no middleware)
- Smaller bundle size

✅ **What stayed efficient:**
- Cart management (Redux is great for this)
- Product list (uses Convex queries)
- Checkout (optimized payment flow)

---

## Ready?

```
1. Start dev server: npm run dev
2. Navigate to: http://localhost:5173/login
3. Click "צרו חשבון עכשיו"
4. Fill the form
5. Click הרשמה

You should see:
✅ Chakra toast (green)
✅ Redirect to dashboard
✅ Your name displayed
✅ Phone in Convex database

That's it! 🎉
```

---

**For detailed information, see: AUTH_SYSTEM_OVERHAUL_COMPLETE.md**
