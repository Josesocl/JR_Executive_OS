'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { LifeGoal, GoalArea } from '@/lib/types'

const AREA_COLORS: Record<GoalArea, string> = {
  salud: '#43a047',
  familia: '#e91e63',
  trabajo: '#1976d2',
  finanzas: '#f57c00',
  personal: '#9c27b0',
  social: '#00acc1',
  espiritual: '#5d4037',
  aprendizaje: '#7b1fa2',
  carrera: '#1565c0',
  fitness: '#2e7d32',
  material: '#ff6f00',
  comunidad: '#00796b',
  creativo: '#00897b',
  intelectual: '#283593',
}

const AREA_LABELS: Record<GoalArea, string> = {
  salud: 'Salud',
  familia: 'Familia',
  trabajo: 'Trabajo',
  finanzas: 'Finanzas',
  personal: 'Desarrollo Personal',
  social: 'Social',
  espiritual: 'Espiritual',
  aprendizaje: 'Aprendizaje',
  carrera: 'Carrera',
  fitness: 'Fitness',
  material: 'Material/Tangible',
  comunidad: 'Comunidad',
  creativo: 'Creativo',
  intelectual: 'Intelectual',
}

interface GoalCardProps {
  goal: LifeGoal
  onUpdate: (id: string, data: Partial<LifeGoal>) => void
  onDelete: (id: string) => void
}

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(goal.title)

  const areaColor = AREA_COLORS[goal.area]
  const isCompleted = goal.status === 'completed'

  const handleTitleBlur = () => {
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== goal.title) {
      onUpdate(goal.id, { title: trimmed })
    } else {
      setTitleValue(goal.title)
    }
    setEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      handleTitleBlur()
    }
  }

  const handleToggleStatus = () => {
    onUpdate(goal.id, {
      status: isCompleted ? 'active' : 'completed',
      completed_at: isCompleted ? null : new Date().toISOString(),
    })
  }

  return (
    <div className="group relative bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex">
      {/* Left color bar */}
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: areaColor }} />

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Top row: area badge + delete */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${areaColor}18`, color: areaColor }}
          >
            {AREA_LABELS[goal.area]}
          </span>
          <button
            onClick={() => onDelete(goal.id)}
            className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity text-base leading-none flex-shrink-0"
            title="Eliminar meta"
          >
            ×
          </button>
        </div>

        {/* Title */}
        {editingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            className={cn(
              'w-full text-sm font-semibold bg-transparent border-b border-stone-300 outline-none pb-0.5 text-[#1a1a2e]',
              isCompleted && 'line-through text-stone-400',
            )}
          />
        ) : (
          <p
            className={cn(
              'text-sm font-semibold text-[#1a1a2e] cursor-text leading-snug',
              isCompleted && 'line-through text-stone-400',
            )}
            onClick={() => setEditingTitle(true)}
          >
            {goal.title}
          </p>
        )}

        {/* Footer: status toggle + target date */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleToggleStatus}
            className={cn(
              'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
              isCompleted
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200',
            )}
          >
            {isCompleted ? '✓ Completada' : 'Activa'}
          </button>

          {goal.target_date && (
            <span className="text-xs text-stone-400">
              {format(new Date(goal.target_date + 'T00:00:00'), "d MMM yyyy", { locale: es })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
