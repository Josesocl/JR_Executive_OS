'use client'

import { useState, useRef, useEffect } from 'react'
import { CATEGORIES } from '@/lib/utils/categories'
import type { TimeBlockCategory } from '@/lib/types'

interface CategoryBarProps {
  category: TimeBlockCategory
  onCategoryChange: (cat: TimeBlockCategory) => void
  disabled?: boolean
}

export function CategoryBar({ category, onCategoryChange, disabled }: CategoryBarProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleBarClick = () => {
    if (!disabled) setOpen((v) => !v)
  }

  return (
    <div ref={containerRef} className="relative flex-shrink-0 self-stretch">
      {/* The colored bar */}
      <div
        className="w-1.5 h-full cursor-pointer transition-opacity hover:opacity-80"
        style={{
          backgroundColor: CATEGORIES[category].color,
          cursor: disabled ? 'default' : 'pointer',
        }}
        onClick={handleBarClick}
        title={disabled ? undefined : 'Cambiar categoría'}
      />

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-3 top-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[160px]"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
        >
          {(Object.entries(CATEGORIES) as [TimeBlockCategory, typeof CATEGORIES[TimeBlockCategory]][]).map(
            ([key, cat]) => (
              <button
                key={key}
                className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors text-left"
                style={{
                  fontWeight: key === category ? 600 : 400,
                  backgroundColor: key === category ? cat.bg : undefined,
                }}
                onClick={() => {
                  onCategoryChange(key)
                  setOpen(false)
                }}
              >
                <span>{cat.emoji}</span>
                <span style={{ color: cat.color }}>{cat.label}</span>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
