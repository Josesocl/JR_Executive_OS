// src/app/(app)/settings/PreferencesTab.tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { savePreferences, mergeWithDefaults } from '@/hooks/useUserPreferences'
import type { UserPreferences } from '@/hooks/useUserPreferences'

interface PreferencesTabProps {
  preferences: Partial<UserPreferences> | null
  userId: string
}

export function PreferencesTab({ preferences, userId }: PreferencesTabProps) {
  const [prefs, setPrefs] = useState(mergeWithDefaults(preferences))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function set<K extends keyof typeof prefs>(key: K, value: (typeof prefs)[K]) {
    setPrefs((p) => ({ ...p, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const { error } = await savePreferences(userId, prefs)
    setSaving(false)
    setMessage(error
      ? { type: 'error', text: error }
      : { type: 'success', text: 'Preferencias guardadas.' }
    )
  }

  async function detectLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      set('lunar_lat', pos.coords.latitude)
      set('lunar_lng', pos.coords.longitude)
    })
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-md">
      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Formato de hora</label>
        <Select value={prefs.time_format} onValueChange={(v) => set('time_format', v as '24h' | '12h')}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 horas (14:30)</SelectItem>
            <SelectItem value="12h">12 horas AM/PM (2:30 PM)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Inicio de semana</label>
        <Select value={prefs.week_start} onValueChange={(v) => set('week_start', v as typeof prefs.week_start)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="monday">Lunes (ISO 8601)</SelectItem>
            <SelectItem value="sunday">Domingo</SelectItem>
            <SelectItem value="saturday">Sábado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#1a1a2e]">Número de semana</p>
          <p className="text-xs text-stone-500">Muestra la semana del año (1–52/53)</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={prefs.show_week_numbers}
          onClick={() => set('show_week_numbers', !prefs.show_week_numbers)}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
            prefs.show_week_numbers ? 'bg-[#1a1a2e]' : 'bg-stone-300'
          }`}
        >
          <span className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform mt-1 ${
            prefs.show_week_numbers ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1a1a2e]">Ciclo lunar</p>
            <p className="text-xs text-stone-500">Muestra la fase lunar en el planner</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.show_lunar}
            onClick={() => set('show_lunar', !prefs.show_lunar)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              prefs.show_lunar ? 'bg-[#1a1a2e]' : 'bg-stone-300'
            }`}
          >
            <span className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform mt-1 ${
              prefs.show_lunar ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {prefs.show_lunar && (
          <div className="pl-2 border-l-2 border-stone-200 space-y-2">
            {prefs.lunar_lat && prefs.lunar_lng ? (
              <p className="text-xs text-stone-500">
                Ubicación: {prefs.lunar_lat.toFixed(3)}, {prefs.lunar_lng.toFixed(3)}
              </p>
            ) : (
              <p className="text-xs text-stone-500">Sin ubicación — usando fase universal</p>
            )}
            <button
              type="button"
              onClick={detectLocation}
              className="text-xs underline text-[#1a1a2e]"
            >
              Detectar mi ubicación
            </button>
          </div>
        )}
      </div>

      {message && (
        <p className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar preferencias'}
      </Button>
    </form>
  )
}
