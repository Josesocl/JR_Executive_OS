'use client'

import { useState, useRef } from 'react'
import { useWeeklyGoals } from '@/hooks/useWeeklyGoals'
import { cn } from '@/lib/utils'

interface WeeklyGoalsListProps {
  userId: string
  weekStart: string
}

export function WeeklyGoalsList({ userId, weekStart }: WeeklyGoalsListProps) {
  const { goals, isLoading, createGoal, updateGoal, toggleComplete, deleteGoal } =
    useWeeklyGoals(userId, weekStart)

  const [showInput, setShowInput] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    const trimmed = newTitle.trim()
    if (!trimmed) {
      setShowInput(false)
      return
    }
    createGoal(trimmed)
    setNewTitle('')
    setShowInput(false)
  }

  const handleEditStart = (id: string, title: string) => {
    setEditingId(id)
    setEditingText(title)
  }

  const handleEditSave = (id: string) => {
    const trimmed = editingText.trim()
    if (trimmed) {
      updateGoal(id, { title: trimmed })
    }
    setEditingId(null)
    setEditingText('')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3
        className="text-sm font-bold uppercase tracking-wider mb-3"
        style={{ color: '#1a1a2e' }}
      >
        Metas de la semana
      </h3>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className="flex items-center gap-2 group rounded-lg px-2 py-1.5 hover:bg-gray-50"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleComplete(goal.id)}
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  goal.completed
                    ? 'border-amber-400 bg-amber-400 text-white'
                    : 'border-gray-300 bg-white',
                )}
                title={goal.completed ? 'Marcar pendiente' : 'Marcar completado'}
              >
                {goal.completed && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              {/* Title (editable inline) */}
              {editingId === goal.id ? (
                <input
                  autoFocus
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => handleEditSave(goal.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave(goal.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 text-sm border-b border-amber-400 outline-none bg-transparent"
                />
              ) : (
                <span
                  onClick={() => handleEditStart(goal.id, goal.title)}
                  className={cn(
                    'flex-1 text-sm cursor-text',
                    goal.completed ? 'line-through text-gray-400' : 'text-gray-800',
                  )}
                >
                  {goal.title}
                </span>
              )}

              {/* Status badge */}
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0',
                  goal.completed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700',
                )}
              >
                {goal.completed ? 'Hecho' : 'Activo'}
              </span>

              {/* Delete */}
              <button
                onClick={() => deleteGoal(goal.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-xs font-bold flex-shrink-0"
                title="Eliminar meta"
              >
                ×
              </button>
            </li>
          ))}

          {goals.length === 0 && !showInput && (
            <li className="text-sm text-gray-400 italic px-2">
              Sin metas esta semana
            </li>
          )}

          {/* Inline new goal input */}
          {showInput && (
            <li className="flex items-center gap-2 px-2">
              <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0" />
              <input
                ref={inputRef}
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleAdd}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd()
                  if (e.key === 'Escape') {
                    setShowInput(false)
                    setNewTitle('')
                  }
                }}
                placeholder="Nueva meta..."
                className="flex-1 text-sm border-b border-amber-400 outline-none bg-transparent py-0.5"
              />
            </li>
          )}
        </ul>
      )}

      {/* Add button */}
      {!showInput && (
        <button
          onClick={() => setShowInput(true)}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: '#e8b86d' }}
        >
          <span className="text-lg leading-none">+</span>
          <span>Agregar meta</span>
        </button>
      )}
    </div>
  )
}
