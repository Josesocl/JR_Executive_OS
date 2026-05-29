// src/app/(app)/settings/SettingsTabs.tsx
'use client'
import { useSearchParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ProfileTab } from './ProfileTab'
import { PreferencesTab } from './PreferencesTab'
import { IntegrationsTab } from './IntegrationsTab'
import type { UserPreferences } from '@/hooks/useUserPreferences'

interface UserIntegration {
  id: string
  provider: string
  account_email: string | null
  calendars: { id: string; name: string; active: boolean }[] | null
  sync_read: boolean
  sync_write: boolean
}

interface SettingsTabsProps {
  user: User
  preferences: UserPreferences | null
  integrations: UserIntegration[]
}

export function SettingsTabs({ user, preferences, integrations }: SettingsTabsProps) {
  const params = useSearchParams()
  const defaultTab = params.get('tab') ?? 'profile'

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <Tabs defaultValue={defaultTab}>
        <TabsList className="px-6 pt-2">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
        </TabsList>
        <div className="p-6">
          <TabsContent value="profile">
            <ProfileTab user={user} />
          </TabsContent>
          <TabsContent value="preferences">
            <PreferencesTab preferences={preferences} userId={user.id} />
          </TabsContent>
          <TabsContent value="integrations">
            <IntegrationsTab integrations={integrations} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
