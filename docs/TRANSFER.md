# Transfer pack (acquisition / handover)

Use this document to hand over the system to a new team or acquirer. Keep it updated when infra or env changes.

---

## Architecture overview

- **App**: Next.js 14 (App Router), React, TypeScript. Hosted on Vercel (or compatible Node host).
- **Auth**: Clerk. Users are mirrored to Postgres via `getCurrentUser()` on first API access.
- **Database**: PostgreSQL (Supabase). Prisma ORM; migrations in `prisma/migrations/`.
- **Storage**: Supabase Storage. Buckets: `cards` (card images), `passes` (generated .pkpass files).
- **Payments**: Stripe. Subscription for Pro plan; webhook at `/api/webhooks/stripe`.
- **Email**: Resend. Transactional (welcome, upgrade, payment failed, referral, enterprise auto-respond).
- **Apple Wallet**: PassKit. Certificates in env as base64; passes built with `passkit-generator`.

---

## Infra accounts

| Service    | Purpose                    | Where to find |
|-----------|----------------------------|----------------|
| Vercel    | Hosting, env, cron         | vercel.com → Project |
| Clerk     | Auth (sign-up, sign-in)    | dashboard.clerk.com |
| Supabase  | Postgres + Storage         | supabase.com → Project |
| Stripe    | Billing, subscriptions     | dashboard.stripe.com |
| Resend    | Transactional email       | resend.com |
| Apple     | Pass Type ID, certs        | developer.apple.com |

---

## Env inventory

See `.env.example` for the full list. Critical for run:

- `DATABASE_URL`, `DIRECT_URL` – Postgres (Supabase connection + direct).
- `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` – Clerk.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_MONTHLY_PRICE_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` – Stripe.
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (and `NEXT_PUBLIC_SUPABASE_ANON_KEY` if needed).
- `NEXT_PUBLIC_APP_URL` – Production app URL (no trailing slash).

Optional but recommended:

- `RESEND_API_KEY`, `RESEND_FROM` – Email.
- `PASSKIT_*` – Apple Wallet (cert, key, password, WWDR, pass type ID, team ID, org name).
- `ADMIN_EMAILS` – Comma-separated admin emails for /admin, /incidents, /admin/security.
- `CRON_SECRET` – For cron endpoints (e.g. cleanup).
- `COST_*` – Override cost estimates in admin (COST_STRIPE, COST_SUPABASE, etc.).

---

## Stripe setup

- **Products**: One product for “Pro” monthly subscription; price ID in `STRIPE_PRO_MONTHLY_PRICE_ID`.
- **Webhook**: Production endpoint `https://<NEXT_PUBLIC_APP_URL>/api/webhooks/stripe`. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Signing secret in `STRIPE_WEBHOOK_SECRET`.
- **Checkout**: Uses Stripe Checkout; `metadata.userId` set to our User id for post-checkout update.

---

## Apple certs (PassKit)

- **Pass Type ID**: Created in Apple Developer (Certificates, Identifiers & Profiles). Must match `PASSKIT_PASS_TYPE_ID`.
- **Signing cert**: Export from Keychain (cert + private key), base64-encode and set `PASSKIT_CERT_BASE64`, `PASSKIT_KEY_BASE64`, `PASSKIT_KEY_PASSWORD`.
- **WWDR**: Download from Apple PKI, base64 → `PASSKIT_WWDR_BASE64`.
- **Team / Org**: `PASSKIT_TEAM_ID`, `PASSKIT_ORG_NAME` from Apple Developer account.
- **Renewal**: Cert expires annually; see docs/PRODUCTION.md for renewal steps.

---

## Supabase config

- **Database**: Create project; copy connection strings to `DATABASE_URL` (pooler, port 6543) and `DIRECT_URL` (port 5432).
- **Migrations**: Run `npx prisma migrate deploy` against production DB.
- **Storage**: Create buckets `cards` and `passes`; set policies (e.g. public read for pass downloads, service role write).
- **Backups**: Enable PITR or daily backups in Dashboard. See docs/BACKUP.md.

---

## Domain config

- **DNS**: Point root (or subdomain) to Vercel (or host). SSL is provisioned by the host.
- **App URL**: Set `NEXT_PUBLIC_APP_URL` to `https://yourdomain.com` (no trailing slash).
- **Clerk**: Add production redirect URLs in Clerk Dashboard if using a custom domain.
- **Stripe**: Webhook URL uses `NEXT_PUBLIC_APP_URL`; no separate domain config.
- **Apple**: `.well-known/apple-app-site-association` is served by the app; ensure it’s reachable at `https://yourdomain.com/.well-known/apple-app-site-association`.

---

## Repo and deploy

- **Build**: `npm install && npx prisma generate && npm run build`.
- **Start**: `npm start` or use Vercel’s default.
- **Cron**: If using Vercel Cron or external, call `POST /api/cron/cleanup` with `Authorization: Bearer <CRON_SECRET>` (e.g. daily).

---

## Due diligence / metrics

- **Admin** (requires `ADMIN_EMAILS`): `/admin` (users, revenue, costs, NPS, leads, errors), `/admin/security` (env + rotation checklist), `/incidents` (outage log).
- **Business metrics export**: Use “Export metrics” (or GET `/api/admin/metrics/export`) for ARR/MRR, cohorts, churn, leads – see implementation in admin and API.
