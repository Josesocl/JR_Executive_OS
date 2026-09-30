
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  time_format text not null default '24h',
  week_start text not null default 'monday',
  show_week_numbers boolean not null default true,
  show_lunar boolean not null default false,
  lunar_lat numeric,
  lunar_lng numeric,
  updated_at timestamptz not null default now()
);
alter table public.user_preferences enable row level security;
create policy "owner_preferences" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
