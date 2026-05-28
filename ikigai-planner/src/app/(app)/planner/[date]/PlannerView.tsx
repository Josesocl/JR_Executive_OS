'use client'

import { useRouter } from 'next/navigation'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { useDailyPlan } from '@/hooks/useDailyPlan'
import { useHabits } from '@/hooks/useHabits'
import { HarvardTimebox } from '@/components/planner/HarvardTimebox'
import { DailyPriorities } from '@/components/planner/DailyPriorities'
import { TaskList } from '@/components/planner/TaskList'
import { HabitTracker } from '@/components/planner/HabitTracker'
import { EnergyMeter } from '@/components/planner/EnergyMeter'
import { WaterTracker } from '@/components/planner/WaterTracker'
import { GratitudeSection } from '@/components/planner/GratitudeSection'
import { DayReflection } from '@/components/planner/DayReflection'

interface PlannerViewProps {
  userId: string
  date: string
}

export function PlannerView({ userId, date }: PlannerViewProps) {
  const router = useRouter()

  const {
    plan,
    priorities,
    timeBlocks,
    tasks,
    gratitudeEntries,
    isLoading,
    updatePlan,
    updatePriority,
    createPriority,
    updateTimeBlock,
    createTimeBlock,
    updateTask,
    createTask,
    deleteTask,
    updateGratitude,
    createGratitude,
  } = useDailyPlan(userId, date)

  const { habits, logs, toggleHabit } = useHabits(userId, date)

  const navigateDay = (direction: 'prev' | 'next') => {
    const d = parseISO(date)
    const next = direction === 'prev' ? subDays(d, 1) : addDays(d, 1)
    router.push(`/planner/${format(next, 'yyyy-MM-dd')}`)
  }

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-[65fr_35fr] gap-6">
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-9 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-24 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 min-h-full" style={{ backgroundColor: '#f0ece4' }}>
      {/* Date header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigateDay('prev')}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors text-gray-600"
          title="Día anterior"
        >
          ‹
        </button>
        <h1 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>
          Planificador Diario
        </h1>
        <button
          onClick={() => navigateDay('next')}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors text-gray-600"
          title="Día siguiente"
        >
          ›
        </button>
        <button
          onClick={() => router.push(`/planner/${format(new Date(), 'yyyy-MM-dd')}`)}
          className="ml-auto text-xs px-3 py-1 rounded-full transition-colors"
          style={{ backgroundColor: '#1a1a2e', color: '#e8b86d' }}
        >
          Hoy
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Timebox */}
          <HarvardTimebox
            planId={plan?.id ?? ''}
            blocks={timeBlocks}
            date={date}
            onUpdateBlock={updateTimeBlock}
            onCreateBlock={createTimeBlock}
          />

          {/* Priorities */}
          <DailyPriorities
            priorities={priorities}
            onUpdate={updatePriority}
            planId={plan?.id ?? ''}
            onCreatePriority={createPriority}
          />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Energy + Water */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <EnergyMeter
              value={plan?.energy ?? null}
              onChange={(v) => updatePlan({ energy: v })}
            />
            <WaterTracker
              value={plan?.water_glasses ?? 0}
              onChange={(v) => updatePlan({ water_glasses: v })}
            />
          </div>

          {/* Habits */}
          <HabitTracker habits={habits} logs={logs} date={date} onToggle={toggleHabit} />

          {/* Tasks */}
          <TaskList
            tasks={tasks}
            onUpdate={updateTask}
            onCreate={createTask}
            onDelete={deleteTask}
          />

          {/* Gratitude */}
          <GratitudeSection
            entries={gratitudeEntries}
            onUpdate={updateGratitude}
            onCreate={createGratitude}
          />

          {/* Reflection */}
          <DayReflection plan={plan} onUpdate={updatePlan} />
        </div>
      </div>
    </div>
  )
}
