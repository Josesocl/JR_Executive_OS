
-- =====================================================
-- IKIGAI PLANNER: Core Schema
-- =====================================================

-- ─── Profiles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/Bogota',
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  stripe_customer_id TEXT,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── IKIGAI ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ikigai_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('love', 'good', 'needs', 'paid')),
  text TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ikigai_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ikigai_items_all_own" ON ikigai_items FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ikigai_purpose (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  statement TEXT,
  values_text TEXT,
  vision_text TEXT,
  mission_text TEXT,
  version INT NOT NULL DEFAULT 1,
  disc_profile TEXT,
  intelligence_types JSONB DEFAULT '[]',
  core_values JSONB DEFAULT '[]',
  five_year_vision TEXT,
  a1_goal_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ikigai_purpose ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ikigai_purpose_all_own" ON ikigai_purpose FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ikigai_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ikigai_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ikigai_history_all_own" ON ikigai_history FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Goals ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS life_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  area TEXT NOT NULL DEFAULT 'personal',
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  color TEXT,
  icon TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE life_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "life_goals_all_own" ON life_goals FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE ikigai_purpose
  ADD CONSTRAINT fk_a1_goal FOREIGN KEY (a1_goal_id) REFERENCES life_goals(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS quarterly_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  life_goal_id UUID REFERENCES life_goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  quarter INT NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  year INT NOT NULL,
  key_results JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  progress INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE quarterly_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quarterly_goals_all_own" ON quarterly_goals FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS monthly_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quarterly_goal_id UUID REFERENCES quarterly_goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  progress INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE monthly_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "monthly_goals_all_own" ON monthly_goals FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS weekly_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  monthly_goal_id UUID REFERENCES monthly_goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  week_start DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weekly_goals_all_own" ON weekly_goals FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Want List & Goal Tests ───────────────────────────
CREATE TABLE IF NOT EXISTS want_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  priority_group TEXT CHECK (priority_group IN ('A', 'B', 'C')),
  order_index INT NOT NULL DEFAULT 0,
  converted_to_goal UUID REFERENCES life_goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE want_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "want_list_all_own" ON want_list FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS goal_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES life_goals(id) ON DELETE CASCADE UNIQUE,
  desire_score INT CHECK (desire_score BETWEEN 1 AND 10),
  belief_text TEXT,
  written_description TEXT,
  starting_point TEXT,
  why_benefit TEXT,
  obstacles JSONB DEFAULT '[]',
  knowledge_needed JSONB DEFAULT '[]',
  key_people JSONB DEFAULT '[]',
  action_plan JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE goal_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goal_tests_all_own" ON goal_tests FOR ALL
  USING (auth.uid() = (SELECT user_id FROM life_goals WHERE id = goal_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM life_goals WHERE id = goal_id));

-- ─── Daily Planning ──────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  intention TEXT,
  win TEXT,
  notes TEXT,
  energy INT CHECK (energy BETWEEN 1 AND 5),
  focus_level INT CHECK (focus_level BETWEEN 1 AND 5),
  mood INT CHECK (mood BETWEEN 1 AND 5),
  water_glasses INT NOT NULL DEFAULT 0 CHECK (water_glasses BETWEEN 0 AND 8),
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_plans_all_own" ON daily_plans FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS daily_priorities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  position INT NOT NULL CHECK (position BETWEEN 1 AND 3),
  text TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT false,
  weekly_goal_id UUID REFERENCES weekly_goals(id) ON DELETE SET NULL,
  UNIQUE(plan_id, position)
);

ALTER TABLE daily_priorities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_priorities_all_own" ON daily_priorities FOR ALL
  USING (auth.uid() = (SELECT user_id FROM daily_plans WHERE id = plan_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM daily_plans WHERE id = plan_id));

CREATE TABLE IF NOT EXISTS time_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  time_label TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'libre' CHECK (category IN ('libre','trabajo','salud','social','aprendizaje','creativo','urgente','admin')),
  is_calendar_event BOOLEAN NOT NULL DEFAULT false,
  calendar_event_id TEXT,
  calendar_event_data JSONB,
  order_index INT NOT NULL DEFAULT 0,
  UNIQUE(plan_id, time_label)
);

ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "time_blocks_all_own" ON time_blocks FOR ALL
  USING (auth.uid() = (SELECT user_id FROM daily_plans WHERE id = plan_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM daily_plans WHERE id = plan_id));

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL DEFAULT 0,
  weekly_goal_id UUID REFERENCES weekly_goals(id) ON DELETE SET NULL
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_all_own" ON tasks FOR ALL
  USING (auth.uid() = (SELECT user_id FROM daily_plans WHERE id = plan_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM daily_plans WHERE id = plan_id));

CREATE TABLE IF NOT EXISTS gratitude_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  position INT NOT NULL DEFAULT 0
);

ALTER TABLE gratitude_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gratitude_entries_all_own" ON gratitude_entries FOR ALL
  USING (auth.uid() = (SELECT user_id FROM daily_plans WHERE id = plan_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM daily_plans WHERE id = plan_id));

-- ─── Habits (IKIGAI Planner — separate from GTD habits) ──
CREATE TABLE IF NOT EXISTS planner_habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL DEFAULT 'otro' CHECK (category IN ('salud','mente','social','trabajo','otro')),
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily','weekdays','weekly')),
  active BOOLEAN NOT NULL DEFAULT true,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE planner_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "planner_habits_all_own" ON planner_habits FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES planner_habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(habit_id, date)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habit_logs_all_own" ON habit_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Calendar Connections ─────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google',
  calendar_id TEXT NOT NULL,
  calendar_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_connections_all_own" ON calendar_connections FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
