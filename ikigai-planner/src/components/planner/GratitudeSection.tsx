'use client'

import { useRef } from 'react'
import type { GratitudeEntry } from '@/lib/types'

interface GratitudeSectionProps {
  entries: GratitudeEntry[]
  onUpdate: (id: string, text: string) => void
  onCreate: (text: string) => void
}

const POSITIONS = [1, 2, 3] as const

export function GratitudeSection({ entries, onUpdate, onCreate }: GratitudeSectionProps) {
  const timerRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pendingCreations = useRef<Set<number>>(new Set())

  const getEntry = (pos: number) => entries.find((e) => e.position === pos) ?? null

  const handleChange = (pos: number, text: string) => {
    const entry = getEntry(pos)

    if (entry) {
      const key = entry.id
      if (timerRefs.current[key]) clearTimeout(timerRefs.current[key])
      timerRefs.current[key] = setTimeout(() => {
        onUpdate(entry.id, text)
      }, 600)
    } else {
      // No entry yet — debounce a create
      const key = `create-${pos}`
      if (timerRefs.current[key]) clearTimeout(timerRefs.current[key])
      timerRefs.current[key] = setTimeout(() => {
        if (!pendingCreations.current.has(pos) && text.trim()) {
          pendingCreations.current.add(pos)
          onCreate(text.trim())
        }
      }, 800)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div
        className="px-4 py-3 border-b border-gray-100"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <h2 className="text-sm font-semibold text-white">Gratitud</h2>
        <p className="text-xs mt-0.5" style={{ color: '#e8b86d' }}>
          3 cosas por las que estoy agradecido/a hoy
        </p>
      </div>

      <div className="p-4 space-y-3">
        {POSITIONS.map((pos) => {
          const entry = getEntry(pos)
          return (
            <div key={pos} className="flex items-center gap-2">
              <span className="text-base">🙏</span>
              <input
                type="text"
                defaultValue={entry?.text ?? ''}
                onChange={(e) => handleChange(pos, e.target.value)}
                placeholder="Soy agradecido/a por..."
                className="flex-1 text-sm bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none py-1 transition-colors placeholder-gray-300"
                style={{ color: '#1a1a2e' }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
