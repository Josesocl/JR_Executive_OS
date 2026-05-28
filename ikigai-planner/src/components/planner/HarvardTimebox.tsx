'use client'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { TimeBlockRow } from './TimeBlock'
import type { TimeBlock } from '@/lib/types'

const HOURS = [
  '05:00', '06:00', '07:00', '08:00', '09:00', '10:00',
  '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
]

interface HarvardTimeboxProps {
  planId: string
  blocks: TimeBlock[]
  date: string
  onUpdateBlock: (id: string, data: Partial<TimeBlock>) => void
  onCreateBlock: (timeLabel: string) => void
}

export function HarvardTimebox({
  blocks,
  date,
  onUpdateBlock,
  onCreateBlock,
}: HarvardTimeboxProps) {
  const blockMap = new Map(blocks.map((b) => [b.time_label, b]))

  const formattedDate = (() => {
    try {
      return format(parseISO(date), "EEEE, d 'de' MMMM yyyy", { locale: es })
        .replace(/^\w/, (c) => c.toUpperCase())
    } catch {
      return date
    }
  })()

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 border-b border-gray-100"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <h2 className="text-sm font-semibold text-white capitalize">{formattedDate}</h2>
        <p className="text-xs mt-0.5" style={{ color: '#e8b86d' }}>
          Harvard Timebox
        </p>
      </div>

      {/* Time slots */}
      <div>
        {HOURS.map((hour) => {
          const block = blockMap.get(hour)

          if (block) {
            return (
              <TimeBlockRow key={block.id} block={block} onUpdate={onUpdateBlock} />
            )
          }

          // Empty placeholder
          return (
            <button
              key={hour}
              className="flex items-center w-full min-h-[36px] border-b border-gray-100 text-left hover:bg-gray-50 transition-colors group"
              onClick={() => onCreateBlock(hour)}
            >
              {/* Left bar placeholder */}
              <div className="w-1.5 self-stretch bg-gray-100" />

              {/* Time label */}
              <div className="w-[50px] flex-shrink-0 flex items-center justify-center text-xs font-mono text-gray-400 border-r border-gray-100 px-1">
                {hour}
              </div>

              {/* Empty content area */}
              <div className="flex-1 px-3 py-1.5 text-xs text-gray-300 group-hover:text-gray-400 transition-colors">
                + agregar bloque
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
