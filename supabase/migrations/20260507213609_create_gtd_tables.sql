
-- Inbox
create table if not exists inbox (
  id bigint primary key generated always as identity,
  text text not null,
  time text default 'ahora',
  processed boolean default false,
  created_at timestamptz default now()
);

-- Actions (próximas acciones)
create table if not exists actions (
  id bigint primary key generated always as identity,
  text text not null,
  ctx text default '',
  done boolean default false,
  energy text default 'med',
  project text default '',
  created_at timestamptz default now()
);

-- Projects
create table if not exists projects (
  id bigint primary key generated always as identity,
  name text not null,
  status text default 'active',
  next_action text default '',
  pillar text default '',
  created_at timestamptz default now()
);

-- Habits
create table if not exists habits (
  id bigint primary key generated always as identity,
  name text not null,
  streak integer default 0,
  target integer default 7,
  last_done timestamptz,
  created_at timestamptz default now()
);

-- RLS desactivado para Fase 1 (sin autenticación aún)
alter table inbox disable row level security;
alter table actions disable row level security;
alter table projects disable row level security;
alter table habits disable row level security;
