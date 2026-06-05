# Oryx - Apple Wallet Cards (Mobile)

Native mobile app built with Expo + Supabase (auth + cards).

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

- **EXPO_PUBLIC_SUPABASE_URL** / **EXPO_PUBLIC_SUPABASE_ANON_KEY** – From [Supabase](https://supabase.com/dashboard)
- **EXPO_PUBLIC_APP_URL** – Web app URL (for Add to Wallet and logo upload)

### 3. Run Supabase schema

Run `oryx-mobile-supabase-schema.sql` in the Supabase SQL Editor.

## Run

```bash
npx expo run:ios
```

For subsequent runs: `npm start`, then open the app from the simulator.

## What's built

- ✅ Supabase Auth (Sign in, Sign up, Sign out)
- ✅ Create card (name, business, email, phone, website, logo, colour)
- ✅ Add to Apple Wallet
- ✅ Cards stored in Supabase (persist across devices)
