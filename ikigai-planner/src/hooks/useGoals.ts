'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { LifeGoal } from '@/lib/types'

// ─── Query Keys ──────────────────────────────────────────────────────────────

const keys = {
  goals: (userId: string) => ['life_goals', userId] as const,
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGoals(userId: string) {
  const qc = useQueryClient()
  const supabase = createClient()

  // ── Fetch goals ───────────────────────────────────────────────────────────
  const goalsQuery = useQuery({
    queryKey: keys.goals(userId),
    queryFn: async (): Promise<LifeGoal[]> => {
      const { data, error } = await supabase
        .from('life_goals')
        .select('*')
        .eq('user_id', userId)
        .order('order_index')
      if (error) throw error
      return (data ?? []) as LifeGoal[]
    },
    enabled: !!userId,
  })

  // ── Create goal ───────────────────────────────────────────────────────────
  const createGoalMutation = useMutation({
    mutationFn: async (data: Pick<LifeGoal, 'title' | 'area' | 'description' | 'target_date'>) => {
      const existing = qc.getQueryData<LifeGoal[]>(keys.goals(userId)) ?? []
      const orderIndex = existing.length

      const { data: created, error } = await supabase
        .from('life_goals')
        .insert({
          user_id: userId,
          title: data.title,
          area: data.area,
          description: data.description ?? null,
          target_date: data.target_date ?? null,
          status: 'active',
          order_index: orderIndex,
          color: null,
          icon: null,
          completed_at: null,
        })
        .select()
        .single()
      if (error) throw error
      return created as LifeGoal
    },
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: keys.goals(userId) })
      const prev = qc.getQueryData<LifeGoal[]>(keys.goals(userId))
      const optimistic: LifeGoal = {
        id: `temp-${Date.now()}`,
        user_id: userId,
        title: data.title,
        area: data.area,
        description: data.description ?? null,
        target_date: data.target_date ?? null,
        status: 'active',
        color: null,
        icon: null,
        order_index: prev?.length ?? 0,
        created_at: new Date().toISOString(),
        completed_at: null,
      }
      qc.setQueryData<LifeGoal[]>(keys.goals(userId), (old) => [...(old ?? []), optimistic])
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.goals(userId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.goals(userId) }),
  })

  // ── Update goal ───────────────────────────────────────────────────────────
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LifeGoal> }) => {
      const { error } = await supabase.from('life_goals').update(data).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: keys.goals(userId) })
      const prev = qc.getQueryData<LifeGoal[]>(keys.goals(userId))
      qc.setQueryData<LifeGoal[]>(keys.goals(userId), (old) =>
        old?.map((g) => (g.id === id ? { ...g, ...data } : g)) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.goals(userId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.goals(userId) }),
  })

  // ── Delete goal ───────────────────────────────────────────────────────────
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('life_goals').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.goals(userId) })
      const prev = qc.getQueryData<LifeGoal[]>(keys.goals(userId))
      qc.setQueryData<LifeGoal[]>(keys.goals(userId), (old) =>
        old?.filter((g) => g.id !== id) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.goals(userId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.goals(userId) }),
  })

  // ── Archive goal ──────────────────────────────────────────────────────────
  const archiveGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('life_goals')
        .update({ status: 'archived' })
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.goals(userId) })
      const prev = qc.getQueryData<LifeGoal[]>(keys.goals(userId))
      qc.setQueryData<LifeGoal[]>(keys.goals(userId), (old) =>
        old?.map((g) => (g.id === id ? { ...g, status: 'archived' } : g)) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.goals(userId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.goals(userId) }),
  })

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    goals: goalsQuery.data ?? [],
    isLoading: goalsQuery.isLoading,
    createGoal: (data: Pick<LifeGoal, 'title' | 'area' | 'description' | 'target_date'>) =>
      createGoalMutation.mutate(data),
    updateGoal: (id: string, data: Partial<LifeGoal>) => updateGoalMutation.mutate({ id, data }),
    deleteGoal: (id: string) => deleteGoalMutation.mutate(id),
    archiveGoal: (id: string) => archiveGoalMutation.mutate(id),
  }
}

export type UseGoalsReturn = ReturnType<typeof useGoals>
