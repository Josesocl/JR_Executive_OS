// src/hooks/useUserPreferences.ts
import { createClient } from '@/lib/supabase/client'

export interface UserPreferences {
  user_id: string
  time_format: '24h' | '12h'
  week_start: 'monday' | 'sunday' | 'saturday'
  show_week_numbers: boolean
  show_lunar: boolean
  lunar_lat: number | null
  lunar_lng: number | null
}

const DEFAULTS: Omit<UserPreferences, 'user_id'> = {
  time_format: '24h',
  week_start: 'monday',
  show_week_numbers: true,
  show_lunar: false,
  lunar_lat: null,
  lunar_lng: null,
}

export async function savePreferences(
  userId: string,
  prefs: Omit<UserPreferences, 'user_id'>,
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from('user_preferences').upsert(
    { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  )
  return { error: error?.message ?? null }
}

export function mergeWithDefaults(
  prefs: Partial<UserPreferences> | null,
): Omit<UserPreferences, 'user_id'> {
  return { ...DEFAULTS, ...prefs }
}
