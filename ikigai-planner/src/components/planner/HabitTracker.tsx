'use client'

import type { Habit, HabitLog } from '@/lib/types'

interface HabitTrackerProps {
  habits: Habit[]
  logs: HabitLog[]
  date: string
  onToggle: (habitId: string) => void
}

export function HabitTracker({ habits, logs, onToggle }: HabitTrackerProps) {
  const loggedIds = new Set(logs.filter((l) => l.completed).map((l) => l.habit_id))

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div
        className="px-4 py-3 border-b border-gray-100"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <h2 className="text-sm font-semibold text-white">Hábitos</h2>
      </div>

      <div className="p-3">
        {habits.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">
            No hay hábitos activos. Configúralos en ajustes.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {habits.map((habit) => {
              const done = loggedIds.has(habit.id)
              return (
                <button
                  key={habit.id}
                  onClick={() => onToggle(habit.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                  style={{
                    backgroundColor: done ? '#e8b86d' : '#f5f5f5',
                    borderColor: done ? '#d4a050' : '#e0e0e0',
                    color: done ? '#1a1a2e' : '#555',
                    opacity: done ? 1 : 0.75,
                  }}
                >
                  {habit.icon && <span>{habit.icon}</span>}
                  <span>{habit.name}</span>
                  {done && <span className="ml-0.5">✓</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
