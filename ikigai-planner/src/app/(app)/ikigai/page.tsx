import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IkigaiView } from './IkigaiView'

export default async function IkigaiPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <IkigaiView userId={user.id} />
}
