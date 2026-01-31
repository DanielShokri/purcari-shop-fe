# Authentication Fix - Test Plan

## Summary of Changes
Fixed "Invalid password" error during registration by synchronizing backend and frontend password validation:
- **Backend** (`convex/auth.ts`): Updated to use `validatePasswordRequirements` callback with 4-character minimum
- **Frontend** (`apps/storefront/schemas/validationSchemas.ts`): Set password minimum to 4 characters
- **Error Handling** (`apps/storefront/components/login/AuthForm.tsx`): Added specific error messages in Hebrew

## Test Cases

### 1. Registration with Valid Password
**Input:** 
- Name: "Test User"
- Email: "testuser123@example.com" (unique)
- Password: "test1234" (8 characters - valid)
- Phone: "050-1234567"

**Expected Result:**
- ✅ Form validation passes (client-side)
- ✅ Backend accepts password
- ✅ New user account created
- ✅ Toast message: "ברוכים הבאים! החשבון נוצר בהצלחה" (Welcome! Account created successfully)
- ✅ Redirected to dashboard

---

### 2. Registration with Minimum Valid Password
**Input:**
- Name: "Test User"
- Email: "testuser456@example.com" (unique)
- Password: "test" (4 characters - minimum valid)
- Phone: "050-1234567"

**Expected Result:**
- ✅ Form validation passes (client-side)
- ✅ Backend accepts password (should NOT show "Invalid password" error)
- ✅ New user account created
- ✅ Toast message: "ברוכים הבאים! החשבון נוצר בהצלחה"
- ✅ Redirected to dashboard

**Note:** This is the critical test case for the fix.

---

### 3. Registration with Too-Short Password
**Input:**
- Name: "Test User"
- Email: "testuser789@example.com"
- Password: "abc" (3 characters - invalid)
- Phone: "050-1234567"

**Expected Result:**
- ❌ Form validation fails (client-side)
- ❌ Error message displays: "הסיסמה חייבת להכיל לפחות 4 תווים" (Password must contain at least 4 characters)
- ❌ Submit button remains disabled
- ❌ Red border around password field

---

### 4. Registration with Empty Password
**Input:**
- Name: "Test User"
- Email: "testuser999@example.com"
- Password: "" (empty)
- Phone: "050-1234567"

**Expected Result:**
- ❌ Form validation fails (client-side)
- ❌ Error message displays: "הסיסמה חייבת להכיל לפחות 4 תווים"
- ❌ Submit button remains disabled
- ❌ Red border around password field

---

### 5. Registration with Duplicate Email
**Input:**
- Name: "Another User"
- Email: "testuser123@example.com" (already registered from test case 1)
- Password: "validpass123"
- Phone: "050-9876543"

**Expected Result:**
- ✅ Form validation passes (client-side)
- ❌ Backend rejects with error
- ❌ Error toast displays: "כתובת אימייל זו כבר רשומה במערכת" (This email is already registered)
- ❌ User remains on registration page

---

### 6. Login with Valid Credentials
**Input:**
- Email: "testuser123@example.com" (from test case 1)
- Password: "test1234"

**Expected Result:**
- ✅ Form validation passes
- ✅ Backend accepts credentials
- ✅ Toast message: "התחברת בהצלחה" (Logged in successfully)
- ✅ Redirected to dashboard

---

### 7. Login with Incorrect Password
**Input:**
- Email: "testuser123@example.com" (valid user)
- Password: "wrongpassword"

**Expected Result:**
- ✅ Form validation passes (client-side)
- ❌ Backend rejects
- ❌ Error toast displays: "הסיסמה שהוזנה אינה נכונה" (Password is incorrect)
- ❌ User remains on login page

---

### 8. Login with Non-existent Email
**Input:**
- Email: "nonexistent@example.com"
- Password: "anypassword"

**Expected Result:**
- ✅ Form validation passes (client-side)
- ❌ Backend rejects
- ❌ Error toast displays: "לא קיים משתמש עם כתובת אימייל זו" (No user with this email)
- ❌ User remains on login page

---

### 9. Invalid Email Format (Registration)
**Input:**
- Email: "notanemail" (invalid format)
- Password: "validpass123"

**Expected Result:**
- ❌ Form validation fails (client-side)
- ❌ Error message displays: "כתובת אימייל לא תקינה" (Invalid email address)
- ❌ Submit button remains disabled

---

### 10. Invalid Phone Format (Registration)
**Input:**
- Name: "Test User"
- Email: "testuser@example.com"
- Password: "test1234"
- Phone: "123" (invalid format)

**Expected Result:**
- ❌ Form validation fails (client-side)
- ❌ Error message displays: "מספר טלפון לא תקין (לדוגמה: 050-1234567)"
- ❌ Submit button remains disabled

---

## Browser Console Checks
- ✅ No validation errors in console
- ✅ No unhandled promise rejections
- ✅ Auth messages properly parsed and displayed
- ✅ Network tab shows successful API calls to Convex

## Test Environment
- **Browser:** Chrome/Safari (latest)
- **Device:** Desktop or mobile
- **Network:** Connected (no API calls work offline)
- **Incognito/Private:** Consider testing in both regular and private mode for cookie handling

## Key Validation Points for 4-Character Fix

| Check | Status |
|-------|--------|
| Backend accepts 4-char passwords | ✅ (line 10: `password.length < 4`) |
| Frontend validates 4-char minimum | ✅ (schema line 11: `.min(4, ...)`) |
| Error messages are in Hebrew | ✅ (all error strings are Hebrew) |
| No cascading validation errors | ✅ (single validation point) |

## Rollback Plan (if needed)
If authentication breaks after this fix, revert to:
1. Change password minimum back to 6 characters in both backend and frontend
2. Clear any cached validation rules
3. Re-test with 6+ character passwords

## Automation Testing
If you have Cypress or Playwright tests, add these test cases:
```javascript
// Pseudo-code for automated testing
describe('Auth with 4-char password', () => {
  test('Should register with 4-character password', () => {
    // Fill form with 4-char password
    // Submit
    // Verify success message
  });

  test('Should reject 3-character password', () => {
    // Fill form with 3-char password
    // Verify validation error
  });
});
```

---

**Test Date:** ______ 
**Tester:** ______  
**Status:** ⬜ Not Started | 🟨 In Progress | 🟩 Complete | 🔴 Failed

