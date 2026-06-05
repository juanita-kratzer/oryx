# Launch checklist

Use this checklist before going live with real traffic and paying customers.

## DNS & domain

- [ ] Register or configure your production domain (e.g. `yourapp.com`).
- [ ] Point DNS A/CNAME to your host (e.g. Vercel).
- [ ] Confirm SSL is active (HTTPS). Most hosts provision certs automatically.

## App URL

- [ ] Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://yourapp.com`), no trailing slash.
- [ ] Set `NEXT_PUBLIC_APP_NAME` if you use a custom product name.

## Apple Wallet (PassKit)

- [ ] Enroll in Apple Developer Program.
- [ ] Create Pass Type ID (e.g. `pass.com.yourteam.walletcards`).
- [ ] Export signing certificate and WWDR, convert to base64; set `PASSKIT_CERT_BASE64`, `PASSKIT_KEY_BASE64`, `PASSKIT_KEY_PASSWORD`, `PASSKIT_WWDR_BASE64`.
- [ ] Set `PASSKIT_PASS_TYPE_ID`, `PASSKIT_TEAM_ID`, `PASSKIT_ORG_NAME`.
- [ ] Verify pass generation in dev and that Add to Wallet works on a real device.

## Stripe (payments)

- [ ] Switch to Stripe live mode in dashboard.
- [ ] Set live keys: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRO_MONTHLY_PRICE_ID`.
- [ ] Create a live webhook endpoint pointing to `https://yourapp.com/api/webhooks/stripe`.
- [ ] Subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
- [ ] Set `STRIPE_WEBHOOK_SECRET` to the live webhook signing secret.
- [ ] Test a live checkout and subscription flow.

## Database & storage

- [ ] Use production Supabase (or Postgres) instance; set `DATABASE_URL` and `DIRECT_URL`.
- [ ] Run migrations: `npx prisma migrate deploy`.
- [ ] Create storage buckets `cards` and `passes` in Supabase (or equivalent) with appropriate policies.
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## Backups

- [ ] Enable automated backups for your Postgres database (Supabase provides this).
- [ ] Document restore procedure and retention.

## Monitoring & alerts

- [ ] Monitor `/status` for Stripe, Supabase, storage, PassKit env, and last webhook time.
- [ ] Set up uptime checks for the main app and critical API routes.
- [ ] Use Admin Error Dashboard (e.g. `/admin`) to watch recent pass failures, webhook errors, and payment issues.
- [ ] Optional: spike alerts (e.g. unusual tap or error rate).

## Email (transactional)

- [ ] Sign up for Resend (or SendGrid); verify your domain.
- [ ] Set `RESEND_API_KEY` and optionally `RESEND_FROM` (e.g. `noreply@yourapp.com`).
- [ ] Test welcome, first card, upgrade, and payment-failed emails.

## Cron / jobs

- [ ] Schedule cleanup: call `POST /api/cron/cleanup` with `Authorization: Bearer <CRON_SECRET>` (e.g. daily). Set `CRON_SECRET` in env.

## Support & legal

- [ ] Set a support email and link it from the app or status page.
- [ ] Publish privacy policy and terms; link from footer or sign-up if required.
- [ ] Ensure GDPR flows work: Download my data and Delete account under Settings → Privacy.

## Final checks

- [ ] Run through full user journey: sign up → onboarding → create card → Add to Wallet → NFC tap.
- [ ] Test upgrade and billing portal; confirm upgrade email.
- [ ] Confirm share links and referral cookie attribution.
- [ ] Test export and delete account from Settings.
