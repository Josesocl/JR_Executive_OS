'use client'

import { useEffect, useState } from 'react'
import { isAfter, startOfToday } from 'date-fns'
import { getMonthDays, toISODateString } from '@/lib/utils/dates'
import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitLog } from '@/lib/types'

interface HabitMatrixProps {
  userId: string
  year: number
  month: number
}

export function HabitMatrix({ userId, year, month }: HabitMatrixProps) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const days = getMonthDays(year, month)
  const today = startOfToday()

  useEffect(() => {
    setIsLoading(true)
    const supabase = createClient()
    const firstDate = toISODateString(days[0])
    const lastDate = toISODateString(days[days.length - 1])

    Promise.all([
      supabase
        .from('planner_habits')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('order_index'),
      supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', firstDate)
        .lte('date', lastDate),
    ]).then(([habitsRes, logsRes]) => {
      setHabits((habitsRes.data ?? []) as Habit[])
      setLogs((logsRes.data ?? []) as HabitLog[])
      setIsLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, year, month])

  // Build a lookup: habitId -> Set<dateStr>
  const logMap = new Map<string, Set<string>>()
  for (const log of logs) {
    if (!logMap.has(log.habit_id)) logMap.set(log.habit_id, new Set())
    if (log.completed) logMap.get(log.habit_id)!.add(log.date)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3
          className="text-sm font-bold uppercase tracking-wider mb-2"
          style={{ color: '#1a1a2e' }}
        >
          Matriz de Hábitos
        </h3>
        <p className="text-sm text-gray-400 italic">Sin hábitos activos</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 overflow-x-auto">
      <h3
        className="text-sm font-bold uppercase tracking-wider mb-3"
        style={{ color: '#1a1a2e' }}
      >
        Matriz de Hábitos
      </h3>

      <div className="inline-block min-w-full">
        {/* Day number header row */}
        <div className="flex items-center gap-0.5 mb-1">
          {/* Spacer for habit name column */}
          <div className="w-24 flex-shrink-0" />
          {days.map((d) => (
            <div
              key={d.getDate()}
              className="w-6 text-center text-xs text-gray-400"
              style={{ fontSize: '10px' }}
            >
              {d.getDate()}
            </div>
          ))}
        </div>

        {/* Habit rows */}
        <div className="space-y-1">
          {habits.map((habit) => {
            const completed = logMap.get(habit.id) ?? new Set()

            return (
              <div key={habit.id} className="flex items-center gap-0.5">
                {/* Habit name */}
                <div
                  className="w-24 flex-shrink-0 text-xs text-gray-700 truncate pr-2 font-medium"
                  title={habit.name}
                >
                  {habit.icon ? `${habit.icon} ` : ''}
                  {habit.name.length > 12 ? habit.name.slice(0, 12) + '…' : habit.name}
                </div>

                {/* Day cells */}
                {days.map((d) => {
                  const dateStr = toISODateString(d)
                  const isFuture = isAfter(d, today)
                  const isDone = completed.has(dateStr)

                  let bgColor = '#f3f4f6' // light gray = not done
                  if (isFuture) bgColor = 'transparent'
                  if (isDone) bgColor = '#e8b86d' // gold = done

                  return (
                    <div
                      key={dateStr}
                      className="w-6 h-6 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: bgColor, border: isFuture ? '1px solid #e5e7eb' : 'none' }}
                      title={`${habit.name} — ${dateStr}`}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
