'use client'

import Link from 'next/link'
import { CalendarDays, MapPin } from 'lucide-react'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'

interface DayAgendaProps {
  date: string
}

export function DayAgenda({ date }: DayAgendaProps) {
  const { data, isLoading } = useCalendarEvents(date)

  // The Timebox grid now shows connected events in their time slots, so this
  // card only needs to appear when there's something to act on: still loading,
  // not connected, or the connection expired. When connected with events (or
  // simply no events), render nothing to avoid duplicating the grid.
  if (data?.connected && !data.needsReconnect) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <CalendarDays className="w-4 h-4" style={{ color: '#e8b86d' }} />
        <h2 className="text-sm font-semibold text-white">Agenda de Google Calendar</h2>
      </div>

      <div className="p-4">
        {isLoading && (
          <div className="space-y-2 animate-pulse">
            <div className="h-9 bg-gray-100 rounded-lg" />
            <div className="h-9 bg-gray-100 rounded-lg" />
          </div>
        )}

        {!isLoading && data && !data.connected && (
          <p className="text-sm text-stone-500">
            No has conectado Google Calendar.{' '}
            <Link
              href="/settings?tab=integrations"
              className="font-medium underline"
              style={{ color: '#1a1a2e' }}
            >
              Conectar
            </Link>
          </p>
        )}

        {!isLoading && data?.connected && data.needsReconnect && (
          <p className="text-sm text-stone-500">
            La conexión con Google expiró.{' '}
            <Link
              href="/settings?tab=integrations"
              className="font-medium underline"
              style={{ color: '#1a1a2e' }}
            >
              Reconectar
            </Link>
          </p>
        )}

        {!isLoading && data?.connected && !data.needsReconnect && data.events.length === 0 && (
          <p className="text-sm text-stone-400">Sin eventos para este día.</p>
        )}

        {!isLoading && data?.connected && data.events.length > 0 && (
          <ul className="space-y-2">
            {data.events.map((ev) => (
              <li
                key={ev.id}
                className="flex gap-3 items-start rounded-lg px-3 py-2"
                style={{ backgroundColor: '#f6f3ec' }}
              >
                <div
                  className="text-xs font-semibold tabular-nums pt-0.5 flex-shrink-0"
                  style={{ color: '#b8860b', minWidth: 44 }}
                >
                  {ev.allDay ? 'Todo el día' : ev.startLabel}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1a1a2e] leading-snug">
                    {ev.title}
                  </p>
                  {!ev.allDay && ev.endLabel && (
                    <p className="text-xs text-stone-400">
                      {ev.startLabel}–{ev.endLabel}
                    </p>
                  )}
                  {ev.location && (
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
