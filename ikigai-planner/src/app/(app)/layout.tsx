import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_beta_approved')
    .eq('id', user.id)
    .single()

  if (!profile?.is_beta_approved) {
    redirect('/pending-approval')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f0ece4' }}>
      <Sidebar user={user} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
