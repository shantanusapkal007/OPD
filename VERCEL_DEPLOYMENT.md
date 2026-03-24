# Vercel Deployment Guide for Firebase Account Changes

## 🚀 Quick Start When Changing Firebase Accounts

If you've changed your Firebase account and are seeing `auth/invalid-api-key` errors on Vercel, follow these steps:

### Step 1: Get New Firebase Credentials (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **NEW Firebase project**
3. Click ⚙️ **Settings** → **Project Settings**
4. Scroll to "Your apps" and click your web app
5. Copy the Firebase config:
   ```json
   {
     "apiKey": "AIzaSy...",
     "authDomain": "project.firebaseapp.com",
     "projectId": "project-id",
     ...
   }
   ```

### Step 2: Update Local `.env.local` (1 minute)

Edit `.env.local` in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=<paste_apiKey>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<paste_authDomain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<paste_projectId>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<paste_storageBucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<paste_messagingSenderId>
NEXT_PUBLIC_FIREBASE_APP_ID=<paste_appId>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<paste_measurementId_if_exists>
```

### Step 3: Test Locally (1 minute)

```bash
npm run dev
```

Visit http://localhost:3000/login and test Google sign-in.

**Check for errors in console:**
- Green console logs = ✅ All good
- Red error logs = ❌ Check FIREBASE_SETUP.md

### Step 4: Update Vercel Environment Variables (2 minutes)

1. Go to your [Vercel Dashboard](https://vercel.com)
2. Click your **Hospital** project
3. Go to **Settings** → **Environment Variables**
4. **Delete** old `NEXT_PUBLIC_FIREBASE_*` variables
5. **Add** new variables with values from Step 1:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Step 5: Redeploy (1-2 minutes)

**Option A: Auto Redeploy**
- Just push any commit:
  ```bash
  git add .env.example
  git commit -m "docs: update Firebase setup"
  git push
  ```

**Option B: Manual Redeploy**
1. In Vercel Dashboard
2. Go to **Deployments**
3. Find latest deployment
4. Click **⋯** → **Redeploy**

⏳ **Wait 2-3 minutes** for build to complete.

### Step 6: Test Vercel Deployment (1 minute)

1. Visit your Vercel domain: `https://yourproject.vercel.app/login`
2. Test Google sign-in
3. If it fails, check [Vercel Build Logs](#troubleshooting)

---

## 🔧 Troubleshooting

### Error Still Appears: `auth/invalid-api-key`

**Reason**: Environment variables not updated or cache not cleared

**Solution**:
1. Verify **all** `NEXT_PUBLIC_FIREBASE_*` are in Vercel Settings
2. Make sure no old Firebase variables remain
3. Force redeploy by pushing new commit:
   ```bash
   git commit --allow-empty -m "rebuild: force deploy"
   git push
   ```
4. Wait 5 minutes and try again

### Build Fails During Deployment

Check [Vercel Build Logs](https://vercel.com):
1. Click project → **Deployments**
2. Click failed deployment
3. Click **Build** tab
4. Look for error messages containing:
   - `invalid-api-key` → Check API key in Vercel Settings
   - `undefined` → Check you added all Firebase variables
   - `not found` → Check variable names are spelled correctly

### Success! But Still Can't Sign In

Possible causes:
1. **Email not whitelisted**: Check `DEFAULT_ALLOWED_EMAILS` in `components/providers/AuthProvider.tsx`
2. **Google Auth not enabled**: Go to Firebase Console → Authentication → Google provider must be enabled
3. **Domain not authorized**: Firebase Console → Auth Domain might not include your Vercel domain

**Fix for domain issue**:
1. Firebase Console → Authentication
2. **Authorized domains** section
3. Add your Vercel domain: `yourproject.vercel.app`

---

## 📋 Vercel Environment Variables Checklist

After updating Firebase account, verify in Vercel Settings > Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY           ✅
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN       ✅
NEXT_PUBLIC_FIREBASE_PROJECT_ID        ✅
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET    ✅
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ✅
NEXT_PUBLIC_FIREBASE_APP_ID            ✅
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID    ✅
```

Optional (only if using Google Drive uploads):
```
GOOGLE_CLIENT_EMAIL                    ⚪
GOOGLE_PRIVATE_KEY                     ⚪
GOOGLE_DRIVE_FOLDER_ID                 ⚪
```

---

## 🎯 Common Issues & Quick Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| `auth/invalid-api-key` | Wrong API key in Vercel | Check Vercel env vars match new Firebase project |
| "undefined" in build logs | Missing Firebase variable | Add all 7 NEXT_PUBLIC_FIREBASE_* vars to Vercel |
| Sign-in works locally but fails on Vercel | Domain not authorized | Add Vercel domain to Firebase Console > Auth |
| Old Firebase account still being used | Cache issue | Force redeploy with: `git commit --allow-empty -m "rebuild"` |
| "Cannot read property 'apiKey' of undefined" | .env.local not created | Create .env.local from .env.example before building |

---

## 📚 Related Documentation

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Complete Firebase setup guide
- **[ISSUES_FIXED.md](./ISSUES_FIXED.md)** - All issues fixed in recent updates
- **[.env.example](./.env.example)** - Environment variables template

---

## 🆘 Still Having Issues?

1. **Run verification script**:
   ```bash
   npm run verify-env
   ```

2. **Check all 7 Firebase variables are present**:
   - In `.env.local` for local dev
   - In Vercel Settings for production

3. **Review Vercel Build Logs**:
   - Deployments → Click your deployment → Build tab

4. **Ensure Firebase Settings are correct**:
   - Authentication enabled ✅
   - Google provider enabled ✅
   - Domain authorized ✅
   - Firestore/Storage created ✅

---

**Last Updated**: March 2026  
**Firebase SDK**: ^12.11.0  
**Next.js**: ^15.4.9
