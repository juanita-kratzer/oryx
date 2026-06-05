# Backup and restore

## Database (Supabase Postgres)

### Automated backups

- **Supabase**: Enable Point-in-Time Recovery (PITR) in Project Settings → Database if available on your plan. Daily backups are often included; verify in Dashboard → Database → Backups.
- **Daily**: Supabase typically runs daily full backups. Confirm retention (e.g. 7 days) in your project.
- **Weekly**: Use Supabase Dashboard to create a manual backup before major releases, or schedule a weekly `pg_dump` via a cron job to an external store (e.g. S3, Vercel Blob).

### Manual export (for transfer or audit)

```bash
# Using connection string (use DIRECT_URL for full dump)
pg_dump "$DIRECT_URL" -F c -f backup-$(date +%Y%m%d).dump
```

### Restore steps

1. Create a new Supabase project or use a staging DB.
2. Apply migrations: `npx prisma migrate deploy` (if schema is already applied, skip).
3. Restore data:
   ```bash
   pg_restore -d "$DIRECT_URL" --clean --if-exists backup-YYYYMMDD.dump
   ```
4. Update `DATABASE_URL` and `DIRECT_URL` in the app to point to the restored DB.
5. Re-run any post-restore steps (e.g. re-enable triggers if needed). Supabase-specific objects may need to be recreated from the Dashboard.

## Storage (Supabase Storage)

### Backup / export

- **Manual**: Supabase Dashboard → Storage → select bucket (`cards`, `passes`) → download objects or use “Export” if available.
- **Programmatic**: Use Supabase Storage API to list and download objects; script to S3 or local. Example pattern:
  ```ts
  const { data } = await supabase.storage.from('cards').list('', { limit: 1000 });
  // Download each file and write to backup location
  ```
- **Retention**: Keep at least one weekly snapshot of storage in a separate bucket or external store.

### Restore

1. Upload objects back to the same bucket/paths via Dashboard or API.
2. Ensure bucket policies and public access match production.

## Application config

- Keep `.env` and secrets in a secure vault (e.g. 1Password, Vercel Env). Do not commit secrets.
- Document all required env vars in `.env.example` and `docs/TRANSFER.md`.
- After restore, verify `NEXT_PUBLIC_APP_URL`, Stripe webhook URL, and Clerk redirect URLs point to the correct environment.

## Checklist

- [ ] Supabase daily backups enabled and retention set
- [ ] Weekly full DB dump to external store (optional)
- [ ] Storage export script or process documented and tested
- [ ] Restore tested at least once on a staging DB
- [ ] Env and secrets documented for restore
