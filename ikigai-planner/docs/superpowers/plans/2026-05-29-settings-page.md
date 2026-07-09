# Settings Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/settings` page with three tabs — Perfil, Preferencias (timezone, week format, lunar cycle), and Integraciones (Google Calendar OAuth + coming-soon cards for Outlook/iCloud).

**Architecture:** Server component loads user + preferences + integrations from Supabase, passes them as props to a client-side tabs shell. Each tab is a focused client component. Google Calendar OAuth runs through two Next.js API routes (`/api/integrations/google/auth` and `/api/integrations/google/callback`); tokens stay server-side.

**Tech Stack:** Next.js 16 App Router, Supabase SSR, Radix UI Tabs + Select (already installed), `suncalc` for lunar phase, Google Calendar REST API via `fetch` (no googleapis package).

---

## File Map

| Action | Path |
|--------|------|
| Create | `src/components/ui/tabs.tsx` |
| Create | `src/components/ui/select.tsx` |
| Create | `src/app/(app)/settings/page.tsx` |
| Create | `src/app/(app)/settings/SettingsTabs.tsx` |
| Create | `src/app/(app)/settings/ProfileTab.tsx` |
| Create | `src/app/(app)/settings/PreferencesTab.tsx` |
| Create | `src/app/(app)/settings/IntegrationsTab.tsx` |
| Create | `src/hooks/useUserPreferences.ts` |
| Create | `src/lib/google-calendar.ts` |
| Create | `src/app/api/integrations/google/auth/route.ts` |
| Create | `src/app/api/integrations/google/callback/route.ts` |
| Modify | `.env.local` |

---

## Task 1: DB Migrations

**Files:** Supabase migrations via MCP or dashboard SQL editor

- [ ] **Step 1: Run `user_preferences` migration**

In Supabase dashboard → SQL editor (or via MCP `apply_migration`):

```sql
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  time_format text not null default '24h',
  week_start text not null default 'monday',
  show_week_numbers boolean not null default true,
  show_lunar boolean not null default false,
  lunar_lat numeric,
  lunar_lng numeric,
  updated_at timestamptz not null default now()
);
alter table public.user_preferences enable row level security;
create policy "owner_preferences" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [ ] **Step 2: Run `user_integrations` migration**

```sql
create table if not exists public.user_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  account_email text,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scopes text[],
  calendars jsonb,
  sync_read boolean not null default true,
  sync_write boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider)
);
alter table public.user_integrations enable row level security;
create policy "owner_integrations" on public.user_integrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [ ] **Step 3: Verify tables exist**

Run in SQL editor:
```sql
select table_name from information_schema.tables
where table_schema = 'public'
and table_name in ('user_preferences', 'user_integrations');
```
Expected: 2 rows returned.

---

## Task 2: UI Primitives — Tabs + Select

**Files:**
- Create: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/select.tsx`

- [ ] **Step 1: Create `tabs.tsx`**

```tsx
// src/components/ui/tabs.tsx
'use client'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root
const TabsList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      'flex border-b border-stone-200 gap-0',
      className,
    )}
    {...props}
  />
)
const TabsTrigger = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      'px-5 py-2.5 text-sm font-medium text-stone-500 border-b-2 border-transparent -mb-px transition-colors',
      'hover:text-[#1a1a2e]',
      'data-[state=active]:text-[#1a1a2e] data-[state=active]:border-[#e8b86d]',
    )}
    {...props}
  />
)
const TabsContent = TabsPrimitive.Content

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

- [ ] **Step 2: Create `select.tsx`**

```tsx
// src/components/ui/select.tsx
'use client'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const Select = SelectPrimitive.Root
const SelectValue = SelectPrimitive.Value

const SelectTrigger = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) => (
  <SelectPrimitive.Trigger
    className={cn(
      'flex h-9 w-full items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:ring-offset-1',
      'disabled:opacity-50',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon>
      <ChevronDown className="w-4 h-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
)

const SelectContent = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-stone-200 bg-white shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        className,
      )}
      position="popper"
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
)

const SelectItem = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
      'focus:bg-stone-100 data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
)

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/tabs.tsx src/components/ui/select.tsx
git commit -m "feat(ui): add Tabs and Select primitives"
```

---

## Task 3: Settings Page Shell

**Files:**
- Create: `src/app/(app)/settings/page.tsx`
- Create: `src/app/(app)/settings/SettingsTabs.tsx`

- [ ] **Step 1: Create server component `page.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `SettingsTabs.tsx` shell**

```tsx
// src/app/(app)/settings/SettingsTabs.tsx
'use client'
import type { User } from '@supabase/supabase-js'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ProfileTab } from './ProfileTab'
import { PreferencesTab } from './PreferencesTab'
import { IntegrationsTab } from './IntegrationsTab'

interface UserPreferences {
  time_format: string
  week_start: string
  show_week_numbers: boolean
  show_lunar: boolean
  lunar_lat: number | null
  lunar_lng: number | null
}

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
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <Tabs defaultValue="profile">
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
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/settings/
git commit -m "feat(settings): page shell with tabs"
```

---

## Task 4: Profile Tab

**Files:**
- Create: `src/app/(app)/settings/ProfileTab.tsx`

- [ ] **Step 1: Create `ProfileTab.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, open http://localhost:3000/settings, click "Perfil" tab. Edit name, save. Confirm name updates in sidebar.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/settings/ProfileTab.tsx
git commit -m "feat(settings): profile tab"
```

---

## Task 5: Preferences Tab

**Files:**
- Modify: `package.json` (add `suncalc`)
- Create: `src/hooks/useUserPreferences.ts`
- Create: `src/app/(app)/settings/PreferencesTab.tsx`

- [ ] **Step 1: Install suncalc**

```bash
cd ikigai-planner && npm install suncalc && npm install --save-dev @types/suncalc
```

- [ ] **Step 2: Create `useUserPreferences` hook**

```ts
// src/hooks/useUserPreferences.ts
import { createClient } from '@/lib/supabase/client'

export interface UserPreferences {
  user_id: string
  time_format: '24h' | '12h'
  week_start: 'monday' | 'sunday' | 'saturday'
  show_week_numbers: boolean
  show_lunar: boolean
  lunar_lat: number | null
  lunar_lng: number | null
}

const DEFAULTS: Omit<UserPreferences, 'user_id'> = {
  time_format: '24h',
  week_start: 'monday',
  show_week_numbers: true,
  show_lunar: false,
  lunar_lat: null,
  lunar_lng: null,
}

export async function savePreferences(
  userId: string,
  prefs: Omit<UserPreferences, 'user_id'>,
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from('user_preferences').upsert(
    { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  )
  return { error: error?.message ?? null }
}

export function mergeWithDefaults(
  prefs: Partial<UserPreferences> | null,
): Omit<UserPreferences, 'user_id'> {
  return { ...DEFAULTS, ...prefs }
}
```

- [ ] **Step 3: Create `PreferencesTab.tsx`**

```tsx
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
      {/* Formato de hora */}
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

      {/* Inicio de semana */}
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

      {/* Numeración de semanas */}
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

      {/* Ciclo lunar */}
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
```

- [ ] **Step 4: Verify in browser**

Open http://localhost:3000/settings → tab "Preferencias". Change format, week start, toggles. Save. Reload and confirm values persist.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useUserPreferences.ts src/app/\(app\)/settings/PreferencesTab.tsx package.json package-lock.json
git commit -m "feat(settings): preferences tab with time format, week start, lunar cycle"
```

---

## Task 6: Google Calendar OAuth Routes

**Files:**
- Modify: `.env.local`
- Create: `src/lib/google-calendar.ts`
- Create: `src/app/api/integrations/google/auth/route.ts`
- Create: `src/app/api/integrations/google/callback/route.ts`

- [ ] **Step 1: Add env vars to `.env.local`**

In Google Cloud Console → Credentials → your OAuth client → add redirect URI:
```
http://localhost:3000/api/integrations/google/callback
https://ikigai-planner-omega.vercel.app/api/integrations/google/callback
```

Then add to `.env.local`:
```
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google/callback
```

Also add to Vercel env vars:
```bash
echo "<client-id>" | vercel env add GOOGLE_CLIENT_ID production --yes
echo "<client-secret>" | vercel env add GOOGLE_CLIENT_SECRET production --yes
echo "https://ikigai-planner-omega.vercel.app/api/integrations/google/callback" | vercel env add GOOGLE_REDIRECT_URI production --yes
```

- [ ] **Step 2: Create `src/lib/google-calendar.ts`**

```ts
// src/lib/google-calendar.ts

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

export interface GoogleTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
}

export interface GoogleCalendar {
  id: string
  summary: string
  primary?: boolean
  backgroundColor?: string
}

export function buildAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<GoogleTokens> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`)
  return res.json()
}

export async function getAccountEmail(accessToken: string): Promise<string> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  return data.email as string
}

export async function listCalendars(accessToken: string): Promise<GoogleCalendar[]> {
  const res = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  return (data.items ?? []) as GoogleCalendar[]
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`)
  return res.json()
}
```

- [ ] **Step 3: Create `/api/integrations/google/auth/route.ts`**

```ts
// src/app/api/integrations/google/auth/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildAuthUrl } from '@/lib/google-calendar'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SUPABASE_URL!))

  const redirectUri = process.env.GOOGLE_REDIRECT_URI!
  const authUrl = buildAuthUrl(redirectUri)
  return NextResponse.redirect(authUrl)
}
```

- [ ] **Step 4: Create `/api/integrations/google/callback/route.ts`**

```ts
// src/app/api/integrations/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  exchangeCodeForTokens,
  getAccountEmail,
  listCalendars,
} from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/settings?tab=integrations&error=google_denied`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI!
    const tokens = await exchangeCodeForTokens(code, redirectUri)
    const accountEmail = await getAccountEmail(tokens.access_token)
    const calendars = await listCalendars(tokens.access_token)

    const calendarList = calendars.map((c) => ({
      id: c.id,
      name: c.summary,
      active: c.primary ?? false,
    }))

    await supabase.from('user_integrations').upsert(
      {
        user_id: user.id,
        provider: 'google',
        account_email: accountEmail,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        scopes: tokens.scope.split(' '),
        calendars: calendarList,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' },
    )

    return NextResponse.redirect(`${origin}/settings?tab=integrations&connected=google`)
  } catch (err) {
    console.error('Google Calendar callback error:', err)
    return NextResponse.redirect(`${origin}/settings?tab=integrations&error=google_failed`)
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/google-calendar.ts src/app/api/integrations/ .env.local
git commit -m "feat(settings): Google Calendar OAuth routes"
```

---

## Task 7: Integrations Tab

**Files:**
- Create: `src/app/(app)/settings/IntegrationsTab.tsx`
- Modify: `src/app/(app)/settings/SettingsTabs.tsx` (pass `searchParams` for toast)

- [ ] **Step 1: Create `IntegrationsTab.tsx`**

```tsx
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

      {/* Coming soon cards */}
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
```

- [ ] **Step 2: Verify Google Calendar connect flow**

1. Open http://localhost:3000/settings → Integraciones tab
2. Click "Conectar" → should redirect to Google consent
3. Authorize → should return to `/settings?tab=integrations&connected=google`
4. Should show account email + calendar list

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/settings/IntegrationsTab.tsx
git commit -m "feat(settings): integrations tab — Google Calendar + coming soon cards"
```

---

## Task 8: Wire Tab from URL param

**Files:**
- Modify: `src/app/(app)/settings/SettingsTabs.tsx`

The callback redirects to `/settings?tab=integrations`. Wire `defaultValue` from the URL:

- [ ] **Step 1: Update `SettingsTabs.tsx` to read `tab` param**

```tsx
// Add to imports
import { useSearchParams } from 'next/navigation'

// Inside SettingsTabs component, replace:
// const [tab, setTab] = ...
// with:
const params = useSearchParams()
const defaultTab = params.get('tab') ?? 'profile'

// Change <Tabs defaultValue="profile"> to:
// <Tabs defaultValue={defaultTab}>
```

Full updated `SettingsTabs.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/settings/SettingsTabs.tsx
git commit -m "feat(settings): open correct tab from URL param after OAuth callback"
```

---

## Task 9: Deploy

- [ ] **Step 1: Build locally to verify**

```bash
cd ikigai-planner && npm run build
```
Expected: all routes compile, no TS errors.

- [ ] **Step 2: Deploy to Vercel**

```bash
cd ikigai-planner && vercel pull --yes --environment production && vercel build --prod --yes && vercel deploy --prebuilt --prod --yes
```

- [ ] **Step 3: Add production Google redirect URI**

In Google Cloud Console, confirm this URI is in the OAuth client:
```
https://ikigai-planner-omega.vercel.app/api/integrations/google/callback
```

- [ ] **Step 4: Smoke test on production**

Open https://ikigai-planner-omega.vercel.app/settings and verify all three tabs load, preferences save, and Google Calendar connects.
