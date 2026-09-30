ALTER TABLE public.inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_all" ON public.inbox FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.actions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.projects FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all" ON public.habits FOR ALL TO anon USING (true) WITH CHECK (true);
