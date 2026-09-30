-- 1. Fix mutable search_path on handle_new_user (schema-injection hardening)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- 2. Close anonymous full-access policies on legacy tables (actions, habits, inbox, projects).
--    These currently allow ANY internet user with just the public anon key to read/write/delete
--    everything in these 4 tables. Replace with authenticated-only access (still permissive per-row,
--    since these tables have no user_id column to scope by owner, but now requires a logged-in session).
DROP POLICY IF EXISTS allow_anon_all ON public.actions;
DROP POLICY IF EXISTS allow_anon_all ON public.habits;
DROP POLICY IF EXISTS allow_anon_all ON public.inbox;
DROP POLICY IF EXISTS allow_anon_all ON public.projects;

CREATE POLICY allow_authenticated_all ON public.actions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY allow_authenticated_all ON public.habits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY allow_authenticated_all ON public.inbox FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY allow_authenticated_all ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
