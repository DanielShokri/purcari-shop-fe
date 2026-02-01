# 🚀 Quick Start: Auth System Testing

## ⚡ TL;DR - Test in 5 Minutes

### Setup
1. `npm install` (if needed)
2. `npm run dev` to start dev server
3. Navigate to `http://localhost:5173/login`

### Test Signup
```
Form:
  Name: "test user"
  Email: "test@example.com"
  Password: "1234"
  Phone: "050-1234567"

Expected:
  ✓ Toast: "ברוכים הבאים! החשבון נוצר בהצלחה"
  ✓ Redirect to /dashboard
  ✓ User visible in Convex Dashboard
```

### Test Login
```
Form:
  Email: "test@example.com"
  Password: "1234"

Expected:
  ✓ Toast: "התחברת בהצלחה"
  ✓ Redirect to /dashboard
  ✓ User data loads
```

### Test Errors
```
Try:
  - Email: "invalid"
  - Password: "123"
  - Name: "x"

Expected:
  ✓ Form validation errors show
  ✓ User-friendly messages in Hebrew
```

---

## 📋 Testing Checklist (Quick)

**Signup:**
- [ ] Valid signup works
- [ ] User created in DB
- [ ] Redirect happens
- [ ] Phone stored correctly

**Login:**
- [ ] Valid login works
- [ ] Correct email/password required
- [ ] Wrong password → error
- [ ] Non-existent email → error

**Validation:**
- [ ] Invalid email → error
- [ ] Password < 4 chars → error
- [ ] Name < 2 chars → error
- [ ] Phone format checked

**Edge Cases:**
- [ ] Duplicate email → error
- [ ] Form toggles work
- [ ] Redirect param works (?redirect=products)
- [ ] Page refresh stays logged in
- [ ] Protected routes work

---

## 🔧 Key Files

```
convex/auth.ts              → Auth configuration & callbacks
convex/users.ts             → User queries and mutations
convex/schema.ts            → Database schema

apps/storefront/components/login/AuthForm.tsx     → Frontend form
apps/storefront/pages/LoginPage.tsx                → Page component
```

---

## 🐛 If Something Breaks

### Error: "User not found"
- Check: User doc created in Convex Dashboard
- Fix: Refresh page or clear browser cache

### Error: "tokenIdentifier undefined"
- This should not happen - all code uses email now
- If it occurs, file a bug - old code still exists

### Error: ".errors is not a property"
- This was fixed in the latest commit
- Should not occur - if it does, clear node_modules and reinstall

### Error: "Zod validation failed"
- Check form inputs match schema requirements
- Name: min 2 chars
- Password: min 4 chars
- Email: valid format

### Form not submitting
- Check browser console for errors
- Verify all required fields filled
- Check Convex connection (should see API requests)

---

## 📈 What to Check in Convex Dashboard

### After Signup

Go to **Data** tab → `users` table:
```
Should see:
  _id: Id<"users">
  email: "test@example.com"
  name: "test user"
  phone: "050-1234567"
  createdAt: "2024-02-01T12:34:56.789Z"
  updatedAt: "2024-02-01T12:34:56.789Z"
```

Go to **Data** tab → `authAccounts` table:
```
Should see:
  userId: (same as user._id)
  provider: "password"
```

### After Login

Go to **Data** tab → `authSessions` table:
```
Should see:
  userId: (same as user._id)
  (session is active)
```

---

## 🎯 Success Criteria

All items should be ✅ for "complete":

- ✅ Signup with validation works
- ✅ User created in database
- ✅ Login with validation works
- ✅ Error messages are clear (Hebrew)
- ✅ Duplicate emails prevented
- ✅ Form toggles between login/signup
- ✅ Redirect works with param
- ✅ Session persists on refresh
- ✅ Protected routes work
- ✅ No TypeScript errors
- ✅ Build passes

---

## 🚀 Next Steps (After Testing)

1. ✅ Complete testing checklist
2. ⚠️ Optional: Add email verification
3. ⚠️ Optional: Add password reset
4. ⚠️ Optional: Add OAuth (Google, GitHub)
5. 📊 Monitor auth events in production

