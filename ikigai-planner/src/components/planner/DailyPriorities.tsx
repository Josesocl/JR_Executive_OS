'use client'

import { useRef } from 'react'
import type { DailyPriority } from '@/lib/types'

interface DailyPrioritiesProps {
  priorities: DailyPriority[]
  onUpdate: (id: string, data: Partial<DailyPriority>) => void
  planId: string
  onCreatePriority: (position: 1 | 2 | 3) => void
}

const POSITIONS = [1, 2, 3] as const

export function DailyPriorities({
  priorities,
  onUpdate,
  onCreatePriority,
}: DailyPrioritiesProps) {
  const timerRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const getPriority = (pos: 1 | 2 | 3) =>
    priorities.find((p) => p.position === pos) ?? null

  const handleTextChange = (id: string, text: string) => {
    if (timerRefs.current[id]) clearTimeout(timerRefs.current[id])
    timerRefs.current[id] = setTimeout(() => {
      onUpdate(id, { text })
    }, 500)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div
        className="px-4 py-3 border-b border-gray-100"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <h2 className="text-sm font-semibold text-white">3 Prioridades del Día</h2>
        <p className="text-xs mt-0.5" style={{ color: '#e8b86d' }}>
          MIT — Most Important Tasks
        </p>
      </div>

      <div className="p-4 space-y-3">
        {POSITIONS.map((pos) => {
          const priority = getPriority(pos)

          return (
            <div key={pos} className="flex items-center gap-3">
              {/* Numbered badge */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: '#e8b86d', color: '#1a1a2e' }}
              >
                {pos}
              </div>

              {/* Checkbox */}
              <input
                type="checkbox"
                checked={priority?.completed ?? false}
                onChange={(e) => {
                  if (priority) onUpdate(priority.id, { completed: e.target.checked })
                }}
                disabled={!priority}
                className="w-4 h-4 rounded accent-amber-400 flex-shrink-0"
              />

              {/* Text input */}
              {priority ? (
                <input
                  type="text"
                  defaultValue={priority.text}
                  onChange={(e) => handleTextChange(priority.id, e.target.value)}
                  placeholder={`Prioridad ${pos}...`}
                  className="flex-1 text-sm bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none py-1 transition-colors"
                  style={{
                    color: '#1a1a2e',
                    textDecoration: priority.completed ? 'line-through' : 'none',
                    opacity: priority.completed ? 0.5 : 1,
                  }}
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Prioridad ${pos}...`}
                  onFocus={() => onCreatePriority(pos)}
                  className="flex-1 text-sm bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none py-1 transition-colors text-gray-400"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
