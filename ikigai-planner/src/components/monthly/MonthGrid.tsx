'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, isToday, parseISO, startOfMonth, getDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { getMonthDays, toISODateString } from '@/lib/utils/dates'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface MonthGridProps {
  year: number
  month: number
  userId: string
  onPrevMonth: () => void
  onNextMonth: () => void
}

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function MonthGrid({ year, month, userId, onPrevMonth, onNextMonth }: MonthGridProps) {
  const router = useRouter()
  const [plansSet, setPlansSet] = useState<Set<string>>(new Set())

  const days = getMonthDays(year, month)
  const firstDay = days[0]

  // getDay returns 0=Sun,1=Mon,...6=Sat — we need Monday-based offset
  const rawOffset = getDay(firstDay) // 0=Sun
  // Convert to Monday-based: Mon=0 ... Sun=6
  const offset = rawOffset === 0 ? 6 : rawOffset - 1

  // Build cells array: empty leading + actual days
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...days,
  ]

  // Pad to complete last row
  const remainder = cells.length % 7
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) cells.push(null)
  }

  useEffect(() => {
    const supabase = createClient()
    const firstDate = toISODateString(days[0])
    const lastDate = toISODateString(days[days.length - 1])

    supabase
      .from('daily_plans')
      .select('date')
      .eq('user_id', userId)
      .gte('date', firstDate)
      .lte('date', lastDate)
      .then(({ data }) => {
        if (data) {
          setPlansSet(new Set(data.map((d: { date: string }) => d.date)))
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, userId])

  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: es })
  const capitalizedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Month navigation header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <button
          onClick={onPrevMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors text-lg"
          title="Mes anterior"
        >
          ‹
        </button>

        <h2 className="text-sm font-semibold" style={{ color: '#e8b86d' }}>
          {capitalizedLabel}
        </h2>

        <button
          onClick={onNextMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors text-lg"
          title="Mes siguiente"
        >
          ›
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-semibold py-2 text-gray-500 uppercase tracking-wide"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="h-14 border-b border-r border-gray-50" />
          }

          const dateStr = toISODateString(date)
          const today = isToday(date)
          const hasPlan = plansSet.has(dateStr)

          return (
            <button
              key={dateStr}
              onClick={() => router.push(`/planner/${dateStr}`)}
              className={cn(
                'h-14 flex flex-col items-center justify-center border-b border-r border-gray-50 hover:bg-amber-50 transition-colors',
                today && 'font-bold',
              )}
              style={today ? { backgroundColor: '#e8b86d' } : undefined}
            >
              <span
                className={cn(
                  'text-sm',
                  today ? 'text-gray-900' : 'text-gray-700',
                )}
              >
                {date.getDate()}
              </span>
              {hasPlan && (
                <span
                  className="w-1.5 h-1.5 rounded-full mt-0.5"
                  style={{ backgroundColor: today ? '#1a1a2e' : '#e8b86d' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
