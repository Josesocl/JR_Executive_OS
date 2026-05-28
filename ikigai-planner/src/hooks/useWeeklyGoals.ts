'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { WeeklyGoal } from '@/lib/types'

const keys = {
  goals: (userId: string, weekStart: string) =>
    ['weekly_goals', userId, weekStart] as const,
}

export function useWeeklyGoals(userId: string, weekStart: string) {
  const qc = useQueryClient()
  const supabase = createClient()

  const goalsQuery = useQuery({
    queryKey: keys.goals(userId, weekStart),
    queryFn: async (): Promise<WeeklyGoal[]> => {
      const { data, error } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .order('created_at')
      if (error) throw error
      return (data ?? []) as WeeklyGoal[]
    },
    enabled: !!userId && !!weekStart,
  })

  const createGoal = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase.from('weekly_goals').insert({
        user_id: userId,
        title,
        week_start: weekStart,
        status: 'active',
        completed: false,
        monthly_goal_id: null,
      })
      if (error) throw error
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: keys.goals(userId, weekStart) }),
  })

  const updateGoal = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WeeklyGoal> }) => {
      const { error } = await supabase
        .from('weekly_goals')
        .update(data)
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: keys.goals(userId, weekStart) })
      const prev = qc.getQueryData<WeeklyGoal[]>(keys.goals(userId, weekStart))
      qc.setQueryData<WeeklyGoal[]>(keys.goals(userId, weekStart), (old) =>
        old?.map((g) => (g.id === id ? { ...g, ...data } : g)) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.goals(userId, weekStart), ctx.prev)
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: keys.goals(userId, weekStart) }),
  })

  const toggleComplete = useMutation({
    mutationFn: async (id: string) => {
      const goals = qc.getQueryData<WeeklyGoal[]>(keys.goals(userId, weekStart)) ?? []
      const goal = goals.find((g) => g.id === id)
      if (!goal) return
      const newCompleted = !goal.completed
      const { error } = await supabase
        .from('weekly_goals')
        .update({
          completed: newCompleted,
          status: newCompleted ? 'completed' : 'active',
        })
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.goals(userId, weekStart) })
      const prev = qc.getQueryData<WeeklyGoal[]>(keys.goals(userId, weekStart))
      qc.setQueryData<WeeklyGoal[]>(keys.goals(userId, weekStart), (old) =>
        old?.map((g) =>
          g.id === id
            ? { ...g, completed: !g.completed, status: !g.completed ? 'completed' : 'active' }
            : g,
        ) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.goals(userId, weekStart), ctx.prev)
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: keys.goals(userId, weekStart) }),
  })

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('weekly_goals').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.goals(userId, weekStart) })
      const prev = qc.getQueryData<WeeklyGoal[]>(keys.goals(userId, weekStart))
      qc.setQueryData<WeeklyGoal[]>(keys.goals(userId, weekStart), (old) =>
        old?.filter((g) => g.id !== id) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.goals(userId, weekStart), ctx.prev)
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: keys.goals(userId, weekStart) }),
  })

  return {
    goals: goalsQuery.data ?? [],
    isLoading: goalsQuery.isLoading,
    createGoal: (title: string) => createGoal.mutate(title),
    updateGoal: (id: string, data: Partial<WeeklyGoal>) => updateGoal.mutate({ id, data }),
    toggleComplete: (id: string) => toggleComplete.mutate(id),
    deleteGoal: (id: string) => deleteGoal.mutate(id),
  }
}

export type UseWeeklyGoalsReturn = ReturnType<typeof useWeeklyGoals>
