# Project notes – what we built

This file summarizes the Oryx - Apple Wallet Cards app and everything implemented in the recent session so you (or another developer/AI) can continue without losing context if the chat is lost.

---

## What this app is

- **SaaS web app** for creating **digital business cards** that work with **Apple Wallet** and **NFC**.
- Users sign up (Clerk), create cards (name, business, phone, image, etc.), get a unique URL per card (`/c/[slug]`).
- They can **Add to Wallet** (generates .pkpass), share a link (`/share/[slug]`), and program **NFC tags** to open the card when tapped.
- **Plans**: Free (1 card, watermark), Pro (unlimited, no watermark, custom branding), Business (custom/enterprise).
- **Stack**: Next.js 14 (App Router), React, TypeScript, Prisma (Postgres via Supabase), Clerk, Stripe, Resend, Supabase Storage, PassKit (Apple Wallet).

---

## Steps we completed (session summary)

### Step 11 – Onboarding, Activation, and Growth UX
- **Onboarding flow** `/onboarding`: 4-step wizard (welcome + use case → quick card form → activate card + Add to Wallet + NFC instructions → success + share link + upgrade CTA). Shown when user created &lt; 7 days and 0 cards. Completing sets `user.onboardedAt`.
- **Activation tracking**: `user.onboardedAt`, `user.activatedAt` (set on first pass download or first NFC tap). `markActivated()` / `markActivatedIfFirstTap()` in `src/lib/activation.ts`. First card, first pass, first tap, first vCard download are reflected in `GET /api/activation`.
- **APIs**: `GET /api/onboarding/status`, `POST /api/onboarding/complete`, `GET /api/activation`.
- **Dashboard**: Redirect to `/onboarding` when `showOnboarding` is true. **Getting Started** checklist (create card, add to Wallet, program NFC, test tap) until activated. **ClaimReferral** reads `referrer_slug` cookie and calls `POST /api/referral`.
- **NFC help**: `/help/nfc` – what tags to buy, how to write URL on iPhone/Android, screenshot placeholders, common issues.
- **Share + referral**: `/share/[slug]` sets cookie `referrer_slug`; sign-up attribution via referral API; `user.referredByUserId`.
- **Upgrade nudges**: Modal “Unlock unlimited cards + branding” for FREE users (after 3 taps or 3 vCard downloads or on 402 when creating 2nd card). `UpgradeNudgeModal`, `UpgradeNudgeTrigger`, session dismiss.
- **Admin**: Users list/export include `onboardedAt`, `activatedAt`.

### Step 12 – Launch, Performance, and Trust Layer
- **Caching**: `src/lib/cache.ts` – `getCachedCardBySlug`, `getCachedCardWithUserAndPasses` (unstable_cache, 5 min, tags `cards`, `card-${slug}`). Public card API, `/c/[slug]`, `/share/[slug]` use cache; card create/update/delete/upload call `revalidateCardBySlug(slug)`.
- **SEO/metadata**: `src/lib/metadata.ts`, `src/app/api/og/route.tsx` (OG image). Metadata on `/`, `/c/[slug]`, `/share/[slug]`, `/help/nfc` (title, description, OpenGraph, Twitter, card image where applicable).
- **Email (Resend)**: `src/lib/email/` – `sendWelcome`, `sendFirstCard`, `sendActivation`, `sendUpgrade`, `sendPaymentFailed`, `sendReferralSuccess`. Wired to onboarding complete, first card create, Stripe upgrade, `invoice.payment_failed`, referral claim. Env: `RESEND_API_KEY`, optional `RESEND_FROM`.
- **Status page**: `/status` (public) – Stripe, Supabase, Database, Storage, PassKit env loaded, last Stripe webhook time. `SystemMetric` table for `stripe_webhook_last_at`; `src/lib/status.ts`.
- **Cron cleanup**: `POST /api/cron/cleanup` (Bearer `CRON_SECRET`) – delete old passes (keep latest per card), remove orphan pass files, basic analytics check.
- **GDPR**: `GET /api/user/export` (download my data JSON), `POST /api/user/delete` (confirm `DELETE_MY_ACCOUNT`). Settings → Privacy: Download my data, Delete account.
- **docs/LAUNCH.md**: Launch checklist (DNS, SSL, domain, Apple certs, Stripe live, webhooks, backups, monitoring, email, cron, support).
- **Error dashboard (Admin)**: `SystemEvent` model; `logSystemEvent({ type, message, metadata })` for pass_failure, webhook_error, payment_failed. Pass build/upload and Stripe webhook log events. `GET /api/admin/events`; Admin shows recent events table.

### Step 13 – Go-To-Market + Revenue Engine
- **Marketing pages**: `(marketing)` layout with nav. Pages: `/pricing` (comparison table FREE/PRO/BUSINESS), `/features`, `/use-cases`, `/demo`, `/enterprise`, `/contact`. All have SEO metadata and CTAs to `/sign-up`. Home `/` has links to these.
- **Enterprise lead capture**: `/enterprise` form (name, email, company, size, use case). `POST /api/leads` → save to `Lead` model, email to ADMIN_EMAILS, auto-respond via Resend.
- **Contact**: `/contact` with generic form; `POST /api/contact` emails admins.
- **Upgrade funnels**: Upgrade banner on dashboard (FREE); “Remove watermark” CTA on landing for owner (FREE); “Unlock branding” CTA in Settings (FREE). All log to `UpgradeEvent` (placement: dashboard | watermark | branding, event: impression | click) via `POST /api/upgrade-event`.
- **Affiliate**: `Affiliate` (code, ownerId, commissionPct, active), `AffiliateRevenue` (affiliateId, userId, amountCents). `/sign-up?aff=CODE` sets cookie; dashboard `ClaimAffiliate` calls `POST /api/affiliate/claim` → set `user.affiliateId`. Stripe `checkout.session.completed` creates `AffiliateRevenue` for that user’s affiliate. Admin: `GET/POST /api/admin/affiliates`.
- **Revenue dashboard (Admin)**: MRR, active subs, canceled, LTV, top referrers, upgrade funnel (impressions/clicks by placement). `GET /api/admin/revenue`.
- **Sales enablement**: `/docs/sales` – pitch outline, demo script, objection handling, pricing anchors.
- **NPS**: After 30 days from signup, dashboard shows NPS prompt (0–10 + optional feedback). `NpsResponse` model (userId unique, score, feedback). `GET/POST /api/nps`. Admin: NPS summary and responses table.

### Step 14 – Scale, Reliability, and Exit-Readiness
- **Backup**: `docs/BACKUP.md` – DB backups (Supabase daily/weekly, pg_dump), storage export, restore steps, checklist.
- **Infrastructure cost dashboard (Admin)**: `src/lib/costs.ts` – estimated monthly costs (Stripe, Supabase, Storage, Email, Vercel); profit margin vs MRR. `GET /api/admin/costs`. Override via `COST_*` env.
- **Churn & retention**: Revenue API extended with `churnRate`, `retentionCohorts` (by signup month), `timeToUpgradeDays`. Shown in Admin revenue section.
- **Security**: `src/lib/security.ts` – env checks (required/optional), secret rotation checklist. `GET /api/admin/security`, `/admin/security` page (env validation + rotation list). Note to run `npm audit`.
- **Incidents**: `Incident` model (title, status, startedAt, resolvedAt, notes). `GET/POST /api/admin/incidents`, `PATCH /api/admin/incidents/[id]`. `/incidents` admin page – log and mark resolved.
- **Knowledge base**: `content/help/*.md` (faq, setup, billing, troubleshooting). `/help` index; `/help/[slug]` serves markdown via `simpleMarkdownToHtml`. `/help/nfc` remains the existing NFC page.
- **Transfer pack**: `docs/TRANSFER.md` – architecture, infra accounts, env inventory, Stripe/Apple/Supabase/domain config, repo/deploy, due diligence pointer.
- **Business metrics export**: `GET /api/admin/metrics/export` – JSON with summary (MRR, ARR, churn, etc.), user cohorts, revenue history, leads, users summary. Admin has “Export metrics (JSON)” button.

---

## Key files and routes (quick reference)

| Area | Path / file |
|------|-------------|
| Onboarding | `src/app/(onboarding)/onboarding/page.tsx`, `OnboardingRedirect`, `GettingStartedCard` |
| Activation | `src/lib/activation.ts`, `GET /api/activation` |
| Caching | `src/lib/cache.ts`, revalidate in cards API and upload |
| Email | `src/lib/email/*.ts`, Resend |
| Status | `src/lib/status.ts`, `src/app/status/page.tsx` |
| GDPR | `GET /api/user/export`, `POST /api/user/delete`, Settings → Privacy |
| Marketing | `src/app/(marketing)/` (layout, pricing, features, use-cases, demo, enterprise, contact) |
| Leads | `Lead` model, `POST /api/leads`, `GET /api/admin/leads` |
| Upgrade tracking | `UpgradeEvent` model, `POST /api/upgrade-event`, UpgradeBanner, WatermarkCta, BrandingCta |
| Affiliate | `Affiliate`, `AffiliateRevenue`, `User.affiliateId`, `/sign-up?aff=`, ClaimAffiliate, `/api/affiliate/claim` |
| Revenue / costs | `GET /api/admin/revenue`, `GET /api/admin/costs`, `src/lib/costs.ts` |
| Security | `src/lib/security.ts`, `GET /api/admin/security`, `/admin/security` |
| Incidents | `Incident` model, `/api/admin/incidents`, `/incidents` |
| Help KB | `content/help/*.md`, `/help`, `/help/[slug]`, `src/lib/markdown.ts` |
| Metrics export | `GET /api/admin/metrics/export` |
| Docs | `docs/LAUNCH.md`, `docs/BACKUP.md`, `docs/TRANSFER.md`, `docs/PRODUCTION.md`, `/docs/sales` |

---

## Important Prisma models (after all steps)

- **User**: plan, subscriptionStatus, onboardedAt, activatedAt, referredByUserId, affiliateId, etc.
- **Card**, **Pass**, **CardDailyStats**, **Organization**, **OrganizationMember**
- **SystemMetric** (e.g. stripe_webhook_last_at), **SystemEvent** (pass_failure, webhook_error, payment_failed)
- **Lead**, **Affiliate**, **AffiliateRevenue**, **UpgradeEvent**, **NpsResponse**, **Incident**

Migrations are in `prisma/migrations/` (including onboarding_activation, system_metric, system_event, gtm_models, incident). Run `npx prisma migrate deploy` (or `migrate dev`) after pull.

---

## Env vars (see .env.example)

- Clerk, Supabase, DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_APP_NAME, ADMIN_EMAILS
- PassKit (PASSKIT_*)
- Stripe (STRIPE_*, NEXT_PUBLIC_STRIPE_*)
- Resend (RESEND_API_KEY, RESEND_FROM)
- CRON_SECRET (for /api/cron/cleanup)
- COST_* (optional, admin cost dashboard)

---

## What to do next (if you continue)

- No further steps were requested; the app is “acquisition-ready” per Step 14.
- If you add features: keep using existing patterns (activation, cache revalidation, admin checks, event logging).
- If you lose this chat: re-read this file and `docs/TRANSFER.md` for full context.

---

*Last updated: session that implemented Steps 11–14 (onboarding, launch/trust, GTM/revenue, scale/exit).*
