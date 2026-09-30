-- Respaldo previo a la Fase 1 (modelo de datos unificado).
-- Copia completa de las tablas que la fase modifica o de las que depende.
-- Esquema no expuesto por la API; sin acceso para anon/authenticated.
create schema if not exists backup_20261001;
revoke all on schema backup_20261001 from public, anon, authenticated;

create table backup_20261001.inbox          as table public.inbox;
create table backup_20261001.actions        as table public.actions;
create table backup_20261001.projects       as table public.projects;
create table backup_20261001.habits         as table public.habits;
create table backup_20261001.tasks          as table public.tasks;
create table backup_20261001.planner_habits as table public.planner_habits;
create table backup_20261001.habit_logs     as table public.habit_logs;
create table backup_20261001.profiles       as table public.profiles;
create table backup_20261001.daily_plans    as table public.daily_plans;
create table backup_20261001.time_blocks    as table public.time_blocks;
