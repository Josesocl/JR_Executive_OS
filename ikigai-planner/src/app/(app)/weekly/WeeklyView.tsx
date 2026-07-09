'use client'

import { useState } from 'react'
import { addWeeks, subWeeks } from 'date-fns'
import { getWeekStart, toISODateString } from '@/lib/utils/dates'
import { WeekGrid } from '@/components/weekly/WeekGrid'
import { WeeklyGoalsList } from '@/components/weekly/WeeklyGoalsList'

interface WeeklyViewProps {
  userId: string
  weekStart: string
}

export function WeeklyView({ userId, weekStart: initialWeekStart }: WeeklyViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(initialWeekStart)

  const handlePrevWeek = () => {
    const prev = subWeeks(new Date(currentWeekStart + 'T00:00:00'), 1)
    setCurrentWeekStart(toISODateString(getWeekStart(prev)))
  }

  const handleNextWeek = () => {
    const next = addWeeks(new Date(currentWeekStart + 'T00:00:00'), 1)
    setCurrentWeekStart(toISODateString(getWeekStart(next)))
  }

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-full" style={{ backgroundColor: '#f0ece4' }}>
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>
          Vista Semanal
        </h1>
      </div>

      <WeekGrid
        weekStart={currentWeekStart}
        userId={userId}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />

      <WeeklyGoalsList userId={userId} weekStart={currentWeekStart} />
    </div>
  )
}
