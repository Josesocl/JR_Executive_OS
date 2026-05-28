'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { MonthlyGoal } from '@/lib/types'

const keys = {
  goals: (userId: string, year: number, month: number) =>
    ['monthly_goals', userId, year, month] as const,
}

export function useMonthlyGoals(userId: string, year: number, month: number) {
  const qc = useQueryClient()
  const supabase = createClient()

  const goalsQuery = useQuery({
    queryKey: keys.goals(userId, year, month),
    queryFn: async (): Promise<MonthlyGoal[]> => {
      const { data, error } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .eq('month', month)
        .order('created_at')
      if (error) throw error
      return (data ?? []) as MonthlyGoal[]
    },
    enabled: !!userId && !!year && !!month,
  })

  const createGoal = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase.from('monthly_goals').insert({
        user_id: userId,
        title,
        month,
        year,
        status: 'active',
        progress: 0,
        notes: null,
        quarterly_goal_id: null,
      })
      if (error) throw error
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: keys.goals(userId, year, month) }),
  })

  const updateGoal = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MonthlyGoal> }) => {
      const { error } = await supabase
        .from('monthly_goals')
        .update(data)
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: keys.goals(userId, year, month) })
      const prev = qc.getQueryData<MonthlyGoal[]>(keys.goals(userId, year, month))
      qc.setQueryData<MonthlyGoal[]>(keys.goals(userId, year, month), (old) =>
        old?.map((g) => (g.id === id ? { ...g, ...data } : g)) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.goals(userId, year, month), ctx.prev)
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: keys.goals(userId, year, month) }),
  })

  const toggleComplete = useMutation({
    mutationFn: async (id: string) => {
      const goals =
        qc.getQueryData<MonthlyGoal[]>(keys.goals(userId, year, month)) ?? []
      const goal = goals.find((g) => g.id === id)
      if (!goal) return
      const newStatus =
        goal.status === 'completed' ? 'active' : 'completed'
      const { error } = await supabase
        .from('monthly_goals')
        .update({ status: newStatus, progress: newStatus === 'completed' ? 100 : goal.progress })
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.goals(userId, year, month) })
      const prev = qc.getQueryData<MonthlyGoal[]>(keys.goals(userId, year, month))
      qc.setQueryData<MonthlyGoal[]>(keys.goals(userId, year, month), (old) =>
        old?.map((g) =>
          g.id === id
            ? {
                ...g,
                status: g.status === 'completed' ? 'active' : 'completed',
                progress: g.status !== 'completed' ? 100 : g.progress,
              }
            : g,
        ) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.goals(userId, year, month), ctx.prev)
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: keys.goals(userId, year, month) }),
  })

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('monthly_goals').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.goals(userId, year, month) })
      const prev = qc.getQueryData<MonthlyGoal[]>(keys.goals(userId, year, month))
      qc.setQueryData<MonthlyGoal[]>(keys.goals(userId, year, month), (old) =>
        old?.filter((g) => g.id !== id) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.goals(userId, year, month), ctx.prev)
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: keys.goals(userId, year, month) }),
  })

  return {
    goals: goalsQuery.data ?? [],
    isLoading: goalsQuery.isLoading,
    createGoal: (title: string) => createGoal.mutate(title),
    updateGoal: (id: string, data: Partial<MonthlyGoal>) => updateGoal.mutate({ id, data }),
    toggleComplete: (id: string) => toggleComplete.mutate(id),
    deleteGoal: (id: string) => deleteGoal.mutate(id),
  }
}

export type UseMonthlyGoalsReturn = ReturnType<typeof useMonthlyGoals>
