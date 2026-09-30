-- GTD Executive OS — cierra acceso cruzado entre usuarios
-- Proyecto Supabase: peubserssoxpeemkxtjm
-- Aplicada el 2026-10-01 (historial Supabase: gtd_drop_allow_authenticated_all)
--
-- Las tablas GTD tenían, además de *_own, una política permisiva
-- allow_authenticated_all (using true / with check true) que dejaba a
-- cualquier usuario autenticado leer y modificar filas ajenas. Como las
-- políticas permisivas se combinan con OR, anulaba a *_own.
--
-- Reversión (NO recomendada): recrear allow_authenticated_all con
--   create policy allow_authenticated_all on public.<tabla>
--   for all to authenticated using (true) with check (true);

drop policy if exists allow_authenticated_all on public.inbox;
drop policy if exists allow_authenticated_all on public.actions;
drop policy if exists allow_authenticated_all on public.projects;
drop policy if exists allow_authenticated_all on public.habits;
