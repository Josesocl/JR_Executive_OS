'use client'

import { useRef, useCallback } from 'react'
import type { DailyPlan } from '@/lib/types'

interface DayReflectionProps {
  plan: DailyPlan | null
  onUpdate: (data: Partial<DailyPlan>) => void
}

const MOODS = ['😞', '😕', '😐', '🙂', '😊'] as const

export function DayReflection({ plan, onUpdate }: DayReflectionProps) {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const debounce = useCallback(
    (key: string, fn: () => void, ms = 500) => {
      if (timers.current[key]) clearTimeout(timers.current[key])
      timers.current[key] = setTimeout(fn, ms)
    },
    [],
  )

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div
        className="px-4 py-3 border-b border-gray-100"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <h2 className="text-sm font-semibold text-white">Reflexión del Día</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Win */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            🏆 Victoria del día
          </label>
          <input
            type="text"
            defaultValue={plan?.win ?? ''}
            onChange={(e) => {
              const v = e.target.value
              debounce('win', () => onUpdate({ win: v }))
            }}
            placeholder="¿Cuál fue tu mayor logro hoy?"
            className="w-full text-sm bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-amber-300 transition-all border border-gray-100"
            style={{ color: '#1a1a2e' }}
          />
        </div>

        {/* Intention */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            🎯 Intención
          </label>
          <input
            type="text"
            defaultValue={plan?.intention ?? ''}
            onChange={(e) => {
              const v = e.target.value
              debounce('intention', () => onUpdate({ intention: v }))
            }}
            placeholder="¿Con qué intención afrontas este día?"
            className="w-full text-sm bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-amber-300 transition-all border border-gray-100"
            style={{ color: '#1a1a2e' }}
          />
        </div>

        {/* Mood */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Estado de ánimo
          </label>
          <div className="flex gap-2">
            {MOODS.map((emoji, i) => {
              const v = i + 1
              const selected = plan?.mood === v
              return (
                <button
                  key={v}
                  onClick={() => onUpdate({ mood: v })}
                  className="text-2xl transition-all leading-none"
                  style={{
                    transform: selected ? 'scale(1.25)' : 'scale(1)',
                    filter: selected ? 'none' : 'grayscale(0.5) opacity(0.6)',
                  }}
                  title={`Estado ${v}`}
                >
                  {emoji}
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            📝 Notas
          </label>
          <textarea
            defaultValue={plan?.notes ?? ''}
            onChange={(e) => {
              const v = e.target.value
              debounce('notes', () => onUpdate({ notes: v }))
            }}
            placeholder="Pensamientos libres del día..."
            rows={3}
            className="w-full text-sm bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-amber-300 transition-all border border-gray-100 resize-none"
            style={{ color: '#1a1a2e' }}
          />
        </div>
      </div>
    </div>
  )
}
