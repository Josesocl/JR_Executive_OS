import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MonthlyView } from './MonthlyView'

export default async function MonthlyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-based

  return <MonthlyView userId={user.id} year={year} month={month} />
}
