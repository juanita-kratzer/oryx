-- Run this in Supabase SQL Editor for the mobile app.
-- Uses Supabase Auth: user_id references auth.users(id).

-- Migration: if you have existing cards with clerk_user_id, run the user_id addition first,
-- then backfill if needed. For fresh install, the table is created with user_id.

-- Add user_id column if migrating from clerk_user_id
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'cards') then
    if not exists (select 1 from information_schema.columns where table_name = 'cards' and column_name = 'user_id') then
      alter table cards add column user_id uuid references auth.users(id) on delete cascade;
      -- Optionally migrate: update cards set user_id = ... where clerk_user_id = ... (requires mapping)
      -- For fresh start, new cards use user_id.
    end if;
  end if;
end $$;

create table if not exists cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text unique not null,
  type text default 'BUSINESS' check (type in ('BUSINESS', 'REVIEW', 'LINK')),
  name text,
  business text,
  phone text,
  email text,
  website text,
  notes text,
  review_url text,
  custom_url text,
  card_image_url text,
  strip_image_url text,
  logo_url text,
  barcode_value text,
  barcode_format text,
  background_color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Drop clerk_user_id if migrating (run after backfilling user_id)
-- alter table cards drop column if exists clerk_user_id;

create index if not exists cards_user_id_idx on cards (user_id);
create index if not exists cards_slug_idx on cards (slug);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists cards_updated_at on cards;
create trigger cards_updated_at
  before update on cards
  for each row execute function set_updated_at();

-- RLS: users can only access their own cards
alter table cards enable row level security;

drop policy if exists "Allow all for development" on cards;
drop policy if exists "Users can view own cards" on cards;
create policy "Users can view own cards" on cards for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own cards" on cards;
create policy "Users can insert own cards" on cards for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own cards" on cards;
create policy "Users can update own cards" on cards for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own cards" on cards;
create policy "Users can delete own cards" on cards for delete
  using (auth.uid() = user_id);

-- Public read by slug (for landing page - service role bypasses RLS)
-- Anonymous users hit the API which uses service role, so no extra policy needed.
