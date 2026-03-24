# Firebase & Environment Setup Guide

## Quick Setup for Local Development

### 1. Create `.env.local` file

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 2. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click ⚙️ **Settings** > **Project Settings**
4. Scroll to "Your apps" section
5. Click on your web app or create a new web app if needed
6. Copy the Firebase config object

The config looks like this:
```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "projectId": "YOUR_PROJECT",
  "storageBucket": "YOUR_PROJECT.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "measurementId": "YOUR_MEASUREMENT_ID"
}
```

### 3. Update `.env.local`

Add these Firebase credentials to your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```

## Vercel Deployment

### Important: Changing Firebase Account

When you change Firebase accounts:

1. **Remove old credentials** from Vercel
2. **Add new Firebase credentials** to Vercel environment variables:
   - Go to Vercel Project Dashboard
   - **Settings** > **Environment Variables**
   - Add all `NEXT_PUBLIC_FIREBASE_*` variables with new values
3. **Redeploy** your project
   - Vercel should automatically redeploy, or manually trigger a redeploy

### Environment Variables in Vercel

Make sure these are set in Vercel:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_ALLOWED_EMAILS (optional)
GOOGLE_CLIENT_EMAIL (for uploads)
GOOGLE_PRIVATE_KEY (for uploads)
GOOGLE_DRIVE_FOLDER_ID (for uploads)
```

## Firebase Configuration Requirements

### Enable Google Sign-In
1. In Firebase Console, go to **Authentication**
2. Click **Sign-in method**
3. Enable **Google** provider
4. Add Vercel and localhost domains to authorized domains

### Setup Firestore Database
1. Go to **Firestore Database**
2. Click **Create Database**
3. Start in **production mode** for initial setup
4. Choose a location close to your users

### Setup Cloud Storage
1. Go to **Storage**
2. Click **Get started**
3. Review security rules
4. Choose a location

## Email Whitelist

Allowed emails are configured in two ways:

### Option 1: Hardcoded (default)
Edit `components/providers/AuthProvider.tsx`:
```typescript
const DEFAULT_ALLOWED_EMAILS = [
  "shantanusapkal007@gmail.com",
  "tusharsuradkar184@gmail.com",
  // Add more emails here
];
```

### Option 2: Environment Variable
Set `NEXT_PUBLIC_ALLOWED_EMAILS` in `.env.local`:
```env
NEXT_PUBLIC_ALLOWED_EMAILS="email1@gmail.com,email2@gmail.com"
```

## Troubleshooting

### Error: `auth/invalid-api-key`
- Check that all `NEXT_PUBLIC_FIREBASE_*` variables are correctly set
- Ensure you're using the correct Firebase project
- For Vercel: Redeploy after updating environment variables
- For localhost: Restart `npm run dev`

### Error: `auth/unauthorized-email`
- The email trying to sign in is not in the whitelist
- Add the email to either `DEFAULT_ALLOWED_EMAILS` or `NEXT_PUBLIC_ALLOWED_EMAILS`

### Error: `auth/invalid-api-key` on Vercel after account change
1. Get NEW Firebase credentials from new project
2. Update ALL `NEXT_PUBLIC_FIREBASE_*` variables in Vercel Settings
3. Wait 1-2 minutes for build cache to clear
4. Manually redeploy or push a new commit to trigger redeploy

## Testing

Run locally:
```bash
npm run dev
```

Build locally to test:
```bash
npm run build
npm start
```

## Deployment Checklist

Before deploying to Vercel:
- [ ] All Firebase variables are set in `.env.local`
- [ ] All Vercel environment variables are updated
- [ ] Firebase project is selected in Vercel
- [ ] Email whitelist is updated
- [ ] Google Sign-In is enabled in Firebase
- [ ] Authorized domains include your Vercel domain
