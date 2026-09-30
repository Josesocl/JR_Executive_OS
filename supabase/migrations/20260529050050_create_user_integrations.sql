
create table if not exists public.user_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  account_email text,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scopes text[],
  calendars jsonb,
  sync_read boolean not null default true,
  sync_write boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider)
);
alter table public.user_integrations enable row level security;
create policy "owner_integrations" on public.user_integrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
