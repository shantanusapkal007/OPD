# OPD Clinic

OPD Clinic is a Next.js-based clinic management app for patient records, appointments, visits, payments, and role-based staff access.

## Local setup

Prerequisites:

- Node.js 20+
- A Supabase project with auth, database tables, and storage configured

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local`
3. Fill in these required variables from Supabase Project Settings > API:
   `NEXT_PUBLIC_SUPABASE_URL`
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Optionally set:
   `NEXT_PUBLIC_APP_NAME`
   `NEXT_PUBLIC_ALLOWED_EMAILS`
5. Verify the environment:
   `npm run verify-env`
6. Start the app:
   `npm run dev`

## Production checks

- `npm run lint`
- `npm run build`
- `npm run verify-env`

## PWA install

- The app now ships with a web app manifest, offline fallback page, installable icons, and a service worker.
- On Chrome/Edge, users will see an in-app install prompt when the browser allows WebAPK-style installation.
- Installed builds launch in standalone mode and can reopen even when the network is temporarily unavailable.

## Deployment notes

- Mirror the same public env vars in your production host before deploying.
- Google OAuth must include your production callback domain in Supabase Auth settings.
- The OAuth callback route persists the session server-side, so production auth depends on the Supabase URL and anon key being correct.
- Keep `public/sw.js` and the `/pwa` icons deployed unchanged so the install experience stays valid.
