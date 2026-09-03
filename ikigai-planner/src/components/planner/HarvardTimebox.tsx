'use client'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { TimeBlockRow } from './TimeBlock'
import { useCalendarEvents, type AgendaEvent } from '@/hooks/useCalendarEvents'
import type { TimeBlock } from '@/lib/types'

const HOURS = [
  '05:00', '06:00', '07:00', '08:00', '09:00', '10:00',
  '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
]

/** Maps an "HH:mm" start time to the grid hour slot, clamped to 05–22. */
function slotFor(startLabel: string): string {
  let h = parseInt(startLabel.slice(0, 2), 10)
  if (Number.isNaN(h)) return '05:00'
  if (h < 5) h = 5
  if (h > 22) h = 22
  return String(h).padStart(2, '0') + ':00'
}

interface HarvardTimeboxProps {
  planId: string
  blocks: TimeBlock[]
  date: string
  onUpdateBlock: (id: string, data: Partial<TimeBlock>) => void
  onCreateBlock: (timeLabel: string) => void
}

/** Read-only band for a live Google Calendar event placed in the grid. */
function CalendarEventBand({ ev }: { ev: AgendaEvent }) {
  return (
    <div
      className="flex items-stretch min-h-[36px] border-b border-gray-100 select-none"
      style={{ backgroundColor: '#faf3e6' }}
      title={`${ev.startLabel}${ev.endLabel ? '–' + ev.endLabel : ''} · ${ev.title}${ev.location ? ' · ' + ev.location : ''}`}
    >
      {/* Gold marker rail */}
      <div className="w-1.5 self-stretch" style={{ backgroundColor: '#e8b86d' }} />

      {/* Time range */}
      <div className="w-[50px] flex-shrink-0 flex items-center justify-center text-[10px] font-mono text-center leading-tight px-1 border-r border-gray-100" style={{ color: '#b8860b' }}>
        {ev.startLabel}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center gap-2 px-3 py-1.5 text-sm">
        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#b8860b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
        </svg>
        <span className="font-medium text-[#1a1a2e] truncate">{ev.title}</span>
        {ev.endLabel && (
          <span className="text-xs text-stone-400 flex-shrink-0">
            {ev.startLabel}–{ev.endLabel}
          </span>
        )}
      </div>
    </div>
  )
}

export function HarvardTimebox({
  blocks,
  date,
  onUpdateBlock,
  onCreateBlock,
}: HarvardTimeboxProps) {
  const blockMap = new Map(blocks.map((b) => [b.time_label, b]))

  // Live Google Calendar events (deduped by React Query with DayAgenda).
  const { data: cal } = useCalendarEvents(date)
  const timed = (cal?.events ?? []).filter((e) => !e.allDay && e.startLabel)
  const allDay = (cal?.events ?? []).filter((e) => e.allDay)
  const eventsByHour = timed.reduce<Record<string, AgendaEvent[]>>((acc, e) => {
    ;(acc[slotFor(e.startLabel!)] ??= []).push(e)
    return acc
  }, {})

  const formattedDate = (() => {
    try {
      return format(parseISO(date), "EEEE, d 'de' MMMM yyyy", { locale: es })
        .replace(/^\w/, (c) => c.toUpperCase())
    } catch {
      return date
    }
  })()

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 border-b border-gray-100"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <h2 className="text-sm font-semibold text-white capitalize">{formattedDate}</h2>
        <p className="text-xs mt-0.5" style={{ color: '#e8b86d' }}>
          Harvard Timebox
        </p>
      </div>

      {/* All-day calendar events */}
      {allDay.map((ev) => (
        <div
          key={ev.id}
          className="flex items-center gap-2 min-h-[32px] px-3 border-b border-gray-100 text-sm select-none"
          style={{ backgroundColor: '#faf3e6' }}
        >
          <span className="text-[10px] font-mono uppercase tracking-wide" style={{ color: '#b8860b' }}>
            Todo el día
          </span>
          <span className="font-medium text-[#1a1a2e] truncate">{ev.title}</span>
        </div>
      ))}

      {/* Time slots */}
      <div>
        {HOURS.map((hour) => {
          const block = blockMap.get(hour)
          const hourEvents = eventsByHour[hour] ?? []

          return (
            <div key={hour}>
              {/* Google Calendar events starting in this hour (read-only) */}
              {hourEvents.map((ev) => (
                <CalendarEventBand key={ev.id} ev={ev} />
              ))}

              {block ? (
                <TimeBlockRow block={block} onUpdate={onUpdateBlock} />
              ) : (
                <button
                  className="flex items-center w-full min-h-[36px] border-b border-gray-100 text-left hover:bg-gray-50 transition-colors group"
                  onClick={() => onCreateBlock(hour)}
                >
                  {/* Left bar placeholder */}
                  <div className="w-1.5 self-stretch bg-gray-100" />

                  {/* Time label */}
                  <div className="w-[50px] flex-shrink-0 flex items-center justify-center text-xs font-mono text-gray-400 border-r border-gray-100 px-1">
                    {hour}
                  </div>

                  {/* Empty content area */}
                  <div className="flex-1 px-3 py-1.5 text-xs text-gray-300 group-hover:text-gray-400 transition-colors">
                    + agregar bloque
                  </div>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
