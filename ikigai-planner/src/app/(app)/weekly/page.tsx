import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWeekStart, toISODateString } from '@/lib/utils/dates'
import { WeeklyView } from './WeeklyView'

export default async function WeeklyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const weekStart = toISODateString(getWeekStart(new Date()))

  return <WeeklyView userId={user.id} weekStart={weekStart} />
}
