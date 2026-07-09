'use client'

import { addDays, isToday, parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toISODateString } from '@/lib/utils/dates'
import { DayColumn } from './DayColumn'

interface WeekGridProps {
  weekStart: string
  userId: string
  onPrevWeek: () => void
  onNextWeek: () => void
}

export function WeekGrid({ weekStart, userId, onPrevWeek, onNextWeek }: WeekGridProps) {
  const monday = parseISO(weekStart)

  // Build the 7 days of the week
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i)
    return {
      date: toISODateString(d),
      isToday: isToday(d),
    }
  })

  const weekEnd = addDays(monday, 6)
  const startLabel = format(monday, 'd MMM', { locale: es })
  const endLabel = format(weekEnd, 'd MMM yyyy', { locale: es })
  // Capitalize first letters
  const weekLabel = `Semana del ${startLabel} – ${endLabel}`

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Week navigation header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <button
          onClick={onPrevWeek}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors text-lg"
          title="Semana anterior"
        >
          ‹
        </button>

        <h2 className="text-sm font-semibold" style={{ color: '#e8b86d' }}>
          {weekLabel}
        </h2>

        <button
          onClick={onNextWeek}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors text-lg"
          title="Semana siguiente"
        >
          ›
        </button>
      </div>

      {/* 7-column day grid */}
      <div className="grid grid-cols-7 gap-1.5 p-3">
        {days.map(({ date, isToday: today }) => (
          <DayColumn key={date} date={date} isToday={today} userId={userId} />
        ))}
      </div>
    </div>
  )
}
