import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlannerView } from './PlannerView'

interface PageProps {
  params: Promise<{ date: string }>
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default async function PlannerPage({ params }: PageProps) {
  const { date } = await params

  // Validate date format
  if (!DATE_RE.test(date)) {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <PlannerView userId={user.id} date={date} />
}
