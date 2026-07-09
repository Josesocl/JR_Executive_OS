// ─── Profile ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  name: string | null
  email: string
  avatar_url: string | null
  timezone: string | null
  plan: 'free' | 'pro' | 'team'
  stripe_customer_id: string | null
  is_beta_approved: boolean
  onboarded: boolean
  created_at: string
  updated_at: string
}

// ─── IKIGAI ──────────────────────────────────────────────────────────────────

export interface IkigaiItem {
  id: string
  user_id: string
  section: 'love' | 'good' | 'needs' | 'paid'
  text: string
  order_index: number
  created_at: string
}

export interface IkigaiPurpose {
  id: string
  user_id: string
  statement: string | null
  values_text: string | null
  vision_text: string | null
  mission_text: string | null
  version: number
  updated_at: string
  disc_profile: string | null
  intelligence_types: string[]
  core_values: string[]
  five_year_vision: string | null
  a1_goal_id: string | null
}

export interface IkigaiHistory {
  id: string
  user_id: string
  snapshot: Record<string, unknown>
  note: string | null
  created_at: string
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export type GoalArea =
  | 'salud'
  | 'familia'
  | 'trabajo'
  | 'finanzas'
  | 'personal'
  | 'social'
  | 'espiritual'
  | 'aprendizaje'
  | 'carrera'
  | 'fitness'
  | 'material'
  | 'comunidad'
  | 'creativo'
  | 'intelectual'

export const GOAL_AREAS: GoalArea[] = [
  'salud',
  'familia',
  'trabajo',
  'finanzas',
  'personal',
  'social',
  'espiritual',
  'aprendizaje',
  'carrera',
  'fitness',
  'material',
  'comunidad',
  'creativo',
  'intelectual',
]

export interface LifeGoal {
  id: string
  user_id: string
  title: string
  description: string | null
  area: GoalArea
  target_date: string | null
  status: 'active' | 'completed' | 'paused' | 'archived'
  color: string | null
  icon: string | null
  order_index: number
  created_at: string
  completed_at: string | null
}

export interface KeyResult {
  text: string
  target: number
  current: number
  unit: string
}

export interface QuarterlyGoal {
  id: string
  user_id: string
  life_goal_id: string | null
  title: string
  quarter: 1 | 2 | 3 | 4
  year: number
  key_results: KeyResult[]
  status: 'active' | 'completed' | 'paused' | 'archived'
  /** 0–100 */
  progress: number
  created_at: string
}

export interface MonthlyGoal {
  id: string
  user_id: string
  quarterly_goal_id: string | null
  title: string
  /** 1–12 */
  month: number
  year: number
  status: 'active' | 'completed' | 'paused' | 'archived'
  /** 0–100 */
  progress: number
  notes: string | null
  created_at: string
}

export interface WeeklyGoal {
  id: string
  user_id: string
  monthly_goal_id: string | null
  title: string
  /** ISO date string for Monday */
  week_start: string
  status: 'active' | 'completed' | 'paused' | 'archived'
  completed: boolean
  created_at: string
}

// ─── Want List ───────────────────────────────────────────────────────────────

export interface WantListItem {
  id: string
  user_id: string
  text: string
  priority_group: 'A' | 'B' | 'C' | null
  order_index: number
  converted_to_goal: string | null
  created_at: string
}

// ─── Goal Test (Brian Tracy style) ───────────────────────────────────────────

export interface GoalTest {
  id: string
  goal_id: string
  desire_score: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  belief_text: string | null
  written_description: string | null
  starting_point: string | null
  why_benefit: string | null
  obstacles: string[]
  knowledge_needed: string[]
  key_people: string[]
  action_plan: string[]
  updated_at: string
}

// ─── Daily Planning ──────────────────────────────────────────────────────────

export interface DailyPlan {
  id: string
  user_id: string
  /** ISO date string YYYY-MM-DD */
  date: string
  intention: string | null
  win: string | null
  notes: string | null
  /** 1–5 */
  energy: number | null
  /** 1–5 */
  focus_level: number | null
  /** 1–5 */
  mood: number | null
  /** 0–8 */
  water_glasses: number
  completed: boolean
  created_at: string
  updated_at: string
}

export interface DailyPriority {
  id: string
  plan_id: string
  position: 1 | 2 | 3
  text: string
  completed: boolean
  weekly_goal_id: string | null
}

export type TimeBlockCategory =
  | 'libre'
  | 'trabajo'
  | 'salud'
  | 'social'
  | 'aprendizaje'
  | 'creativo'
  | 'urgente'
  | 'admin'

export interface TimeBlock {
  id: string
  plan_id: string
  time_label: string
  content: string
  category: TimeBlockCategory
  is_calendar_event: boolean
  calendar_event_id: string | null
  calendar_event_data: Record<string, unknown> | null
  order_index: number
}

export interface Task {
  id: string
  plan_id: string
  text: string
  completed: boolean
  position: number
  weekly_goal_id: string | null
}

export interface GratitudeEntry {
  id: string
  plan_id: string
  text: string
  position: number
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string | null
  category: 'salud' | 'mente' | 'social' | 'trabajo' | 'otro'
  frequency: 'daily' | 'weekdays' | 'weekly'
  active: boolean
  order_index: number
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  /** ISO date string YYYY-MM-DD */
  date: string
  completed: boolean
}

// ─── Calendar Integration ────────────────────────────────────────────────────

export interface CalendarConnection {
  id: string
  user_id: string
  provider: string
  calendar_id: string
  calendar_name: string
  access_token: string
  refresh_token: string | null
  expires_at: string | null
  active: boolean
  created_at: string
}

// ─── Convenience re-exports ──────────────────────────────────────────────────

export type Plan = Profile['plan']
