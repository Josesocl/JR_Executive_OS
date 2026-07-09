// src/app/(app)/settings/IntegrationsTab.tsx
'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Calendar { id: string; name: string; active: boolean }
interface Integration {
  id: string
  provider: string
  account_email: string | null
  calendars: Calendar[] | null
  sync_read: boolean
  sync_write: boolean
}

export function IntegrationsTab({ integrations }: { integrations: Integration[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const successMsg = params.get('connected') === 'google' ? 'Google Calendar conectado.' : null
  const errorMsg = params.get('error') ? 'Error al conectar. Intenta de nuevo.' : null

  const googleIntegration = integrations.find((i) => i.provider === 'google') ?? null
  const [calendars, setCalendars] = useState<Calendar[]>(googleIntegration?.calendars ?? [])
  const [syncRead, setSyncRead] = useState(googleIntegration?.sync_read ?? true)
  const [syncWrite, setSyncWrite] = useState(googleIntegration?.sync_write ?? false)
  const [saving, setSaving] = useState(false)

  async function handleSaveGoogle() {
    if (!googleIntegration) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('user_integrations')
      .update({ calendars, sync_read: syncRead, sync_write: syncWrite, updated_at: new Date().toISOString() })
      .eq('id', googleIntegration.id)
    setSaving(false)
    router.refresh()
  }

  async function handleDisconnect() {
    if (!googleIntegration) return
    const supabase = createClient()
    await supabase.from('user_integrations').delete().eq('id', googleIntegration.id)
    router.refresh()
  }

  function toggleCalendar(id: string) {
    setCalendars((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c))
  }

  return (
    <div className="space-y-6 max-w-lg">
      {(successMsg || errorMsg) && (
        <p className={`text-sm ${successMsg ? 'text-green-600' : 'text-red-500'}`}>
          {successMsg ?? errorMsg}
        </p>
      )}

      {/* Google Calendar */}
      <div className="border border-stone-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a2e]">Google Calendar</p>
            {googleIntegration && (
              <p className="text-xs text-stone-500">{googleIntegration.account_email}</p>
            )}
          </div>
          {!googleIntegration ? (
            <a href="/api/integrations/google/auth">
              <Button variant="outline" size="sm">Conectar</Button>
            </a>
          ) : (
            <button onClick={handleDisconnect} className="text-xs text-red-500 underline">
              Desconectar
            </button>
          )}
        </div>

        {googleIntegration && calendars.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Calendarios</p>
            {calendars.map((cal) => (
              <label key={cal.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cal.active}
                  onChange={() => toggleCalendar(cal.id)}
                  className="rounded border-stone-300"
                />
                <span className="text-sm text-[#1a1a2e]">{cal.name}</span>
              </label>
            ))}

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={syncRead} onChange={(e) => setSyncRead(e.target.checked)} className="rounded border-stone-300" />
                <span className="text-sm text-[#1a1a2e]">Mostrar eventos en el planner</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={syncWrite} onChange={(e) => setSyncWrite(e.target.checked)} className="rounded border-stone-300" />
                <span className="text-sm text-[#1a1a2e]">Crear eventos desde el planner</span>
              </label>
            </div>

            <Button size="sm" onClick={handleSaveGoogle} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar ajustes'}
            </Button>
          </div>
        )}
      </div>

      {[
        { name: 'Outlook Calendar', icon: '📅' },
        { name: 'iCloud Calendar', icon: '☁️' },
        { name: 'Otras integraciones', icon: '🔗' },
      ].map(({ name, icon }) => (
        <div key={name} className="border border-stone-200 rounded-xl p-4 flex items-center gap-3 opacity-60">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a2e]">{name}</p>
          </div>
          <Badge variant="outline">Próximamente</Badge>
        </div>
      ))}
    </div>
  )
}
