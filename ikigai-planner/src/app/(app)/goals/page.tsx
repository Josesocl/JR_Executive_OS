import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GoalsView } from './GoalsView'

export default async function GoalsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <GoalsView userId={user.id} />
}
