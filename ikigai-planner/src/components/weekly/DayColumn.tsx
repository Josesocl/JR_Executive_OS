'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface DayColumnProps {
  date: string
  isToday: boolean
  userId: string
}

export function DayColumn({ date, isToday, userId }: DayColumnProps) {
  const [hasPlan, setHasPlan] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('daily_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle()
      .then(({ data }) => {
        setHasPlan(!!data)
      })
  }, [date, userId])

  const parsed = parseISO(date)
  // e.g. "Lun 26"
  const dayName = format(parsed, 'EEE', { locale: es })
  const dayNum = format(parsed, 'd')
  // Capitalize first letter
  const dayLabel = dayName.charAt(0).toUpperCase() + dayName.slice(1)

  return (
    <Link
      href={`/planner/${date}`}
      className="flex flex-col items-center rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition-transform"
      style={{ minWidth: 0 }}
    >
      {/* Header */}
      <div
        className={cn(
          'w-full flex flex-col items-center justify-center py-3 px-2',
        )}
        style={{
          backgroundColor: isToday ? '#e8b86d' : '#1a1a2e',
          color: isToday ? '#1a1a2e' : '#ffffff',
        }}
      >
        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {dayLabel}
        </span>
        <span className="text-2xl font-bold leading-tight">{dayNum}</span>
      </div>

      {/* Body */}
      <div
        className="w-full flex flex-col items-center justify-center py-3 flex-1 bg-white"
        style={{ minHeight: 56 }}
      >
        {hasPlan ? (
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: '#e8b86d' }}
            title="Tiene plan"
          />
        ) : (
          <span className="w-3 h-3 rounded-full bg-gray-200" title="Sin plan" />
        )}
      </div>
    </Link>
  )
}
