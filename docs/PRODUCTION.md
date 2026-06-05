# Production Readiness Checklist

Use this checklist before and after going live.

---

## 1. Apple Certificates & PassKit

### Certificate renewal
- [ ] **Pass signing certificate** expires annually. Before expiry:
  - Create a new certificate in [Apple Developer → Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/certificates/list) for your Pass Type ID.
  - Export the new cert and private key; base64-encode and update `PASSKIT_CERT_BASE64`, `PASSKIT_KEY_BASE64` in production env.
  - Deploy; existing passes continue to work; new/regenerated passes use the new cert.
- [ ] **WWDR certificate** may be updated by Apple. Replace `PASSKIT_WWDR_BASE64` if Apple publishes a new one (check [Apple PKI](https://www.apple.com/certificateauthority/)).

### Domain verification
- [ ] **HTTPS** – App and all pass-related URLs must be served over HTTPS in production.
- [ ] **Apple App Site Association** – Served at `https://yourdomain.com/.well-known/apple-app-site-association`. Verify:
  - Returns `200` and `Content-Type: application/json`.
  - No redirects (Apple may not follow redirects).
- [ ] **NEXT_PUBLIC_APP_URL** – Set to your production domain (e.g. `https://yourdomain.com`) so pass barcode/QR and links point to the correct landing page.

---

## 2. Vercel (or host) env setup

- [ ] **Clerk** – `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (production keys if using separate prod app).
- [ ] **Supabase** – `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL` (production project).
- [ ] **PassKit** – All `PASSKIT_*` and `NEXT_PUBLIC_APP_URL` set and base64 values valid.
- [ ] **Secrets** – No certs or keys in repo; use env vars or a secrets manager.
- [ ] **Build** – `npm run build` succeeds with production env (or use placeholder values that are overridden at runtime only where safe).

---

## 3. Supabase

- [ ] **Backups** – Enable Point-in-Time Recovery (PITR) or scheduled backups in Supabase dashboard.
- [ ] **Storage buckets** – `cards` (public) and `passes` (public or private; if private, “Download again” in dev pass-preview uses redirect to signed URL or proxy).
- [ ] **RLS** – If using Row Level Security, ensure API uses service role where intended and anon key only for public reads.
- [ ] **Connection pooling** – `DATABASE_URL` uses pooler (e.g. port 6543) for app; `DIRECT_URL` for migrations.

---

## 4. Rate limits & scaling

- [ ] **Pass generation** – In-memory rate limit (e.g. 1 req per card per 15s) is per instance. For multiple instances, use a shared store (Redis/Upstash) in `src/lib/passkit/rateLimit.ts`.
- [ ] **Caching** – Pass reuse (5‑minute cache when card unchanged) reduces load; ensure `generatedAt` and `card.updatedAt` are correct.
- [ ] **Vercel serverless** – Cold starts may add latency for first pass generation; consider keeping a warm instance or edge caching for landing pages.

---

## 5. Security review

- [ ] **Auth** – All `/api/cards/*` and `/api/passes/*` (except public routes) require auth; ownership checked per resource.
- [ ] **Public routes** – Only `/`, `/sign-in`, `/sign-up`, `/c/[slug]`, `/api/public/*` (and AASA) are public; no sensitive data in responses.
- [ ] **Clerk** – Webhook signature verification if using webhooks; production keys not used in client in a way that could be abused.
- [ ] **Supabase** – Service role key never exposed to client; anon key has minimal permissions.
- [ ] **Input** – Card fields (URLs, text) validated/sanitized where needed; no raw user HTML in pass or landing.
- [ ] **Dependencies** – Run `npm audit` and address critical/high issues; update dependencies periodically.

---

## 6. Plans, limits & admin

- [ ] **NEXT_PUBLIC_APP_NAME** – Set if you want a custom watermark (“Powered by [AppName]”).
- [ ] **ADMIN_EMAILS** – Comma-separated list of emails that can access `/admin`. Keep the list minimal and secure.
- [ ] **Limits** – Plan limits (max cards, watermark, analytics days) are in `src/lib/limits.ts`. Adjust if you add new plans or change rules.
- [ ] **Analytics** – CardDailyStats stores daily taps, vCard downloads, pass downloads. Ensure retention or pruning if needed.

---

## 7. Error monitoring (optional)

- [ ] **Sentry** – If `NEXT_PUBLIC_SENTRY_DSN` is set, pass generation errors are logged and can be sent to Sentry via the placeholder in `src/lib/passkit/errors.ts`. Wire `Sentry.captureException` in your app for full integration.
- [ ] **Logging** – Pass build and upload errors are logged with `[PassKit]` prefix; ensure production logs are aggregated and alertable.

---

## 8. QA & UX

- [ ] **Dev pass-preview** – Use `/dev/pass-preview/[cardId]` (auth-only) to verify metadata, barcode URL, version, and “Download again” without regenerating.
- [ ] **Real devices** – Test Add to Wallet and landing page (Save Contact, Save Image, Review, Custom Link) on iPhone Safari; confirm safe areas and 44pt+ tap targets.
- [ ] **NFC** – If using NFC tags, program them with `https://yourdomain.com/c/[slug]` and test tap-to-open and landing actions.

---

## 9. Post-launch

- [ ] **Monitoring** – Uptime, error rate, and pass generation success rate.
- [ ] **Cert calendar** – Schedule reminder to renew Pass signing cert before expiry.
- [ ] **Backups** – Confirm Supabase backups run and are restorable.
- [ ] **Docs** – Keep README and this checklist in sync with env vars and deployment steps.
