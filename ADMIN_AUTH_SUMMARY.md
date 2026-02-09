# Admin Login Security Enhancement

## Overview
Implemented comprehensive admin-only access control for the admin panel, aligning the login flow with the storefront while ensuring only users with `role: "admin"` can access admin functionality.

## Implementation

### Phase 1: Backend Security
- **Created** `convex/authHelpers.ts` with:
  - `getCurrentAdmin` query - Returns user only if they have admin role
  - `requireAdmin` helper - Throws error for non-admin access attempts
  
- **Secured** all admin operations in `convex/users.ts`:
  - `listAll` - User listing
  - `remove` - User deletion  
  - `update` - User updates
  - `updateRole` - Role changes
  - `updateStatus` - Status changes

### Phase 2: Frontend Login Flow
- **Rewrote** `apps/admin/pages/Login.tsx` with two-step authentication:
  1. Sign in with Convex Auth (validates credentials)
  2. Query admin status via `getCurrentAdmin`
  3. If not admin: auto sign-out + display "גישה נדחתה" error
  4. If admin: navigate to dashboard

## Security Features

### Access Control
- **Login blocking**: Non-admin users cannot create sessions
- **Backend validation**: All admin queries/mutations verify role
- **Defense in depth**: Frontend + backend checks

### Error Messages (Hebrew)
- Invalid email: "לא קיים משתמש עם כתובת אימייל זו"
- Wrong password: "הסיסמה שהוזנה אינה נכונה"
- Access denied: "גישה נדחתה - מערכת ניהול למנהלים בלבד"

### User Experience
- Loading state shows "מאמת הרשאות..." during validation
- Immediate feedback for non-admin attempts
- Same error display pattern as storefront

## Files Changed
```
convex/authHelpers.ts              [NEW] - Authorization helpers
convex/users.ts                    [MOD] - Added admin checks
apps/admin/pages/Login.tsx         [MOD] - Two-step auth flow
apps/admin/hooks/useAdminAuth.ts   [NEW] - Admin auth hook
```

## Testing Checklist
- [ ] Admin user can log in successfully
- [ ] Non-admin user sees "גישה נדחתה" error
- [ ] Non-admin user is signed out automatically
- [ ] Backend queries return empty/error for non-admins
- [ ] All error messages display in Hebrew
