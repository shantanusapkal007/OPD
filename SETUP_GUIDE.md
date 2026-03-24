# 🏥 Hospital Management System - Setup & Deployment Guide

## ✅ Issues Fixed

All Firebase authentication issues when changing Firebase accounts have been fixed:

- ✅ Better error messages for Firebase configuration issues
- ✅ Environment variable validation with helpful guidance
- ✅ Complete setup documentation
- ✅ Environment verification script
- ✅ Vercel deployment guide

---

## 📚 Documentation Quick Links

### 🚀 **I want to deploy to Vercel**
→ Read: **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** (5-10 mins)

### 🔧 **I changed Firebase accounts and need to fix errors**
→ Read: **[VERCEL_DEPLOYMENT.md > Troubleshooting](./VERCEL_DEPLOYMENT.md#-troubleshooting)**

### 📋 **I need complete Firebase setup instructions**
→ Read: **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** (Complete reference)

### 🔍 **I want to verify my environment is properly configured**
→ Run: `npm run verify-env`

### 📖 **What was fixed?**
→ Read: **[ISSUES_FIXED.md](./ISSUES_FIXED.md)**

---

## 🚀 Quick Start (5 minutes)

### 1. Setup Local Environment

```bash
# Copy example to local config
cp .env.example .env.local

# Edit .env.local with your Firebase credentials
# (Use FIREBASE_SETUP.md for where to get these)
nano .env.local  # or use your editor
```

### 2. Verify Configuration

```bash
npm run verify-env
```

Look for ✅ marks. If you see ❌, fix the missing variables.

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000/login and test Google sign-in.

### 4. Deploy to Vercel

Follow steps in **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

---

## 📝 Environment Variables Needed

### Required for Authentication (7 variables)
Get these from [Firebase Console](https://console.firebase.google.com/):

```env
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

### Optional for Google Drive Uploads
Get from [Google Cloud Console](https://console.cloud.google.com/):

```env
GOOGLE_CLIENT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_DRIVE_FOLDER_ID
```

### Optional for Email Whitelist
```env
NEXT_PUBLIC_ALLOWED_EMAILS
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| `auth/invalid-api-key` error | See [Fixing Invalid API Key](./VERCEL_DEPLOYMENT.md#error-still-appears-authinvalid-api-key) |
| Sign-in works locally but fails on Vercel | See [Domain Authorization](./VERCEL_DEPLOYMENT.md#success-but-still-cant-sign-in) |
| Environment variables missing | Run `npm run verify-env` |
| Need to change Firebase account | Follow [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) from start |

---

## 🏗️ Project Structure

```
.
├── app/                          # Next.js app directory
│   ├── api/upload/              # File upload endpoint
│   ├── login/                   # Sign-in page
│   ├── appointments/            # Appointments management
│   ├── patients/                # Patient records
│   └── ...                      # Other features
├── components/                  # React components
│   ├── providers/AuthProvider   # Firebase auth context
│   └── ...
├── lib/
│   ├── firebase.ts              # Firebase config (with validation)
│   └── ...
├── services/                    # Firebase service functions
├── FIREBASE_SETUP.md            # Complete Firebase setup guide
├── VERCEL_DEPLOYMENT.md         # Vercel deployment guide
├── ISSUES_FIXED.md              # What was fixed
├── .env.example                 # Environment template
└── .env.local                   # (Create this with your credentials)
```

---

## 🔐 Security Notes

- **Never commit `.env.local`** - It's in `.gitignore` for safety
- **Use `.env.example` as reference** - Shows what variables you need
- **Use [Vercel Secrets](https://vercel.com/docs/environment-variables)** - For production deployments
- **Rotate API keys regularly** - Use Firebase Console to generate new keys

---

## 🧪 Testing Checklist

Before going to production:

- [ ] Local development works: `npm run dev` 
- [ ] Sign-in works locally with your Google account
- [ ] `npm run verify-env` shows ✅ for all required variables
- [ ] Build succeeds locally: `npm run build`
- [ ] Deployed to Vercel successfully
- [ ] Sign-in works on Vercel domain
- [ ] Email is whitelisted (check AuthProvider.tsx)
- [ ] Firebase domain includes Vercel URL

---

## ⚡ Development Commands

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run verify-env  # Check environment configuration
npm run lint        # Check code quality
npm run clean       # Clean build files
```

---

## 📞 Need Help?

1. **Check the docs first**:
   - [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Complete reference
   - [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Deployment guide
   - [ISSUES_FIXED.md](./ISSUES_FIXED.md) - Recent fixes

2. **Run verification**:
   ```bash
   npm run verify-env
   ```

3. **Check Vercel Build Logs**:
   - Vercel Dashboard → Deployments → Select deployment → Build tab

4. **Check Frontend Console**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for helpful error messages

---

**For Firebase Account Changes**, see: **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

**Last Updated**: March 24, 2026
