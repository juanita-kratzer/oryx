# Project notes – what we built

This file summarizes the Oryx Wallet Cards app and everything implemented so you (or another developer/AI) can continue without losing context if the chat is lost.

---

## What this app is

- **iOS mobile app** (Expo / React Native) for creating **digital wallet-style cards** — business cards, **QR / barcode membership cards** (loyalty, gym, library, student ID, etc.), event tickets, coupons, gift cards, loyalty cards, gym membership/class pass, generic cards.
- **Next.js backend** (`src/`) serves public card landing pages, PassKit, Smart Exchange API, owner dashboard, and auth/email APIs used by mobile.
- **Dual data stack:**
  - **Mobile:** Firebase Auth + Firestore + Storage (cards, scanned contacts, legacy exchange requests).
  - **Public web / PassKit / leads:** Supabase Postgres via Prisma (synced from mobile via `/api/cards/sync`).
- Business Cards support **Smart Exchange** — present or share your card from the phone; recipient opens `/c/[slug]`, saves your contact, and can share details back. Transport (QR, link, Wallet, AirDrop, etc.) is flexible; outcome is what matters.
- Users can **scan physical business cards** (OCR), review parsed contact info, and save to iPhone Contacts + Firestore.
- **UI:** Ionicons only (no emojis). Bottom tabs: **Contacts** | **Cards** (center/home, raised) | **Account**. Light/dark theme toggle on Account.

**Positioning (recommended):** “The business card that exchanges details automatically” / “Tap. Connect. Exchange.” — not “digital NFC card.”

---

## Development workflow

### Primary: live web preview (UI editing)

```bash
cd oryx-mobile
npm run dev
```

Opens **http://localhost:8081** with Fast Refresh.

- Sign-in is the first screen; web uses mock Firebase + `localStorage` per uid (`oryx-web-cards-{uid}`)
- **Sign-up email codes need the API** — run Next.js too (below)

### Sign-up email verification (needs both servers)

Same **SendGrid** account as **AMBTN** (`~/AMBTN/project/functions/index.js` — **do not edit AMBTN**). Sender: `contact@kratzerco.app`.

```bash
# Terminal 1 — Next.js API (port 3000)
cd /Users/juanitakratzer/OryxWalletApp
npm run dev

# Terminal 2 — mobile web preview (port 8081)
cd oryx-mobile
npm run dev
```

**`oryx-mobile/.env`:**
```
EXPO_PUBLIC_APP_URL=http://localhost:3000
```

**Root `.env.local` (not committed):**
```bash
cd ~/AMBTN/project && firebase functions:config:get sendgrid
# SENDGRID_API_KEY=...
# SENDGRID_SENDER_EMAIL=contact@kratzerco.app
# SENDGRID_REPLY_TO=contact@kratzerco.app
# SENDGRID_SENDER_NAME=Oryx
```

### iOS Simulator / device

```bash
cd oryx-mobile
npm run start:ios
```

Use iOS for: real Firebase, camera/OCR, Apple Wallet, Contacts, Share sheet, TestFlight.

### Root Next.js app (`npm run dev` → port 3000)

| Route / area | Purpose |
|--------------|---------|
| `/c/[slug]` | Public card landing (PAID cards from Prisma) |
| `/exchanges` | Owner leads dashboard (auth) |
| `/` | Minimal home — link to `/exchanges` |
| `POST /api/auth/verify-email-code` | Verify code |
| `POST /api/cards/sync` | Mobile Firestore card → Prisma upsert (Firebase token) |
| `DELETE /api/cards/sync` | Remove mobile-synced card from Prisma by `externalId` |
| `GET /api/exchanges`, `/export` | Owner’s `BusinessCardExchange` leads |
| `POST /api/public/cards/[slug]/exchange` | Public share-back form |
| `POST /api/public/cards/[slug]/analytics` | `qr_view`, `exchange_form_view`, `reciprocal_pass_offer` |
| `GET /api/public/cards/[slug]/pass` | Public Apple Wallet `.pkpass` (reciprocal save) |
| `GET /api/passes/[cardId]` | Owner Apple Wallet pass (auth) |

**Production deploy:** https://oryx-apple-wallet-cards.vercel.app — `npm run build` runs `prisma generate && next build`. `.vercelignore` excludes `oryx-mobile/ios` and native artifacts.

**Git remote:** https://github.com/juanita-kratzer/oryx — branch `main`.

**OTP storage:** `.data/email-verification-codes.json` until Supabase Postgres is restored. Prisma `EmailVerificationCode` model exists; migration failed Jun 2026 (`tenant not found`).

---

## Architecture overview

### Mobile app (`oryx-mobile/`)

| Area | Key files |
|------|-----------|
| Entry | `index.ts` → `StartupRoot.tsx` → `App.tsx` |
| Tabs | `src/navigation/MainTabNavigator.tsx` + `lib/screenInsets.ts` — see **Bottom tab bar** below |
| Business card creator | `CardEditorRouter.tsx` → `BusinessCardCreateScreen.tsx` (simplified Edit/View, not full canvas editor) |
| QR / Barcode card | `CardEditorRouter.tsx` → `QrBarcodeCardCreateScreen.tsx` — manual entry + camera scan (`BarcodeScanModal`, `expo-camera`); private card, no Smart Exchange |
| QR / Barcode preview | `components/qrBarcode/` — `QrBarcodeCardPreview`, `ScannableCodeDisplay`, `BarcodeSvg` (jsbarcode) |
| Template gallery | `TemplateGalleryScreen.tsx` — sections: **Business** \| **Memberships & Rewards** (`data/templateGallery.ts`) |
| Theme | `contexts/ThemeContext.tsx`, `lib/themeStorage.ts` — light/dark on Account |
| Business card UI | `components/businessCard/` — `EditViewToggle`, `AppleWalletPreview`, `ThemeColorDropdown` |
| Wallet theme colours | `constants/ambtnThemeColors.ts` — AMBTN palette + Oryx (white, default) + Onyx (black) |
| Other templates | `EditorScreen.tsx` + `src/editor/*`, `src/templates/*` (incl. gym membership/class pass) |
| Smart Exchange (mobile) | `components/cards/SmartExchangeSection.tsx`, `CardQrCode.tsx`, `CardDetailPreview.tsx` |
| Card URLs / sync | `lib/cardLinks.ts`, `lib/cardSync.ts`, `lib/exchangesApi.ts`, `lib/cardsEvents.ts` |
| Card delivery | `CardDeliveryScreen.tsx` — preview with QR, edit, Wallet + Share (business), Wallet only (QR/barcode), **Allow Smart Exchange** toggle (business only), delete |
| Exchanges (leads) | `ExchangeListScreen.tsx`, `ExchangeDetailScreen.tsx` (API + legacy Firestore pending requests) |
| Contacts tab | `ScannedContactsScreen.tsx` — **Scan business card**, scanned/manual contacts, Smart exchanged contacts |
| Account | `AccountScreen.tsx` — Card Credits (placeholder), **Appearance** (light/dark), security, sign out |
| Scan business card | Contacts tab → `ScanCardScreen.tsx`, `ReviewScannedContactScreen.tsx` |
| Account security | `EditEmailScreen.tsx`, `EditPasswordScreen.tsx` |
| Firebase | `lib/firebase.ts` / `firebase.web.ts` |
| Safe area | `App.tsx` wraps `SafeAreaProvider`; tab screens use `useTabBarInsets()` for top/bottom padding |
| Firestore | `lib/firestore.ts` / `firestore.web.ts` |
| Platform shims | `*.web.ts` for imagePicker, contacts, fileSystem, etc. |

### Next.js + Prisma (`src/`, `prisma/`)

| Area | Key files |
|------|-----------|
| Canonical URLs | `src/lib/cardLinks.ts`, `src/lib/cardVisitSource.ts` |
| Public landing | `src/app/c/[slug]/page.tsx`, `CardLandingClient.tsx` |
| Exchange form | `ExchangeShareForm.tsx`, `ReciprocalWalletOffer.tsx` |
| QR component | `src/components/cards/CardQrCode.tsx` |
| PassKit | `src/lib/passkit/buildPass.ts`, `deliverApplePass.ts`, `barcodeFormats.ts` |
| Card templates (API) | `src/lib/cardTemplates.ts` — mobile `templateId` → Postgres slug mapping |
| Analytics | `src/lib/analytics.ts` — daily stats + `SystemEvent` (incl. `qr_barcode_card_created`) |
| Exchange email | `src/lib/email/exchangeNotification.ts` (SendGrid) |
| Firebase admin (API auth) | `src/lib/firebaseAdmin.ts` — optional `FIREBASE_SERVICE_ACCOUNT_JSON` |

### Prisma models (high signal)

| Model | Notes |
|-------|--------|
| `Card` | `slug`, `externalId` (Firestore id), `allowSmartExchange` (default true; false for QR/barcode), `status` DRAFT/PAID, `fieldValues` JSON |
| `BusinessCardExchange` | Public share-back leads; `source`: `nfc` \| `qr` \| `wallet` \| `direct` |
| `CardDailyStats` | `taps`, `nfcVisits`, `qrVisits`, `walletVisits`, `directVisits`, vcard/pass downloads |
| `User` | `supabaseId`, optional `firebaseUid` for mobile API bridge |

Migrations: `20250621120000_business_card_exchange`, `20250621140000_smart_exchange_optional_source_analytics`.

**Prisma seed** (`prisma/seed.ts`): includes `qr-barcode-card` template (slug) for PassKit + sync. Run `npx prisma db seed` after DB restore.

### Legacy Firebase Hosting Smart Exchange (`web/public/`)

Older static `exchange.js` + Firestore `publicCards` / `exchangeRequests` still exist. **Primary Smart Exchange path is now Next.js `/c/[slug]`** + Prisma `BusinessCardExchange`. Mobile still writes `publicCards` via `publishBusinessCard` for legacy compatibility.

### Bottom tab bar (mobile UX)

Three tabs: **Contacts** | **Cards** (center, raised circle) | **Account**.

**Design:** Raised center **Cards** tab with larger circle; side tabs use smaller icon circles when focused. Icons sit close to labels (tight `marginBottom` on icon wrap, no extra label `marginTop`).

**Layout constants** (`lib/screenInsets.ts`):

| Constant | Value | Purpose |
|----------|-------|---------|
| `TAB_BAR_CONTENT_HEIGHT` | 72px | Icon + label row (excludes home indicator) |
| `TAB_BAR_BOTTOM_SHIFT` | 6px iOS / 8px Android | Extra inset below labels |
| `headerTopPadding` | `max(insets.top + extra, extra)` | Screen header clearance |
| `topExtra` | **36px web** / **20px native** | Min top padding when safe-area top is 0 |
| `listBottomPadding` | `tabBarHeight + 28` | Scroll content above tab bar |

**Tab bar style:** `paddingTop: 10` above icons (breathing room below top border), `paddingBottom: bottomInset + shift`, `safeAreaInsets: { bottom: 0 }` (manual safe-area handling).

**Tuning history:** Avoid flat AMBTN-style bar (user preferred raised center). Fixed label clipping by increasing content height and safe-area padding; tightened icon–label gap; increased top screen padding for web preview (browser chrome has no notch inset).

### Firestore (mobile)

| Collection | Purpose |
|------------|---------|
| `users/{uid}/cards/{cardId}` | Mobile card documents |
| `users/{uid}/scannedContacts/{id}` | OCR-scanned contacts |
| `publicCards/{cardId}` | Legacy published business card payload |
| `exchangeRequests/{id}` | Legacy pending exchange requests |

---

## QR / Barcode Card (`QR_BARCODE_CARD`)

**Purpose:** Store a loyalty card, gym membership, rewards card, library card, student ID, etc. that the user **already owns** — not NFC access cloning, not encrypted tag emulation.

### Create flow

Template Gallery → **Memberships & Rewards** → **QR / Barcode Card** → `QrBarcodeCardCreateScreen`.

| Field | Storage |
|-------|---------|
| Card name * | `name` |
| Barcode / QR value * | `fieldValues.barcodeValue` |
| Organisation | `business` |
| Membership number | `fieldValues.membershipNumber` |
| Notes | `fieldValues.notes` |
| Expiry date | `fieldValues.expiryDate` |
| Logo | `logoUrl` |
| Card colour | `backgroundColor` |
| Display (QR vs barcode) | `fieldValues.displayKind` — URL → QR default; text/number → barcode; manual override |
| Wallet barcode format | `fieldValues.walletBarcodeFormat` — QR, Code128, PDF417, Aztec |

**Capture:** paste manually **or** scan with camera (QR, Code128, Code39, EAN13, EAN8, UPC via `expo-camera`).

### Privacy (not a public business card)

- No `publicUrl` / `nfcUrl` / `qrUrl` on Firestore
- `allowSmartExchange: false`
- `/c/[slug]` returns 404 for `qr-barcode-card` template
- Public reciprocal pass endpoint blocked
- Delivery screen: **Add to Apple Wallet** only (no Share / Smart Exchange)

### Apple Wallet

`buildPass.ts` encodes `fieldValues.barcodeValue` with user-selected PassKit format. **No NFC** on this template.

### Sync

`POST /api/cards/sync` maps mobile `QR_BARCODE_CARD` → Postgres template slug `qr-barcode-card` (not forced to BUSINESS template).

### My Cards

Rows show **QR / Barcode Card** heading + barcode icon.

### Security copy (in-app)

Oryx stores user-provided codes only; does not clone NFC credentials or building access systems.

---

## Smart Exchange

### Outcome (product requirement)

1. **Sender** opens/presents their digital business card on their phone.
2. **Recipient** obtains the card with minimal interaction.
3. **Recipient** can save sender details (contact, card image).
4. **Recipient** can optionally share details back (lead in owner dashboard).

Implementation may use QR, universal links, Apple Wallet, native Share sheet, AirDrop, Nearby Share, etc. — **transport is not prescribed** in product UX or marketing.

**Do not lead with:** NFC tags, “tap to exchange,” or help docs about buying stickers.

### Sender flow (mobile)

After purchase, open **My Cards** → card → **Card** (`CardDeliveryScreen`):

| UI area | What it shows / does |
|---------|----------------------|
| **Card preview** | `CardDetailPreview` / `AppleWalletPreview` with contact fields + **QR code** (“Scan to open card”) |
| **Edit card** | Opens `BusinessCardCreateScreen` in edit mode |
| **Add to Apple Wallet** | Downloads `.pkpass` via `GET /api/passes/{cardId}` |
| **Share card** | Native Share sheet — message + `/c/{slug}` link (Messages, AirDrop, etc.) |
| **Card settings** (business) | Hint text + **Allow Smart Exchange** toggle (black/white `Switch`; syncs via `syncCardToApi`) |
| **Delete card** | Confirmation modal → Firestore + API delete → `navigation.reset` to **Cards** tab; list refreshes via `cardsEvents` |

**Removed from delivery screen:** separate **QR Code** button and `PresentCardModal` (QR is on the preview). No **Copy card link** in main UX.

**My Cards list:** each row shows “Business card” heading, business name, person name, briefcase icon (business template). No status badges.

**Create flow:** `BusinessCardCreateScreen` — Edit/View preview; **Get My Card** creates one card and resets stack to Cards + delivery. No share UI until delivery.

### Canonical URLs

Base: `${NEXT_PUBLIC_APP_URL}/c/${slug}`

Source tracking via query param (same page, analytics only):

| Channel | URL | Notes |
|---------|-----|-------|
| QR (encoded in QR) | `/c/{slug}?src=qr` | Primary “present on screen” path |
| Apple Wallet barcode | `/c/{slug}?src=wallet` | PassKit barcode |
| NFC / tagged link | `/c/{slug}?src=nfc` | Analytics only if opened via NFC URL |
| Direct link | `/c/{slug}` | Share sheet, copy link → `direct` |

Helpers: `getCardPublicUrl`, `getCardNfcUrl`, `getCardQrPayload`, `getCardWalletUrl` in `src/lib/cardLinks.ts`.

### Public landing (`/c/[slug]`)

- Card preview, QR (“Scan to open card”), Save Contact, Save Card Image
- Optional **Smart Exchange** form (if `allowSmartExchange` is true)
- Only **PAID** cards in Prisma are shown

### Optional Smart Exchange (`Card.allowSmartExchange`)

- Toggle on business card delivery screen (no section heading; description paragraph above toggle)
- When disabled: Save Contact + QR still work on landing; exchange form hidden; API returns 403

### Exchange flow (recipient)

1. Open card (scan QR, open link, Wallet pass, etc.)
2. Optionally **Save Contact** / **Save Card Image**
3. **Share My Details** form (name required, phone or email, consent checkbox)
4. Success:
   - “Your details were sent to {first name}.”
   - **Save {name}'s Contact** (vCard)
   - **Would you like to receive {name}'s card too?**
     - **Save to Apple Wallet** → `GET /api/public/cards/[slug]/pass`
     - **Add to Google Wallet** — UI present, **coming soon** (Phase 2)

### Owner leads & contacts

- **Contacts tab → Smart exchanged contacts:** `fetchBusinessCardExchanges` from `/api/exchanges`; tap opens `ExchangeDetailScreen`
- **Contacts tab → From business cards & manual entry:** Firestore `scannedContacts` (OCR + review save); web preview uses `localStorage`
- **Web:** `/exchanges` dashboard (CSV export)
- **Legacy:** `ExchangeListScreen` still available in stack for pending Firestore `exchangeRequests` (no longer linked from Account)
- Owner email on new lead if SendGrid configured (non-blocking)

### Mobile → Prisma bridge

**Build/testing:** In-app purchase (RevenueCat / $4.99) is **disabled**. New cards are created as `PAID` with `purchaseId: build_test`. Legacy draft cards auto-activate on open. Re-enable IAP before production.

After create/update, mobile calls `syncCardToApi` → `POST /api/cards/sync` with Firebase ID token. Sync resolves Postgres template by mobile `templateId` (`business` → `elegant-business`, `QR_BARCODE_CARD` → `qr-barcode-card`). Requires `FIREBASE_SERVICE_ACCOUNT_JSON` on the API.

### Analytics events

`landing_view`, `qr_view`, `exchange_form_view`, `exchange_submitted`, `reciprocal_pass_offer`, `reciprocal_pass_download`, `qr_barcode_card_created` — plus per-source daily counters on `CardDailyStats`.

### Card links in Firestore

On every **business** card create/edit, Firestore stores `publicUrl`, `nfcUrl`, and `qrUrl` (`buildCardLinkFields`). **QR / Barcode cards** omit these link fields.

**Removed from main UX:** `NfcQrSection`, `PresentCardModal.tsx`, help pages about NFC tagging. Account **Smart Exchanges** shortcut removed (leads live on Contacts tab). `nfcWrite.ts` + `react-native-nfc-manager` remain for optional canvas-editor NFC elements only.

### QA checklist (Smart Exchange)

1. Create Business Card → card syncs via `/api/cards/sync` (status PAID in build)
2. Card delivery shows QR on preview; **Share card** opens share sheet with link
3. Open `/c/{slug}` — Save Contact works; optional exchange form if enabled
4. Submit exchange form — lead appears under Contacts → **Smart exchanged contacts**
5. After exchange — reciprocal **Save to Apple Wallet** downloads `.pkpass`
6. Toggle **Allow Smart Exchange** off — form disappears on landing
7. **Delete card** — removed from My Cards; returns to Cards tab
8. Analytics: `?src=wallet` / `?src=qr` / `?src=nfc` on daily stats
9. Owner notification email if SendGrid configured

---

## Removed / deprecated

| Item | Status |
|------|--------|
| `/help`, `/help/nfc`, `content/help/*.md` | **Deleted** — no in-app help site |
| `NfcQrSection.tsx` | **Deleted** — replaced by `SmartExchangeSection` |
| `PresentCardModal.tsx` | **Deleted** — QR shown on card preview instead |
| `WebDevBanner.tsx` | **Deleted** — blue “Web preview” banner removed from `App.tsx` |
| Root marketing landing | Removed earlier; `/` is minimal |
| Firebase Hosting `exchange.js` | Legacy; primary path is Next.js `/c/[slug]` |

---

## Other key features

### Canva-like editor (non-business / non-QR-barcode templates)

- Templates: business + QR/barcode (dedicated screens), event, coupon, gift, loyalty, generic, gym membership, gym class pass
- Canvas editor with drag, inspector panels, fonts, backgrounds, QR/NFC elements

### Firebase Authentication

- Email/password; verification codes via SendGrid (signup, change-email, change-password)
- Account tab: **Card Credits** (placeholder), **Appearance** (light/dark mode), change email + change password with 6-digit verification

### Scan Business Card (OCR)

- **Contacts tab** → **Scan business card** (not on My Cards or Account)
- Camera / photo library → ML Kit OCR → regex parse → review → iPhone Contacts + Firestore `scannedContacts`
- Contacts tab sections: **From business cards & manual entry** | **Smart exchanged contacts**

### iOS native

- Expo config plugins: `withFirebase.js`, `withXcodeSettings.js`, `withFmtFix.js`
- **New Architecture** enabled (`newArchEnabled: true` — required by Reanimated); iOS 16+, static Firebase frameworks
- Xcode workspace: `oryx-mobile/ios/Oryx.xcworkspace`
- Pass download in app: `GET /api/passes/{cardId}` with Firebase bearer token
- Camera: business card OCR + QR/barcode membership scan (`expo-camera` plugin in `app.config.js`)

### Web preview mode

- Metro `.web.ts` shims; OCR/contacts/wallet mocked on web
- No dev banner — web preview is a clean full-screen UI (mock Firestore via `localStorage`)
- **Top padding:** tab screens use `headerTopPadding` with 36px minimum on web so headers clear browser chrome

---

## Dependencies (key)

**Mobile:** Expo SDK 54, React Native Firebase, `react-native-qrcode-svg`, `expo-camera`, `jsbarcode`, `@xmldom/xmldom`, ML Kit text recognition, `expo-contacts`. (`react-native-purchases` in package.json but unused during build phase.)

**Root:** Next.js, Prisma, `passkit-generator`, `qrcode`, `@sendgrid/mail`, `firebase-admin` (optional), Supabase storage for pass files.

---

## Build commands

```bash
# Daily dev (two terminals)
cd /Users/juanitakratzer/OryxWalletApp && npm run dev    # :3000
cd oryx-mobile && npm run dev                          # :8081

# iOS native rebuild (after native dep changes)
cd oryx-mobile && npx expo prebuild --platform ios && cd ios && pod install && open Oryx.xcworkspace

# Prisma seed (qr-barcode-card template, etc.)
cd /Users/juanitakratzer/OryxWalletApp && npx prisma db seed

# DB when Supabase is restored
cd /Users/juanitakratzer/OryxWalletApp && npm run db:migrate
```

---

## Env vars (full Smart Exchange flow)

| Where | Variable |
|-------|----------|
| Root | `NEXT_PUBLIC_APP_URL`, `DATABASE_URL` |
| Root | `FIREBASE_SERVICE_ACCOUNT_JSON` (mobile API auth) |
| Root | PassKit certs/IDs (see passkit signer config) |
| Root | `SENDGRID_*` for verification + exchange notification emails |
| Mobile | `EXPO_PUBLIC_APP_URL=http://localhost:3000` |

---

## Known issues

- **Supabase Postgres down** — `npm run db:migrate` fails (`tenant not found`). OTP uses file store; public landing/exchanges need DB when testing full flow locally.
- **Google Wallet** — not implemented; reciprocal UI shows “coming soon.”
- **Identity split** — mobile Firebase uid vs Prisma `User`; bridged via `firebaseUid` + sync API.
- **Legacy** — `web/public/exchange.js` and Firestore `exchangeRequests` coexist with Prisma leads; `ExchangeListScreen` merges API leads + pending Firestore requests (not linked from Account UI).
- AMBTN theme colours are **mirrored** in `ambtnThemeColors.ts`; do not edit the AMBTN project.
- **NFC hardware write** — not exposed in Smart Exchange UI; do not document as user-facing feature unless re-added deliberately.

---

## What to do next

| Priority | Item |
|----------|------|
| Ship blocker | Restore Supabase Postgres; run migrations |
| Killer feature v2 | **Google Wallet** passes for reciprocal save |
| CRM | `leadStatus` on `BusinessCardExchange` (new → contacted → qualified → customer) |
| Growth | Push notifications for new exchange leads |
| Ops | TestFlight; device test: present/share → landing → exchange → reciprocal Wallet |
| UX | Card credits purchase flow (Account → Card Credits row is placeholder) |
| UX | Dark mode: many stack screens still use static `BRAND` import — tabs + Account themed |
| QR/Barcode | Run `npx prisma db seed` on deploy; device-test scan → save → Wallet pass |
| Cleanup | Deprecate Firebase Hosting exchange page once Prisma path is production-only |

---

*Last updated: Jun 21, 2026 — QR / Barcode Card, tab bar spacing/safe-area polish, WebDevBanner removed, web top padding, Vercel + GitHub main.*
