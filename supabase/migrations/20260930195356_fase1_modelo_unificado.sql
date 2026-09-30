-- Fase 1 — modelo de datos unificado (solo cambios aditivos).
-- Nada se borra aquí: actions.project (texto), tasks y habits se retiran en
-- la Fase 2, cuando el código deje de usarlos.

-- 1. actions: la tabla única de tareas ------------------------------------
alter table public.actions
  add column if not exists project_id     bigint references public.projects(id)     on delete set null,
  add column if not exists plan_id        uuid   references public.daily_plans(id)  on delete set null,
  add column if not exists weekly_goal_id uuid   references public.weekly_goals(id) on delete set null,
  add column if not exists position       integer not null default 0,
  add column if not exists completed_at   timestamptz;

alter table public.actions drop constraint if exists actions_energy_check;
alter table public.actions add constraint actions_energy_check
  check (energy in ('high', 'med', 'low'));

create index if not exists actions_user_id_idx     on public.actions (user_id);
create index if not exists actions_project_id_idx  on public.actions (project_id);
create index if not exists actions_plan_id_idx     on public.actions (plan_id);

-- Enlaza cada acción a su proyecto cuando el texto coincide con UN solo
-- proyecto del mismo usuario (p. ej. "Hormisur" → "Hormisur — Propuesta").
-- Si no hay coincidencia única, queda sin enlazar (se decide a mano).
update public.actions a
set project_id = m.project_id
from (
  select a2.id as action_id, min(p.id) as project_id
  from public.actions a2
  join public.projects p
    on p.user_id = a2.user_id
   and nullif(trim(a2.project), '') is not null
   and p.name ilike '%' || trim(a2.project) || '%'
  group by a2.id
  having count(*) = 1
) m
where a.id = m.action_id and a.project_id is null;

-- 2. projects: enlace opcional a metas y estados válidos -------------------
alter table public.projects
  add column if not exists life_goal_id      uuid references public.life_goals(id)      on delete set null,
  add column if not exists quarterly_goal_id uuid references public.quarterly_goals(id) on delete set null;

alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check
  check (status in ('active', 'someday', 'waiting', 'done', 'archived'));

create index if not exists projects_user_id_idx on public.projects (user_id);

-- 3. inbox: origen para la captura automática (Fase 4) ---------------------
alter table public.inbox
  add column if not exists source       text not null default 'manual',
  add column if not exists external_ref text,
  add column if not exists url          text;

create index if not exists inbox_user_id_idx on public.inbox (user_id);
-- Evita duplicados cuando una rutina vuelve a ver el mismo correo/nota.
create unique index if not exists inbox_user_source_ref_uniq
  on public.inbox (user_id, source, external_ref)
  where external_ref is not null;

-- 4. hábitos: se adopta el modelo planner_habits + habit_logs --------------
alter table public.planner_habits drop constraint if exists planner_habits_frequency_check;
alter table public.planner_habits add constraint planner_habits_frequency_check
  check (frequency in ('daily', 'weekdays', 'weekly', 'monthly'));

-- Migra los hábitos GTD sin rachas (decisión 2026-10-01): sin habit_logs.
insert into public.planner_habits (user_id, name, category, frequency, order_index)
select h.user_id,
       h.name,
       'trabajo',
       case
         when h.name ilike '%mensual%' then 'monthly'
         when h.name ilike '%semanal%' then 'weekly'
         else 'daily'
       end,
       row_number() over (partition by h.user_id order by h.id) - 1
from public.habits h
join public.profiles p on p.id = h.user_id
where not exists (
  select 1 from public.planner_habits ph
  where ph.user_id = h.user_id and ph.name = h.name
);
