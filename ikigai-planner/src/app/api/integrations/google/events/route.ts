// src/app/api/integrations/google/events/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listEvents, refreshAccessToken, type GoogleEvent } from '@/lib/google-calendar'

const TZ = 'America/Santiago'

/** Santiago-local YYYY-MM-DD for an instant (DST-safe via Intl). */
function localDate(instantISO: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(instantISO))
}

/** Santiago-local HH:mm for an instant. */
function localTime(instantISO: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(instantISO))
}

export interface AgendaEvent {
  id: string
  title: string
  location: string | null
  allDay: boolean
  date: string // Santiago YYYY-MM-DD the event starts on
  startLabel: string | null // HH:mm, null for all-day
  endLabel: string | null
  startInstant: string | null // raw ISO for later grid placement
  endInstant: string | null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') // YYYY-MM-DD
  const to = searchParams.get('to') ?? from

  if (!from || !to) {
    return NextResponse.json({ error: 'from/to required' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Load the user's Google integration
  const { data: integration } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .maybeSingle()

  if (!integration) {
    return NextResponse.json({ connected: false, events: [] })
  }

  // Refresh the access token if it has expired (or is about to)
  let accessToken: string = integration.access_token
  const expiresAt = integration.expires_at ? new Date(integration.expires_at).getTime() : 0
  if (expiresAt && Date.now() >= expiresAt - 60_000) {
    if (!integration.refresh_token) {
      return NextResponse.json({ connected: true, needsReconnect: true, events: [] })
    }
    try {
      const refreshed = await refreshAccessToken(integration.refresh_token)
      accessToken = refreshed.access_token
      await supabase
        .from('user_integrations')
        .update({
          access_token: refreshed.access_token,
          expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', integration.id)
    } catch {
      return NextResponse.json({ connected: true, needsReconnect: true, events: [] })
    }
  }

  // Fetch a generous UTC window (±1 day) covering the requested local range,
  // then filter precisely by Santiago-local date to stay DST-safe.
  const timeMin = new Date(`${from}T00:00:00Z`)
  timeMin.setUTCDate(timeMin.getUTCDate() - 1)
  const timeMax = new Date(`${to}T00:00:00Z`)
  timeMax.setUTCDate(timeMax.getUTCDate() + 2)

  let raw: GoogleEvent[]
  try {
    raw = await listEvents(accessToken, 'primary', timeMin.toISOString(), timeMax.toISOString())
  } catch (err) {
    console.error('Google events fetch error:', err)
    return NextResponse.json({ connected: true, error: 'fetch_failed', events: [] })
  }

  const events: AgendaEvent[] = raw
    .filter((e) => e.status !== 'cancelled')
    .map((e): AgendaEvent | null => {
      const startDT = e.start?.dateTime
      const endDT = e.end?.dateTime
      if (startDT) {
        return {
          id: e.id,
          title: e.summary?.trim() || '(sin título)',
          location: e.location ?? null,
          allDay: false,
          date: localDate(startDT),
          startLabel: localTime(startDT),
          endLabel: endDT ? localTime(endDT) : null,
          startInstant: startDT,
          endInstant: endDT ?? null,
        }
      }
      // All-day event: start.date is already a YYYY-MM-DD in local terms
      if (e.start?.date) {
        return {
          id: e.id,
          title: e.summary?.trim() || '(sin título)',
          location: e.location ?? null,
          allDay: true,
          date: e.start.date,
          startLabel: null,
          endLabel: null,
          startInstant: null,
          endInstant: null,
        }
      }
      return null
    })
    .filter((e): e is AgendaEvent => e !== null && e.date >= from && e.date <= to)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1
      return (a.startLabel ?? '') < (b.startLabel ?? '') ? -1 : 1
    })

  return NextResponse.json({ connected: true, events })
}
