'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GOAL_AREAS } from '@/lib/types'
import type { LifeGoal, GoalArea } from '@/lib/types'

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

interface GoalFormProps {
  onSubmit: (data: Pick<LifeGoal, 'title' | 'area' | 'description' | 'target_date'>) => void
  onCancel: () => void
}

export function GoalForm({ onSubmit, onCancel }: GoalFormProps) {
  const [title, setTitle] = useState('')
  const [area, setArea] = useState<GoalArea>('personal')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    onSubmit({
      title: trimmedTitle,
      area,
      description: description.trim() || null,
      target_date: targetDate || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Cuál es tu meta?"
          required
          autoFocus
          className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d]/30 text-[#1a1a2e] placeholder:text-stone-400"
        />
      </div>

      {/* Area */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Área de vida
        </label>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value as GoalArea)}
          className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d]/30 text-[#1a1a2e] bg-white"
        >
          {GOAL_AREAS.map((a) => (
            <option key={a} value={a}>
              {AREA_LABELS[a]}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Descripción (opcional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe tu meta con más detalle..."
          rows={3}
          className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d]/30 text-[#1a1a2e] placeholder:text-stone-400 resize-none"
        />
      </div>

      {/* Target date */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Fecha objetivo (opcional)
        </label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d]/30 text-[#1a1a2e]"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button type="submit" variant="secondary" size="sm" className="flex-1">
          Crear Meta
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
