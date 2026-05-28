'use client'

import { useState } from 'react'
import { MonthGrid } from '@/components/monthly/MonthGrid'
import { HabitMatrix } from '@/components/monthly/HabitMatrix'
import { MonthlyGoalsList } from '@/components/monthly/MonthlyGoalsList'

interface MonthlyViewProps {
  userId: string
  year: number
  month: number
}

export function MonthlyView({ userId, year: initialYear, month: initialMonth }: MonthlyViewProps) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-full" style={{ backgroundColor: '#f0ece4' }}>
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>
          Vista Mensual
        </h1>
      </div>

      <MonthGrid
        year={year}
        month={month}
        userId={userId}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      <HabitMatrix userId={userId} year={year} month={month} />

      <MonthlyGoalsList userId={userId} year={year} month={month} />
    </div>
  )
}
