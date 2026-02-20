# Google OAuth Configuration Guide

This guide walks you through setting up Google OAuth for the Purcari Israel storefront.

## Prerequisites

- Google Cloud Console access ([console.cloud.google.com](https://console.cloud.google.com))
- Project owner or editor permissions
- Your Convex deployment URL (found in `.env.local` as `VITE_CONVEX_URL`)

---

## Step 1: Create OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **OAuth consent screen**
4. Click **GET STARTED** or **CREATE**
5. Choose user type:
   - **External** - For public users (requires verification for production)
   - **Internal** - For Google Workspace users only (faster for testing)
6. Fill in app information:
   - **App name**: `Purcari Israel`
   - **User support email**: Your email address
   - **App logo** (optional): Upload your app logo
7. Configure app domain:
   - **Application home page**: Your production URL
   - **Application privacy policy link**: `/privacy`
   - **Application terms of service link**: `/terms`
   - **Authorized domains**: Add your production domain
8. Add developer contact information
9. Click **SAVE AND CONTINUE**

### For External Apps Only

10. Add test users (during development):
    - Click **ADD USERS**
    - Enter email addresses of test accounts
    - Only these users can sign in during testing phase

11. Click **SAVE AND CONTINUE**

---

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **CREATE CREDENTIALS** > **OAuth client ID**
3. Select **Web application** as Application type
4. Configure the OAuth client:
   - **Name**: `Purcari Israel Web Client`
   
5. **Authorized JavaScript origins** - Add your domains:
   ```
   http://localhost:5173
   https://your-production-domain.com
   ```
   
6. **Authorized redirect URIs** - Add the Convex callback URL:
   ```
   https://your-deployment.convex.site/api/auth/callback/google
   ```
   
   > **Note**: Find your Convex deployment URL in `.env.local` (look for `VITE_CONVEX_URL`).
   > Replace the `.cloud` domain with `.site` for the redirect URI.
   > 
   > Example:
   > - VITE_CONVEX_URL: `https://fast-horse-123.convex.cloud`
   > - Redirect URI: `https://fast-horse-123.convex.site/api/auth/callback/google`

7. Click **CREATE**
8. Copy the **Client ID** and **Client Secret** (you'll need them in the next step)

---

## Step 3: Set Convex Environment Variables

Run these commands in your project root to configure the OAuth credentials:

```bash
# Set Google Client ID
npx convex env set AUTH_GOOGLE_ID "your_client_id_here"

# Set Google Client Secret  
npx convex env set AUTH_GOOGLE_SECRET "your_client_secret_here"
```

**Security Note**: Never commit these values to your repository. They are stored securely in Convex's environment.

---

## Step 4: Verify Setup

1. Start the development server:
   ```bash
   pnpm dev:storefront
   ```

2. Navigate to `http://localhost:5173/login`

3. You should see the **"המשיכו עם Google"** button below the email form

4. Click the button and complete the Google OAuth flow

5. After successful authentication:
   - You should be redirected back to the app
   - Check the Convex dashboard to verify the user was created
   - The user's email and name should be populated from Google

---

## Troubleshooting

### "redirect_uri_mismatch" Error
- **Cause**: The redirect URI in Google Cloud Console doesn't match exactly
- **Fix**: Ensure the URI in Credentials matches your Convex site URL:
  - Check `.env.local` for `VITE_CONVEX_URL`
  - Replace `.cloud` with `.site`
  - Add `/api/auth/callback/google` path

### "invalid_client" Error
- **Cause**: The Client ID or Secret is incorrect
- **Fix**: 
  - Verify credentials in Google Cloud Console
  - Re-run the `npx convex env set` commands
  - Check for extra spaces or quotes in the values

### OAuth Popup Blocked
- **Cause**: Browser blocked the popup
- **Fix**: 
  - Allow popups from your domain in browser settings
  - Try refreshing the page and clicking again

### User Not Created
- **Cause**: Error in OAuth flow or Convex auth configuration
- **Fix**:
  - Check browser console for JavaScript errors
  - Check Convex dashboard logs for backend errors
  - Verify `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set correctly

### "Access blocked" Error
- **Cause**: App is in testing mode and user is not a test user
- **Fix**:
  - Add the user's email as a test user in OAuth consent screen
  - Or publish the app (requires verification for External apps)

---

## Production Deployment

Before going to production with an External OAuth consent screen:

1. **Publish the app** in Google Cloud Console:
   - Go to **OAuth consent screen** > **PUBLISH APP**
   - This may require Google verification for sensitive scopes

2. **Update authorized origins** to include production domain

3. **Remove test users** restriction once published

4. **Verify branding** compliance with Google's OAuth policies

---

## Related Files

- `convex/auth.ts` - Google provider configuration
- `apps/storefront/hooks/useAuth.ts` - signInWithGoogle method
- `apps/storefront/components/login/AuthForm.tsx` - Google sign-in button UI

---

## Support

For issues specific to Convex Auth, refer to:
- [Convex Auth Documentation](https://labs.convex.dev/auth)
- [Google OAuth Setup Guide](https://labs.convex.dev/auth/config/oauth/google)

For Google Cloud Console issues, refer to:
- [Google Cloud Support](https://cloud.google.com/support)
