'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { IkigaiItem } from '@/lib/types'

interface IkigaiSectionProps {
  section: 'love' | 'good' | 'needs' | 'paid'
  label: string
  color: string
  items: IkigaiItem[]
  onAdd: (text: string) => void
  onUpdate: (id: string, text: string) => void
  onDelete: (id: string) => void
}

export function IkigaiSection({
  label,
  color,
  items,
  onAdd,
  onUpdate,
  onDelete,
}: IkigaiSectionProps) {
  const [adding, setAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const newInputRef = useRef<HTMLInputElement>(null)

  const handleAddSubmit = () => {
    const trimmed = newText.trim()
    if (trimmed) {
      onAdd(trimmed)
    }
    setNewText('')
    setAdding(false)
  }

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddSubmit()
    if (e.key === 'Escape') {
      setNewText('')
      setAdding(false)
    }
  }

  const handleStartAdd = () => {
    setAdding(true)
    setTimeout(() => newInputRef.current?.focus(), 0)
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: `3px solid ${color}` }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <h3 className="text-sm font-semibold text-[#1a1a2e]">{label}</h3>
        <span
          className="ml-auto text-xs font-medium px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {items.length}
        </span>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-[120px]">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            color={color}
            isEditing={editingId === item.id}
            onStartEdit={() => setEditingId(item.id)}
            onStopEdit={() => setEditingId(null)}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}

        {/* Inline add input */}
        {adding && (
          <div className="flex items-center gap-1.5">
            <div
              className="w-1 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <input
              ref={newInputRef}
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={handleAddKeyDown}
              onBlur={handleAddSubmit}
              placeholder="Escribir aquí..."
              className="flex-1 text-sm bg-transparent border-b border-stone-300 focus:border-[color:var(--c)] outline-none py-0.5 text-[#1a1a2e] placeholder:text-stone-400"
              style={{ '--c': color } as React.CSSProperties}
            />
          </div>
        )}

        {items.length === 0 && !adding && (
          <p className="text-xs text-stone-400 italic py-2">Sin elementos aún...</p>
        )}
      </div>

      {/* Add button */}
      <div className="px-3 pb-3 pt-1">
        <button
          onClick={handleStartAdd}
          className={cn(
            'w-full text-xs py-1.5 rounded-lg border border-dashed transition-colors',
            'text-stone-400 hover:text-[#1a1a2e] hover:border-stone-400',
          )}
          style={{ borderColor: `${color}60` }}
        >
          + Agregar
        </button>
      </div>
    </div>
  )
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: IkigaiItem
  color: string
  isEditing: boolean
  onStartEdit: () => void
  onStopEdit: () => void
  onUpdate: (id: string, text: string) => void
  onDelete: (id: string) => void
}

function ItemRow({ item, color, isEditing, onStartEdit, onStopEdit, onUpdate, onDelete }: ItemRowProps) {
  const [localText, setLocalText] = useState(item.text)

  const handleBlur = () => {
    onUpdate(item.id, localText)
    onStopEdit()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      onUpdate(item.id, localText)
      onStopEdit()
    }
  }

  return (
    <div className="group flex items-start gap-1.5">
      <div
        className="w-1 h-4 rounded-full flex-shrink-0 mt-1"
        style={{ backgroundColor: color }}
      />
      {isEditing ? (
        <input
          type="text"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 text-sm bg-transparent border-b border-stone-300 outline-none py-0.5 text-[#1a1a2e]"
        />
      ) : (
        <span
          className="flex-1 text-sm text-[#1a1a2e] cursor-text py-0.5 leading-snug"
          onClick={onStartEdit}
        >
          {item.text}
        </span>
      )}
      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity text-xs leading-none mt-1 flex-shrink-0"
        title="Eliminar"
      >
        ×
      </button>
    </div>
  )
}
