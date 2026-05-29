// src/app/(app)/settings/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsTabs } from './SettingsTabs'

export const metadata = { title: 'Configuración — IKIGAI Planner' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: preferences }, { data: integrations }] = await Promise.all([
    supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
    supabase.from('user_integrations').select('*').eq('user_id', user.id),
  ])

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#1a1a2e' }}>
        Configuración
      </h1>
      <SettingsTabs
        user={user}
        preferences={preferences}
        integrations={integrations ?? []}
      />
    </div>
  )
}
