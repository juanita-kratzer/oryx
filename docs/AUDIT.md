# Oryx Wallet Cards — Product Notes

**Last updated:** April 18, 2026

---

## 1. What the Product Is

Oryx Wallet Cards is an iOS app that lets users create custom digital cards from a curated template library, pay $4.99 per card, and add them to Apple Wallet. Cards can be linked to NFC tags so anyone who taps the tag sees the card holder's info — no app install required.

## 2. Who It's For

- Small business owners who want a digital business card they can tap-to-share
- Membership-based businesses (gyms, clubs, co-working spaces)
- Gift card creators (cafés, retail, services)
- Freelancers and professionals who want a contactless networking card
- Event organizers who need booking/access passes

## 3. Product Vision

- **iOS-only mobile app** (no web dashboard for end users)
- **$4.99 AUD per card** — one-time consumable purchase via Apple IAP (RevenueCat)
- **Template-based** — users pick from 5 curated templates and customize within constraints
- **Apple Wallet native** — every paid card becomes a `.pkpass` file
- **NFC-ready** — each card gets a unique URL to write to any NFC tag
- **Free edits forever** — once purchased, users can edit their card and regenerate the pass at no cost
- **Digital only** — no physical products

## 4. Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│   iOS App (Expo)    │────▶│  Next.js API Backend  │
│   React Native      │     │  (Vercel)             │
│   RevenueCat IAP    │     │                       │
│   Supabase Auth     │     │  Prisma + Supabase PG │
└─────────────────────┘     │  PassKit generation   │
                            │  Supabase Storage     │
                            └──────────────────────┘
                                      │
                            ┌─────────▼──────────┐
                            │  Public NFC Pages   │
                            │  /c/[slug]          │
                            │  (no auth required) │
                            └─────────────────────┘
```

## 5. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile app** | Expo, React Native, React Navigation, TypeScript |
| **Auth** | Supabase Auth (email/password) |
| **Backend API** | Next.js 14 (App Router), TypeScript |
| **Database** | Supabase Postgres via Prisma 5 |
| **File storage** | Supabase Storage (buckets: `cards`, `passes`) |
| **Payments** | RevenueCat (Apple IAP consumable) |
| **Apple Wallet** | `passkit-generator` v3 for `.pkpass` signing |
| **Hosting** | Vercel (Next.js backend + public pages) |

## 6. Templates (MVP — 5 total)

All templates are seeded in the database and served via `/api/templates`.

| Template | Category | Pass Type | Use Case |
|----------|----------|-----------|----------|
| **Elegant Business** | BUSINESS | generic | Professional networking card |
| **Membership Card** | MEMBERSHIP | generic | Gym, club, co-working membership |
| **Gift Card** | GIFT | storeCard | Café, retail, service gift card |
| **Digital Contact** | CONTACT | generic | Personal contact/vCard card |
| **Booking Card** | BOOKING | eventTicket | Event, appointment, reservation |

Each template defines:
- `editableFields` — which fields the user can customize (label, placeholder, required)
- `passLayout` — how fields map to PassKit positions (headerFields, primaryFields, etc.)
- `colorOptions` — constrained palette the user can pick from
- `passType` — which PassKit pass style to generate

## 7. Data Model

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **User** | App user account | `supabaseId`, `email`, `name` |
| **Template** | Card design definition | `slug`, `name`, `category`, `editableFields` (JSON), `passLayout` (JSON), `colorOptions` (JSON), `passType` |
| **Card** | User's created card | `slug`, `templateId`, `status` (DRAFT/PAID), `purchaseId`, `name`, `business`, `phone`, `email`, `website`, `fieldValues` (JSON), `logoUrl`, `backgroundColor` |
| **Pass** | Generated wallet pass | `cardId`, `platform` (APPLE/GOOGLE), `fileUrl`, `version` |
| **CardDailyStats** | NFC tap analytics | `cardId`, `date`, `taps`, `vcardDownloads`, `passDownloads` |
| **SystemEvent** | Operational logging | `type`, `message`, `metadata` |

## 8. Payment Model

- **Product ID:** `com.oryx.per.card.consumable`
- **Type:** Consumable (users can buy multiple)
- **Price:** $4.99 AUD per card
- **Flow:** User creates card (DRAFT) → taps Purchase → Apple IAP sheet → on success, backend marks card as PAID → user can add to Apple Wallet
- **Provider:** RevenueCat (wraps StoreKit)
- **RevenueCat API key:** stored in `EXPO_PUBLIC_REVENUECAT_API_KEY` env var
- **No restore purchases** — consumables aren't restorable; paid status is tracked server-side in the `Card.status` field

## 9. User Flow

1. **Sign up** — Email/password via Supabase Auth
2. **Browse templates** — Gallery screen shows all 5 templates with thumbnails
3. **Create card** — Pick a template → fill in fields (constrained by template) → pick a color → see live preview
4. **Purchase** — Card is saved as DRAFT → tap "Purchase — $4.99" → Apple IAP → card marked PAID
5. **Add to Wallet** — Download `.pkpass` → opens in Apple Wallet
6. **NFC setup** — Copy the card's unique URL → write to any NFC tag using a free NFC writer app
7. **Someone taps the tag** — Opens `/c/[slug]` in browser → sees card info, can save contact (vCard)
8. **Edit anytime** — User can update card fields from My Cards → pass regenerates for free

## 10. API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/templates` | GET | List all active templates |
| `/api/templates/[id]` | GET | Get single template by ID or slug |
| `/api/cards` | GET | List user's cards |
| `/api/cards` | POST | Create a new draft card |
| `/api/cards/[id]` | GET/PUT/DELETE | Read, update, delete a card |
| `/api/cards/[id]/purchase` | POST | Mark card as paid (transaction ID from RevenueCat) |
| `/api/cards/[id]/upload` | POST | Upload logo image |
| `/api/passes/[cardId]` | GET | Generate/download `.pkpass` file |
| `/api/public/cards/[slug]` | GET | Public card data (for NFC landing page) |

## 11. Mobile App Screens

| Screen | File | Purpose |
|--------|------|---------|
| Sign In | `SignInScreen.tsx` | Email/password login |
| Sign Up | `SignUpScreen.tsx` | Account creation |
| My Cards | `MyCardsScreen.tsx` | Card list with status badges (Active/Draft) |
| Template Gallery | `TemplateGalleryScreen.tsx` | Browse and select templates |
| Card Editor | `CardEditorScreen.tsx` | Template-constrained form + live preview + color picker |
| Card Delivery | `CardDeliveryScreen.tsx` | Purchase (IAP), Add to Wallet, NFC URL |

## 12. Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Seeds the 5 templates |
| `src/lib/auth.ts` | Supabase JWT auth for API routes |
| `src/lib/passkit/buildPass.ts` | Template-driven `.pkpass` generation |
| `oryx-mobile/App.tsx` | App entry — RevenueCat init, navigation, auth |
| `oryx-mobile/src/lib/api.ts` | API client (all backend calls) |
| `oryx-mobile/src/lib/supabase.ts` | Supabase client with AsyncStorage |
| `oryx-mobile/src/contexts/AuthContext.tsx` | Auth state provider |

## 13. Environment Variables

### Backend (`.env`)
- `DATABASE_URL` / `DIRECT_URL` — Supabase Postgres connection
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` — Base URL for card landing pages

### Mobile (`oryx-mobile/.env`)
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_REVENUECAT_API_KEY` — RevenueCat Apple API key
- `EXPO_PUBLIC_APP_URL` — Backend API URL

## 14. What's Done

- [x] Database schema (User, Template, Card, Pass, analytics)
- [x] 5 templates seeded
- [x] All API routes (templates, cards CRUD, purchase, passes, public)
- [x] Supabase Auth (replacing Clerk)
- [x] Template-driven PassKit generation
- [x] Public NFC landing page (`/c/[slug]`)
- [x] Marketing homepage (directs to App Store)
- [x] Mobile app: Auth screens (Sign In / Sign Up)
- [x] Mobile app: Template Gallery
- [x] Mobile app: Card Editor with live preview
- [x] Mobile app: Purchase flow (RevenueCat, `com.oryx.per.card.consumable`)
- [x] Mobile app: Card Delivery (Add to Wallet + NFC URL)
- [x] Mobile app: My Cards screen
- [x] App icon (Oryx logo)
- [x] Dead code cleanup (removed Clerk, Stripe, old dashboard, affiliates, etc.)

## 15. Xcode Project Settings

| Setting | Value |
|---------|-------|
| **Display Name** | Oryx Wallet Cards |
| **Bundle Identifier** | `com.oryxjuanita.app` |
| **Version** | 1.0.0 |
| **Build** | 1 |
| **Team** | Juanita Kratzer |
| **Signing Certificate** | Apple Development: Juanita Kratzer (KU898WL3...) |
| **Provisioning Profile** | Xcode Managed Profile |
| **Automatically Manage Signing** | Yes |
| **App Category** | Business |
| **Minimum Deployment** | iOS 15.1 |
| **Supported Destinations** | iPhone, iPad, Mac (Designed for iPad), Apple Vision |
| **iPhone Orientation** | Portrait, Upside Down |
| **iPad Orientation** | Portrait, Upside Down, Landscape Left, Landscape Right |

### Permissions Configured
- **Camera** — for logo/image capture
- **Face ID** — for biometric authentication
- **Microphone** — included by Expo default

### Build Notes
- Project path contains a space (`Apple Wallet App`) which breaks an unquoted variable in `expo-constants`. Use the symlink at `/Users/juanitakratzer/OryxApp` for builds.
- Always prebuild and open Xcode from the symlinked path: `cd /Users/juanitakratzer/OryxApp/oryx-mobile && npx expo prebuild --platform ios --clean`
- Open in Xcode: `open /Users/juanitakratzer/OryxApp/oryx-mobile/ios/Oryx.xcworkspace`

## 16. What's Next

- [ ] Apple Sign In (upgrade from email/password)
- [ ] Template thumbnail images (design in Figma/Canva → upload to Supabase Storage)
- [ ] Google Wallet support (Phase 2)
- [ ] Card editing from My Cards (navigate to editor with existing card data)
- [ ] Push notifications (pass update alerts)
- [ ] App Store submission + TestFlight
