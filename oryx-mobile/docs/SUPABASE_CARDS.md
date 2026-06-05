# Supabase Cards Setup

The mobile app stores digital cards in Supabase. Follow these steps to set up the `cards` table.

## 1. Run the schema

In [Supabase](https://supabase.com) → SQL Editor, run the contents of `oryx-mobile-supabase-schema.sql` in the oryx-mobile folder.

This creates:

- `cards` table with `clerk_user_id` (links to Clerk user)
- Index on `clerk_user_id`
- `updated_at` trigger

## 2. Row Level Security (RLS)

The default policy allows all operations for development. For production:

1. Use Supabase Edge Functions to verify Clerk JWT and restrict by `clerk_user_id`, or
2. Use Supabase Auth and sync Clerk users to Supabase Auth, then use `auth.uid()` in RLS.

## 3. Env vars

Ensure `.env` has:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
