// src/app/(app)/settings/ProfileTab.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ProfileTab({ user }: { user: User }) {
  const router = useRouter()
  const [name, setName] = useState(
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''
  )
  const [avatarUrl, setAvatarUrl] = useState(
    user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? ''
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name, avatar_url: avatarUrl || undefined },
    })
    setSaving(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Perfil actualizado.' })
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-md">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-[#1a1a2e]"
            style={{ backgroundColor: '#e8b86d' }}
          >
            {name.charAt(0).toUpperCase() || '?'}
          </div>
        )}
        <div className="flex-1">
          <label className="block text-xs text-stone-500 mb-1">URL del avatar</label>
          <Input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Nombre</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Correo</label>
        <Input value={user.email ?? ''} disabled className="bg-stone-50" />
      </div>

      {message && (
        <p className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
