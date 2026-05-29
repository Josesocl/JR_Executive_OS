# Settings Page — Design Spec

**Date:** 2026-05-29  
**Status:** Approved  

---

## Overview

Add a `/settings` route to IKIGAI Planner with three tabs: **Perfil**, **Preferencias**, and **Integraciones**. The page uses the existing app layout (Sidebar + main content area) and follows the established design language (`#1a1a2e`, `#e8b86d`, stone/white palette).

---

## Tab 1: Perfil

**Fields:**
- Full name — editable text input, saved to Supabase `auth.users.raw_user_meta_data.full_name` via `supabase.auth.updateUser()`
- Email — read-only, sourced from `user.email`
- Avatar — displays current photo (Google OAuth `picture` / `avatar_url`); text input to override with a custom URL

**Behaviour:**
- Single "Guardar cambios" button; shows success toast on save, inline error on failure
- No page reload required — updates `user` state in place

---

## Tab 2: Preferencias

**Fields:**

| Setting | Options | Default |
|---------|---------|---------|
| Formato de hora | 24h / 12h AM-PM | 24h |
| Inicio de semana | Lunes / Domingo / Sábado | Lunes |
| Numeración de semanas | Activado / Desactivado | Activado |
| Ciclo lunar | Activado / Desactivado | Desactivado |
| Ubicación (para luna) | Auto-detect (browser geolocation) / Manual (ciudad o lat-lng) | Auto |

**Week numbers:** ISO 8601 (weeks 1–52 or 53). Leap year handling is automatic via `date-fns/getISOWeek`.

**Lunar cycle:** Computed client-side with `suncalc` (no external API). Shows phase name + emoji in the planner date header when enabled. Geolocation used only for moonrise/moonset times — phase itself is universal.

**Storage:** Preferences saved to a `user_preferences` Supabase table (one row per user, upsert on save). Schema:

```sql
create table user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  time_format text not null default '24h',        -- '24h' | '12h'
  week_start text not null default 'monday',       -- 'monday' | 'sunday' | 'saturday'
  show_week_numbers boolean not null default true,
  show_lunar boolean not null default false,
  lunar_lat numeric,
  lunar_lng numeric,
  updated_at timestamptz not null default now()
);
alter table user_preferences enable row level security;
create policy "owner" on user_preferences for all using (auth.uid() = user_id);
```

---

## Tab 3: Integraciones

### Google Calendar (Phase 1 — implemented)

**Connect flow:**
1. User clicks "Conectar Google Calendar"
2. `/api/integrations/google/auth` redirects to Google OAuth with scopes `calendar.readonly calendar.events`
3. Callback at `/api/integrations/google/callback` exchanges code for tokens, stores in `user_integrations`
4. Settings page refreshes to show connected state

**Connected state UI:**
- Shows account email + avatar
- List of calendars from Google with checkbox per calendar (stored in `user_integrations.calendars` JSON)
- Toggle: "Mostrar eventos en el planner" (read)
- Toggle: "Permitir crear eventos desde el planner" (write)
- "Desconectar" button (revokes token, deletes row)

**Token storage — `user_integrations` table:**

```sql
create table user_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,                          -- 'google'
  account_email text,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scopes text[],
  calendars jsonb,                                 -- [{id, name, active}]
  sync_read boolean not null default true,
  sync_write boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider)
);
alter table user_integrations enable row level security;
create policy "owner" on user_integrations for all using (auth.uid() = user_id);
```

Tokens are never sent to the client — all Google API calls go through Next.js server actions or API routes.

### Other providers (Phase 2 — UI only)

Outlook, iCloud, and a generic "Otras" card shown with a "Próximamente" badge, visually disabled. No functionality wired.

---

## Architecture

```
src/app/(app)/settings/
  page.tsx          — server component, loads user + preferences
  SettingsTabs.tsx  — 'use client' tabs shell
  ProfileTab.tsx    — profile form
  PreferencesTab.tsx — preferences form + suncalc integration
  IntegrationsTab.tsx — calendar connect/disconnect UI

src/app/api/integrations/google/
  auth/route.ts     — initiates Google OAuth redirect
  callback/route.ts — handles code exchange, stores tokens

src/hooks/useUserPreferences.ts — client hook to read/update preferences
src/lib/google-calendar.ts      — server-side Google Calendar API wrapper
```

**env vars needed:**
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://ikigai-planner-omega.vercel.app/api/integrations/google/callback
```

---

## Out of Scope

- Onboarding / help guides (separate feature)
- Pushing IKIGAI tasks to Google Calendar (separate feature)
- Outlook / iCloud API integration (Phase 2)
- Notification settings
