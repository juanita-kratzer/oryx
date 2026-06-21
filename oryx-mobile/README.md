# Oryx Mobile

Native mobile app built with **Expo + Firebase** (Auth, Firestore, Storage).

## Setup

1. Copy `.env.example` to `.env` and set:
   - **EXPO_PUBLIC_APP_URL** — Next.js API URL (production or your Mac LAN IP for local dev)
   - **APPLE_TEAM_ID** — for Xcode signing

2. Add **GoogleService-Info.plist** (from Firebase Console) to `oryx-mobile/`.

3. Install and run:

```bash
npm install
npm run start:dev    # Metro
npm run ios          # iOS device/simulator
```

## Backend

Cards, contacts, and exchanges are stored in **Firestore**. The Next.js API (`/api/*`) reads the same Firestore data for public landing pages, PassKit, and Smart Exchange — authenticated via **Firebase ID tokens**.

Deploy Firestore rules and indexes from the repo root:

```bash
firebase deploy --only firestore
```
