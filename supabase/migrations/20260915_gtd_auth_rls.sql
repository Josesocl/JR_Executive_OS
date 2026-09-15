-- GTD Executive OS — propiedad por usuario + RLS
-- Proyecto Supabase: peubserssoxpeemkxtjm
-- Ejecutar en: Supabase → SQL Editor → New query → pegar → Run
--
-- Qué hace: agrega user_id a las 4 tablas del GTD, elimina la política
-- abierta allow_anon_all (que dejaba leer/escribir a cualquiera con la
-- clave pública) y la reemplaza por RLS estricta: cada usuario ve y
-- modifica solo sus propias filas. user_id se auto-completa con auth.uid()
-- en cada insert, así la app no necesita pasarlo.

do $$
declare t text;
begin
  foreach t in array array['inbox','actions','projects','habits'] loop
    -- 1. columna user_id (default = usuario autenticado que inserta)
    execute format(
      'alter table public.%I add column if not exists user_id uuid '
      || 'references auth.users(id) on delete cascade default auth.uid()', t);

    -- 2. eliminar filas sin dueño (semilla anónima previa)
    execute format('delete from public.%I where user_id is null', t);

    -- 3. exigir dueño de aquí en adelante
    execute format('alter table public.%I alter column user_id set not null', t);

    -- 4. quitar la política abierta
    execute format('drop policy if exists allow_anon_all on public.%I', t);

    -- 5. política por usuario (solo autenticados, solo sus filas)
    execute format('drop policy if exists %I on public.%I', t || '_own', t);
    execute format(
      'create policy %I on public.%I for all to authenticated '
      || 'using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t || '_own', t);

    -- 6. asegurar RLS activo
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Verificación (opcional): debe listar 4 políticas *_own y ninguna allow_anon_all
-- select tablename, policyname from pg_policies
-- where schemaname='public' and tablename in ('inbox','actions','projects','habits');
