# Google OAuth Setup Guide for Kairo Calendar

This guide will walk you through setting up Google OAuth authentication for the Kairo calendar app.

**⏱️ Estimated Time:** 20-30 minutes

---

## Prerequisites

- ✅ Access to [Google Cloud Console](https://console.cloud.google.com)
- ✅ Access to [Supabase Dashboard](https://app.supabase.com)
- ✅ Your Supabase project: `xzyavsgnzuykadbljzgb`

---

## Part 1: Google Cloud Console Setup (10-15 mins)

### Step 1: Create or Select a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown at the top
3. Either:
   - **Create New Project**: Click "New Project", name it "Kairo Calendar", click "Create"
   - **Select Existing**: Choose an existing project

### Step 2: Enable Google+ API (Required for OAuth)

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**
4. Wait for it to enable (takes ~30 seconds)

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace organization)
3. Click **Create**

**Fill in the form:**

| Field | Value |
|-------|-------|
| **App name** | `Kairo Calendar` |
| **User support email** | Your email address |
| **App logo** | (Optional) Upload a logo |
| **Application home page** | `https://kairocalender.web.app` |
| **Application privacy policy** | (Optional, but recommended) |
| **Application terms of service** | (Optional, but recommended) |
| **Authorized domains** | Add these two domains: |
|  | `xzyavsgnzuykadbljzgb.supabase.co` |
|  | `kairocalender.web.app` |
| **Developer contact** | Your email address |

4. Click **Save and Continue**

**Scopes (Step 2):**
1. Click **Add or Remove Scopes**
2. Select these scopes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid`
3. Click **Update** → **Save and Continue**

**Test Users (Step 3):**
1. If in "Testing" mode, add your email as a test user
2. Click **Save and Continue**

**Review (Step 4):**
1. Review your settings
2. Click **Back to Dashboard**

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Application type**: `Web application`
4. Name it: `Kairo Calendar Web Client`

**Configure Authorized JavaScript origins:**

Add these URLs:
```
https://xzyavsgnzuykadbljzgb.supabase.co
http://localhost:5173
https://kairocalender.web.app
```

**Configure Authorized redirect URIs:**

Add these URLs:
```
https://xzyavsgnzuykadbljzgb.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
https://kairocalender.web.app/auth/callback
```

5. Click **Create**

### Step 5: Save Your Credentials

A popup will appear with:
- **Client ID**: Looks like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: Looks like `GOCSPX-abcdefghijklmnop`

⚠️ **IMPORTANT**: Copy both values somewhere safe. You'll need them in the next part.

---

## Part 2: Supabase Dashboard Setup (5 mins)

### Step 1: Open Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `kairo` (or the project with ID `xzyavsgnzuykadbljzgb`)

### Step 2: Enable Google Provider

1. In the left sidebar, go to **Authentication** → **Providers**
2. Scroll down to find **Google**
3. Toggle the switch to **Enable**

### Step 3: Configure Google Provider

**Fill in the form:**

| Field | Value |
|-------|-------|
| **Client ID (for OAuth)** | Paste the Client ID from Google Cloud Console |
| **Client Secret (for OAuth)** | Paste the Client Secret from Google Cloud Console |
| **Authorized Client IDs** | Leave blank (not needed for web apps) |

### Step 4: Verify Redirect URL

Supabase shows the redirect URL at the bottom:
```
https://xzyavsgnzuykadbljzgb.supabase.co/auth/v1/callback
```

✅ Make sure this **exactly matches** one of the redirect URIs you added in Google Cloud Console.

### Step 5: Save Configuration

1. Click **Save** at the bottom
2. You should see a success message

---

## Part 3: Test Google Login (5 mins)

### Step 1: Start the Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### Step 2: Test the Login Flow

1. Click **Sign in with Google** button
2. You should be redirected to Google's sign-in page
3. Select your Google account
4. Review the permissions (email, profile)
5. Click **Allow**
6. You should be redirected back to `http://localhost:5173/auth/callback`
7. Then automatically redirected to the main app
8. You should now be logged in!

### Step 3: Verify Success

✅ Check that:
- Your profile name appears in the app
- You can create and edit events
- Refreshing the page keeps you logged in
- Logging out works

---

## Troubleshooting

### Error: "OAuth provider not configured"

**Cause**: Google provider not enabled in Supabase dashboard

**Solution**: 
1. Go back to Supabase dashboard
2. Verify Google provider is **enabled** (toggle should be ON)
3. Verify Client ID and Secret are correctly entered

---

### Error: "Redirect URI mismatch"

**Cause**: The redirect URI in Google Cloud Console doesn't match Supabase's callback URL

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Click on your OAuth client
3. Verify the redirect URIs include:
   ```
   https://xzyavsgnzuykadbljzgb.supabase.co/auth/v1/callback
   ```
4. Make sure there are no typos or extra spaces

---

### Error: "Access blocked: This app's request is invalid"

**Cause**: Authorized JavaScript origin is missing or incorrect

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Click on your OAuth client
3. Add `http://localhost:5173` to Authorized JavaScript origins
4. Save and try again

---

### Error: "This app is blocked"

**Cause**: Your app hasn't been verified by Google

**Solutions**:

**Option 1 (Recommended for Development):**
1. Go to OAuth consent screen
2. Add your email to "Test users"
3. Use your test account to sign in

**Option 2 (For Production):**
1. Submit app for Google verification (can take weeks)
2. Or keep app in "Testing" mode (max 100 users)

---

### Users see "Google hasn't verified this app" warning

**Expected Behavior**: This is normal for unverified apps

**Users can proceed by:**
1. Clicking "Advanced"
2. Clicking "Go to Kairo Calendar (unsafe)"
3. Allowing permissions

**To remove this warning**: Submit app for Google verification

---

### Login works on localhost but not in production

**Cause**: Production URL not added to authorized origins/redirects

**Solution**:
1. Add production URLs to Google Cloud Console:
   - Authorized origin: `https://kairocalender.web.app`
   - Redirect URI: `https://kairocalender.web.app/auth/callback`
2. Wait 5 minutes for changes to propagate

---

## Security Best Practices

✅ **Already Implemented:**
- Supabase handles token storage securely
- PKCE flow prevents authorization code interception
- RLS policies enforce data isolation
- HTTPS required in production

⚠️ **Additional Recommendations:**
- [ ] Enable email verification for email/password signups
- [ ] Set up rate limiting in Supabase dashboard
- [ ] Monitor authentication logs regularly
- [ ] Rotate Client Secret periodically (every 6-12 months)
- [ ] Keep test user list minimal

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Test Google login on localhost
- [ ] Add production domain to Google Cloud Console
- [ ] Add production domain to Supabase authorized domains
- [ ] Test Google login on staging environment
- [ ] Submit app for Google verification (or add initial users as test users)
- [ ] Set up monitoring for authentication failures
- [ ] Document the process for team members

---

## Useful Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Supabase dashboard logs
3. Verify all URLs match exactly (no trailing slashes, correct protocol)
4. Try in incognito mode to rule out cookie/cache issues
5. Check Google Cloud Console for API quota limits

---

## Summary

Once configured, users will be able to:
- ✅ Sign in with one click using their Google account
- ✅ Skip password creation and management
- ✅ Have their profile picture and name auto-populated
- ✅ Sign in across multiple devices seamlessly

**Status**: 
- ✅ Code implementation: Complete
- ⏳ Configuration: Requires your action (follow this guide)
- ⏳ Testing: After configuration

---

**Next Steps:**
1. Follow Part 1 to set up Google Cloud Console
2. Follow Part 2 to configure Supabase
3. Follow Part 3 to test the integration
4. Deploy and enjoy Google OAuth login! 🎉
