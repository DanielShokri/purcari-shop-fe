---
phase: auth-google
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - convex/auth.ts
  - apps/storefront/hooks/useAuth.ts
  - apps/storefront/components/login/AuthForm.tsx
autonomous: true
user_setup:
  - service: Google OAuth
    why: "Required for Google sign-in functionality"
    env_vars:
      - name: AUTH_GOOGLE_ID
        source: "Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client ID"
      - name: AUTH_GOOGLE_SECRET
        source: "Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client Secrets"
    dashboard_config:
      - task: "Create OAuth consent screen"
        location: "Google Cloud Console -> APIs & Services -> OAuth consent screen"
      - task: "Create OAuth 2.0 Web Application credentials"
        location: "Google Cloud Console -> APIs & Services -> Credentials"
      - task: "Add authorized redirect URI"
        location: "Credentials page -> Authorized redirect URIs"
        value: "https://your-deployment.convex.site/api/auth/callback/google"

must_haves:
  truths:
    - "Users can sign in with Google account"
    - "Users can register with Google account"
    - "Google sign-in button appears on login page"
    - "Google authenticated users have name and email populated"
    - "Google sign-in works alongside existing password auth"
  artifacts:
    - path: "convex/auth.ts"
      provides: "Google OAuth provider configuration"
      contains: "Google from @auth/core/providers/google"
    - path: "apps/storefront/hooks/useAuth.ts"
      provides: "Google sign-in method"
      exports: ["signInWithGoogle"]
    - path: "apps/storefront/components/login/AuthForm.tsx"
      provides: "Google sign-in button UI"
      contains: "onClick handler for Google sign-in"
  key_links:
    - from: "apps/storefront/hooks/useAuth.ts"
      to: "convex/auth.ts"
      via: "convexSignIn('google')"
      pattern: "signIn.*google"
    - from: "apps/storefront/components/login/AuthForm.tsx"
      to: "apps/storefront/hooks/useAuth.ts"
      via: "signInWithGoogle import"
      pattern: "signInWithGoogle"
---

<objective>
Add Google OAuth authentication to the existing Convex Auth setup, allowing users to sign in and register using their Google accounts alongside the existing password authentication.

Purpose: Simplify user onboarding by offering social login, reducing friction for new users and improving conversion rates.
Output: Working Google sign-in flow integrated with existing password auth
</objective>

<execution_context>
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/danielshmuel.mirshukri/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/.planning/ROADMAP.md
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/.planning/STATE.md
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/convex/auth.ts
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/storefront/hooks/useAuth.ts
@/Users/danielshmuel.mirshukri/Downloads/purcari-israel/apps/storefront/components/login/AuthForm.tsx

## Current State
- Convex Auth is configured with Password provider (working)
- AuthForm handles email/password login and registration
- useAuth hook wraps Convex auth actions
- Users table has email, name, phone, role, status fields
- Schema already supports OAuth via authTables
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Google provider to Convex auth configuration</name>
  <files>convex/auth.ts</files>
  <action>
    Import Google provider from @auth/core/providers/google and add it to the providers array in convexAuth configuration.

    Steps:
    1. Add import: `import Google from "@auth/core/providers/google";`
    2. Add Google to providers array after Password provider
    3. Keep existing Password provider and callbacks unchanged

    The Google provider will automatically:
    - Read AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from environment
    - Handle OAuth flow via Convex's built-in OAuth support
    - Call createOrUpdateUser callback with Google profile data

    Note: Google profile includes email, name, and picture by default. The existing createOrUpdateUser callback will handle creating/updating the user record.
  </action>
  <verify>
    Run `npx convex dev` and confirm no TypeScript errors in convex/auth.ts
  </verify>
  <done>
    - Google provider imported and added to providers array
    - Password provider still works (not broken)
    - No TypeScript errors in auth.ts
  </done>
</task>

<task type="auto">
  <name>Task 2: Add Google sign-in method to useAuth hook</name>
  <files>apps/storefront/hooks/useAuth.ts</files>
  <action>
    Add signInWithGoogle function to the useAuth hook that wraps the Convex OAuth sign-in flow.

    Implementation:
    1. Add new `signInWithGoogle` async function
    2. Call convexSignIn("google") - this triggers OAuth redirect
    3. Handle errors with appropriate Hebrew error messages
    4. Return boolean success status
    5. Export the new function from the hook return object

    The signInWithGoogle function should:
    - Set loading state
    - Clear any existing errors
    - Call convexSignIn("google")
    - Handle errors (user cancelled, popup blocked, etc.)
    - Track login event via analytics (if available)
    - Return true on success, false on failure

    Error messages in Hebrew:
    - "ההתחברות בוטלה" (Login was cancelled)
    - "שגיאה בהתחברות עם Google. אנא נסו שוב." (Error logging in with Google)
  </action>
  <verify>
    TypeScript compiles without errors: `cd apps/storefront && npx tsc --noEmit`
  </verify>
  <done>
    - signInWithGoogle function added to useAuth hook
    - Function exported in hook return object
    - Proper error handling with Hebrew messages
    - Loading state managed correctly
  </done>
</task>

<task type="auto">
  <name>Task 3: Add Google sign-in button to AuthForm component</name>
  <files>apps/storefront/components/login/AuthForm.tsx</files>
  <action>
    Add a Google sign-in button to the AuthForm that triggers OAuth flow.

    Implementation:
    1. Import Google icon from lucide-react (or use a custom SVG)
    2. Add signInWithGoogle to the destructured useAuth hook
    3. Add divider with "או" (or) text between password form and Google button
    4. Add Google sign-in button below the password form
    5. Button styling: white background, border, Google colors or neutral
    6. Button text: "המשיכו עם Google" (Continue with Google)
    7. Handle click: call signInWithGoogle, show loading state
    8. On success: show success toast and navigate to redirect URL or dashboard
    9. On error: show error toast

    UI/UX considerations:
    - Button should be prominent but secondary to email form
    - Show spinner during OAuth flow
    - Maintain RTL layout (Hebrew)
    - Button should be accessible (aria-label)

    Analytics tracking:
    - Track Google sign-in attempts
    - Track successful Google sign-ins
  </action>
  <verify>
    1. Component renders without errors
    2. TypeScript compiles: `cd apps/storefront && npx tsc --noEmit`
    3. Button appears on login page
  </verify>
  <done>
    - Google sign-in button visible on AuthForm
    - Button triggers OAuth flow on click
    - Loading state shown during sign-in
    - Success/error toast messages work
    - RTL layout maintained
    - Analytics tracking included
  </done>
</task>

<task type="auto">
  <name>Task 4: Create USER-SETUP.md for Google OAuth configuration</name>
  <files>.planning/phases/auth-google/auth-google-USER-SETUP.md</files>
  <action>
    Create a comprehensive setup guide for configuring Google OAuth credentials.

    Document should include:

    ## Prerequisites
    - Google Cloud Console access
    - Project owner or editor permissions

    ## Step 1: Create OAuth Consent Screen
    1. Go to Google Cloud Console (console.cloud.google.com)
    2. Select your project or create a new one
    3. Navigate to "APIs & Services" > "OAuth consent screen"
    4. Click "GET STARTED" or "CREATE"
    5. Choose "External" (if publishing to public) or "Internal" (if workspace only)
    6. Fill in app information:
       - App name: "Purcari Israel"
       - User support email: your email
       - App logo (optional)
    7. Add app domain and authorized domains
    8. Add contact information
    9. Add test users (for External apps during testing)
    10. Click "SAVE AND CONTINUE"

    ## Step 2: Create OAuth 2.0 Credentials
    1. Go to "APIs & Services" > "Credentials"
    2. Click "CREATE CREDENTIALS" > "OAuth client ID"
    3. Select "Web application" as Application type
    4. Name: "Purcari Israel Web Client"
    5. Authorized JavaScript origins:
       - Add: `http://localhost:5173` (for local development)
       - Add: `https://your-production-domain.com` (for production)
    6. Authorized redirect URIs:
       - Add: `https://your-convex-deployment.convex.site/api/auth/callback/google`
       - Find your Convex deployment URL in `.env.local` (VITE_CONVEX_URL)
       - Replace `.cloud` with `.site` for the redirect URI
    7. Click "CREATE"
    8. Copy the Client ID and Client Secret

    ## Step 3: Set Convex Environment Variables
    Run these commands in your project root:
    ```bash
    npx convex env set AUTH_GOOGLE_ID your_client_id_here
    npx convex env set AUTH_GOOGLE_SECRET your_client_secret_here
    ```

    ## Step 4: Verify Setup
    1. Start the dev server: `pnpm dev:storefront`
    2. Navigate to `/login`
    3. Click "Continue with Google"
    4. Complete Google OAuth flow
    5. Verify user is created in Convex dashboard

    ## Troubleshooting
    - "redirect_uri_mismatch": Check redirect URI in Google Console matches exactly
    - "invalid_client": Verify AUTH_GOOGLE_ID is set correctly
    - OAuth popup blocked: Ensure browser allows popups from your domain
    - User not created: Check browser console for errors
  </action>
  <verify>
    Document is complete and saved to correct path
  </verify>
  <done>
    - USER-SETUP.md created with all steps
    - Commands are copy-paste ready
    - Troubleshooting section included
  </done>
</task>

</tasks>

<verification>
Overall verification of Google OAuth integration:

1. **Convex Backend:**
   - `npx convex dev` starts without errors
   - Google provider configured in auth.ts

2. **Frontend Build:**
   - `cd apps/storefront && npx tsc --noEmit` passes
   - No TypeScript errors in modified files

3. **UI Verification:**
   - Google sign-in button appears on /login page
   - Button is styled appropriately (white with border or Google brand colors)
   - RTL layout maintained for Hebrew

4. **Functional Verification (requires user setup):**
   - Clicking Google button triggers OAuth popup
   - After OAuth consent, user is authenticated
   - User record created in Convex with email and name
   - User redirected to dashboard or original redirect URL

Note: Full functional testing requires completing USER-SETUP.md steps first.
</verification>

<success_criteria>
- Google provider added to convex/auth.ts
- signInWithGoogle method available in useAuth hook
- Google sign-in button visible and functional on AuthForm
- USER-SETUP.md created with complete configuration steps
- All TypeScript checks pass
- Code committed to git
</success_criteria>

<output>
After completion, create `.planning/phases/auth-google/auth-google-01-SUMMARY.md` documenting:
- Google OAuth integration complete
- Files modified: convex/auth.ts, useAuth.ts, AuthForm.tsx
- USER-SETUP.md created for configuration
- Ready for user to configure Google Cloud Console credentials
</output>
