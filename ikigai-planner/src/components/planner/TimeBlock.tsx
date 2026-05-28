'use client'

import { useRef, useEffect, useCallback } from 'react'
import { CategoryBar } from './CategoryBar'
import { CATEGORIES } from '@/lib/utils/categories'
import type { TimeBlock, TimeBlockCategory } from '@/lib/types'

interface TimeBlockRowProps {
  block: TimeBlock
  onUpdate: (id: string, data: Partial<TimeBlock>) => void
}

export function TimeBlockRow({ block, onUpdate }: TimeBlockRowProps) {
  const editableRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const catBg = CATEGORIES[block.category].bg

  // Keep DOM in sync when block.content changes externally
  useEffect(() => {
    const el = editableRef.current
    if (!el) return
    if (el.textContent !== block.content) {
      el.textContent = block.content
    }
  }, [block.content])

  const handleInput = useCallback(() => {
    const el = editableRef.current
    if (!el) return
    const text = el.textContent ?? ''

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onUpdate(block.id, { content: text })
    }, 800)
  }, [block.id, onUpdate])

  const handleCategoryChange = useCallback(
    (cat: TimeBlockCategory) => {
      onUpdate(block.id, { category: cat })
    },
    [block.id, onUpdate],
  )

  return (
    <div
      className="flex items-stretch min-h-[36px] border-b border-gray-100 group"
      style={{ backgroundColor: block.is_calendar_event ? '#f9f9f9' : catBg }}
    >
      {/* Category bar */}
      <CategoryBar
        category={block.category}
        onCategoryChange={handleCategoryChange}
        disabled={block.is_calendar_event}
      />

      {/* Time label */}
      <div className="w-[50px] flex-shrink-0 flex items-center justify-center text-xs font-mono text-gray-500 border-r border-gray-100 px-1">
        {block.time_label}
      </div>

      {/* Content area */}
      {block.is_calendar_event ? (
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 select-none">
          <svg
            className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
          </svg>
          <span className="italic">{block.content}</span>
        </div>
      ) : (
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="flex-1 px-3 py-1.5 text-sm outline-none min-h-[36px] leading-relaxed"
          style={{ color: '#1a1a2e' }}
          data-placeholder="Escribe aquí..."
        />
      )}
    </div>
  )
}
