'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useGoals } from '@/hooks/useGoals'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalForm } from '@/components/goals/GoalForm'
import { WantList } from '@/components/goals/WantList'
import type { LifeGoal, GoalArea } from '@/lib/types'

type Tab = 'metas' | 'deseos'

const AREA_COLORS: Partial<Record<GoalArea, string>> = {
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

interface GoalsViewProps {
  userId: string
}

export function GoalsView({ userId }: GoalsViewProps) {
  const [tab, setTab] = useState<Tab>('metas')
  const [isCreating, setIsCreating] = useState(false)
  const { goals, isLoading, createGoal, updateGoal, deleteGoal } = useGoals(userId)

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  // Top 3 areas by count
  const areaCount = activeGoals.reduce<Partial<Record<GoalArea, number>>>((acc, g) => {
    acc[g.area] = (acc[g.area] ?? 0) + 1
    return acc
  }, {})
  const top3Areas = (Object.entries(areaCount) as [GoalArea, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const handleCreateGoal = (data: Pick<LifeGoal, 'title' | 'area' | 'description' | 'target_date'>) => {
    createGoal(data)
    setIsCreating(false)
  }

  return (
    <div className="p-4 md:p-6 space-y-5 min-h-full" style={{ backgroundColor: '#f0ece4' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>
            Sistema de Metas
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Define, organiza y alcanza tus metas de vida
          </p>
        </div>
      </div>

      {/* Stats bar */}
      {activeGoals.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#1a1a2e]">{activeGoals.length}</span>
              <span className="text-xs text-stone-500">
                metas activas
                {completedGoals.length > 0 && (
                  <span className="ml-1 text-green-600">· {completedGoals.length} completadas</span>
                )}
              </span>
            </div>
            {top3Areas.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-stone-400">Top áreas:</span>
                {top3Areas.map(([area, count]) => (
                  <span
                    key={area}
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${AREA_COLORS[area] ?? '#9e9e9e'}18`,
                      color: AREA_COLORS[area] ?? '#9e9e9e',
                    }}
                  >
                    {AREA_LABELS[area]} ({count})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-stone-200 p-1 w-fit">
        {(['metas', 'deseos'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'text-sm px-4 py-1.5 rounded-lg font-medium transition-colors',
              tab === t
                ? 'text-[#1a1a2e] font-semibold shadow-sm'
                : 'text-stone-500 hover:text-[#1a1a2e]',
            )}
            style={tab === t ? { backgroundColor: '#e8b86d' } : undefined}
          >
            {t === 'metas' ? 'Mis Metas' : 'Lista de Deseos'}
          </button>
        ))}
      </div>

      {/* Tab: Mis Metas */}
      {tab === 'metas' && (
        <div className="space-y-4">
          {/* Nueva meta button */}
          <button
            onClick={() => setIsCreating(true)}
            className="text-sm px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#e8b86d', color: '#1a1a2e' }}
          >
            + Nueva Meta
          </button>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 bg-white rounded-xl border border-stone-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {activeGoals.length === 0 && (
                <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8 text-center">
                  <p className="text-stone-400 text-sm">No tienes metas activas.</p>
                  <p className="text-stone-400 text-xs mt-1">Crea tu primera meta para comenzar.</p>
                </div>
              )}
              <div className="space-y-3">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={updateGoal}
                    onDelete={deleteGoal}
                  />
                ))}
              </div>

              {completedGoals.length > 0 && (
                <details className="group">
                  <summary className="cursor-pointer text-sm text-stone-500 hover:text-[#1a1a2e] transition-colors list-none flex items-center gap-1">
                    <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                    Completadas ({completedGoals.length})
                  </summary>
                  <div className="space-y-3 mt-3">
                    {completedGoals.map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onUpdate={updateGoal}
                        onDelete={deleteGoal}
                      />
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab: Lista de Deseos */}
      {tab === 'deseos' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <WantList userId={userId} />
        </div>
      )}

      {/* Create modal overlay */}
      {isCreating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreating(false)
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-bold text-[#1a1a2e] mb-4">Nueva Meta</h2>
            <GoalForm
              onSubmit={handleCreateGoal}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
