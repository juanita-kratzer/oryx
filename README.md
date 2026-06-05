# Apple Wallet Cards

SaaS web app to create Apple Wallet pass cards and NFC-linked digital cards.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Clerk** (auth)
- **Supabase** (Postgres + Storage)
- **Prisma** (ORM)
- **nanoid** (slugs for public URLs: `/c/[slug]`)

## Prerequisites

- Node.js 18+
- npm
- [Clerk](https://clerk.com) account
- [Supabase](https://supabase.com) project

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example env and fill in real values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

- **Clerk**: create an application at [dashboard.clerk.com](https://dashboard.clerk.com), copy Publishable Key and Secret Key.
- **Supabase**: create a project at [supabase.com](https://supabase.com). In Project Settings → API copy URL and `anon` key; copy `service_role` key (keep secret). In Database copy the **Connection string (URI)** for `DATABASE_URL`. Use the **direct** connection string (port 5432) for `DIRECT_URL` (used by Prisma migrations).

### 3. Supabase Storage buckets

In Supabase Dashboard → Storage:

- Create a **public** bucket named `cards` (card images).
- Create a bucket named `passes` (can be private; used to store generated .pkpass files).

### 4. Database

Generate Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

When prompted for a migration name, use e.g. `init`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, then create a card from the dashboard.

**Note:** If the project folder name contains special characters (e.g. `?`), the Next.js build may fail with loader resolution errors. Use a path without `?` if you see that.

### 6. PassKit (Apple Wallet) — optional

To enable “Add to Apple Wallet” you need Apple Developer certificates and env vars.

1. **Enroll in Apple Developer Program** and create a Pass Type ID (e.g. `pass.com.yourteam.walletcards`).
2. **Create a signing certificate** for that Pass Type ID (Apple Developer → Certificates, Identifiers & Profiles → Pass Type IDs → your ID → Create Certificate). Download the `.cer` and export the private key from Keychain as a `.p12` (or use the certificate + key you get from Apple).
3. **Download the Apple WWDR certificate**: [Apple PKI - WWDR](https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer) (or the current WWDR from Apple’s PKI page).
4. **Encode as base64** (no line breaks in the value):

   - Certificate (signer cert):  
     `openssl x509 -in certificate.cer -outform DER | base64 | tr -d '\n'`
   - Private key (PEM):  
     `cat key.pem | base64 | tr -d '\n'`
   - WWDR (DER):  
     `openssl x509 -in AppleWWDRCAG4.cer -outform DER | base64 | tr -d '\n'`

   If your key is in a `.p12`: extract PEM first, e.g.  
   `openssl pkcs12 -in cert.p12 -nocerts -out key.pem -nodes`  
   and  
   `openssl pkcs12 -in cert.p12 -clcerts -nokeys -out cert.pem`  
   then base64-encode the PEM contents.

5. **Set in `.env.local`**:
   - `PASSKIT_CERT_BASE64` = base64 of the **signer certificate** (PEM or DER encoded as above).
   - `PASSKIT_KEY_BASE64` = base64 of the **private key** PEM.
   - `PASSKIT_KEY_PASSWORD` = passphrase for the key (empty if not encrypted).
   - `PASSKIT_WWDR_BASE64` = base64 of the **WWDR** certificate (DER).
   - `PASSKIT_PASS_TYPE_ID` = your Pass Type ID (e.g. `pass.com.yourteam.walletcards`).
   - `PASSKIT_TEAM_ID` = your Apple Team ID (10 characters).
   - `PASSKIT_ORG_NAME` = organization name shown on the pass.
6. **Set `NEXT_PUBLIC_APP_URL`** to your public app URL (e.g. `https://yourdomain.com`); used for the QR/barcode URL on the pass.

### 7. Stripe (billing) — optional

To enable subscriptions and plan gating (Free: 1 card, Pro: unlimited):

1. **Stripe account**: [dashboard.stripe.com](https://dashboard.stripe.com). Create a Product with a recurring Price (e.g. monthly). Copy the Price ID (`price_xxxx`).
2. **Env vars** in `.env.local`:
   - `STRIPE_SECRET_KEY` — Secret key (Developers → API keys).
   - `STRIPE_WEBHOOK_SECRET` — From Developers → Webhooks (see below).
   - `STRIPE_PRO_MONTHLY_PRICE_ID` — Your monthly price ID.
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Publishable key (for client-side Stripe.js if you add it later).
3. **Webhook**: In Stripe Dashboard → Developers → Webhooks, add endpoint:
   - **URL**: `https://yourdomain.com/api/webhooks/stripe` (production) or use Stripe CLI for local (see below).
   - **Events**: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
   - Copy the **Signing secret** (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.
4. **Checkout metadata**: The app sends `metadata.userId` (our Prisma user id) in the Checkout session so the webhook can update the correct user when the subscription is created/updated.

**Local webhook testing:**

- Install [Stripe CLI](https://stripe.com/docs/stripe-cli): `brew install stripe/stripe-cli/stripe`.
- Login: `stripe login`.
- Forward webhooks to your dev server:  
  `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- The CLI prints a webhook signing secret (e.g. `whsec_...`). Use that as `STRIPE_WEBHOOK_SECRET` in `.env.local` for local testing.
- Trigger test events: `stripe trigger checkout.session.completed` (or use the Dashboard to complete a test checkout).

Without Stripe env vars, the app runs; billing routes will error when used. Free users are limited to 1 card; upgrade CTA and Billing page still render.

## Commands

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema without migration (dev) |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |

## Implemented

1. **Scaffold** — Next.js 14, Tailwind, ESLint
2. **Clerk auth** — Sign-in, sign-up, protected dashboard layout
3. **Supabase + Prisma** — Schema: `User`, `Card`, `Pass`; migrations; Storage for cards and passes
4. **Card CRUD** — Dashboard list, create/edit card, image upload, card preview, unique slug
5. **PassKit** — .pkpass generation (passkit-generator), certs from env, one pass per card, Supabase bucket `passes`, “Add to Apple Wallet” / “Regenerate” on card edit, rate limit
6. **NFC routing** — Public landing at `/c/[slug]`
7. **Smart landing** — vCard, save image, review link, custom link
8. **Billing (Stripe)** — Free (1 card) / Pro (unlimited), Checkout + Customer Portal, webhooks sync plan/status to User
9. **Plans, limits, admin-lite** — FREE (1 card, watermark), PRO (unlimited, no watermark, custom branding), BUSINESS (flag only). Organizations + members (data model). Centralised limits (`src/lib/limits.ts`). Watermark on landing + pass for FREE. Basic analytics (taps, vCard/pass downloads, daily aggregates). Settings page (branding, plan, org, danger zone). Admin at `/admin` (OWNER via `ADMIN_EMAILS`): view users, card counts, plan, Stripe status, export CSV.

### Optional env

- **NEXT_PUBLIC_APP_NAME** — Shown in watermark (“Powered by [AppName]”). Default: “Wallet Cards”.
- **ADMIN_EMAILS** — Comma-separated emails that can access `/admin`. No default.

## Next steps

- Deployment (Vercel/Railway, env configs, CI/CD)
