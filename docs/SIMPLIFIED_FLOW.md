# Simplified Flow: Login → Create Card → Save to Wallet

This document describes the streamlined user journey.

## User Flow

1. **Login** — User signs in with Supabase Auth (email/password)
2. **Create Card** — Enter name, business, email, phone, website, logo, colour
3. **Save to Wallet** — Add the card to Apple Wallet
4. **Share** — When someone taps your phone (NFC) or scans the QR code on the pass, they land on a page where they can:
   - **Save Contact** — Download vCard to add to contacts
   - **Save to Photos** — Save the card image to their camera roll

## Data Storage (Supabase)

- **Auth** — Supabase Auth (email/password)
- **Cards** — Stored in Supabase `cards` table (`user_id` references `auth.users`)
- **Logins** — Supabase handles auth; user can reinstall the app and log in to see their cards on any device

## What’s Included

- **Mobile app** — Expo app with Sign In, Create Card, Add to Wallet
- **Landing page** — `/c/[slug]` shows the card with Save Contact + Save Card Image
- **Pass generation** — QR code + optional NFC (when `NFC_PUBLIC_KEY` is set)

## Setup for NFC Tap

1. Get **NFC_PUBLIC_KEY**:
   ```bash
   openssl ecparam -name prime256v1 -genkey -noout -out nfcKey.pem
   openssl ec -in nfcKey.pem -pubout -out nfcPubkey.pem -conv_form compressed
   ```
   Base64-encode the public key (without PEM headers) and add to `.env`:
   ```
   NFC_PUBLIC_KEY=<base64-encoded-key>
   ```

2. **Apple VAS** — Enable NFC on your Pass Type ID in the Apple Developer portal. Some NFC features require Apple approval.

## Environment Variables (Mobile)

- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `EXPO_PUBLIC_APP_URL` — Web app URL for Add to Wallet and logo upload
