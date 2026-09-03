'use client'

import { useQuery } from '@tanstack/react-query'
import type { AgendaEvent } from '@/app/api/integrations/google/events/route'

export type { AgendaEvent }

interface EventsResponse {
  connected: boolean
  needsReconnect?: boolean
  error?: string
  events: AgendaEvent[]
}

/**
 * Fetches Google Calendar events for the Santiago-local range [from, to]
 * (inclusive, YYYY-MM-DD). Live-fetched via the app's API route.
 */
export function useCalendarEvents(from: string, to: string = from) {
  return useQuery({
    queryKey: ['calendar-events', from, to],
    queryFn: async (): Promise<EventsResponse> => {
      const res = await fetch(
        `/api/integrations/google/events?from=${from}&to=${to}`,
      )
      if (!res.ok) throw new Error('No se pudieron cargar los eventos')
      return res.json()
    },
    staleTime: 60_000,
    enabled: !!from,
  })
}
