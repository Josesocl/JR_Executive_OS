'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type {
  DailyPlan,
  DailyPriority,
  TimeBlock,
  Task,
  GratitudeEntry,
} from '@/lib/types'

// ─── Query Keys ──────────────────────────────────────────────────────────────

const keys = {
  plan: (userId: string, date: string) => ['daily_plan', userId, date] as const,
  priorities: (planId: string) => ['daily_priorities', planId] as const,
  timeBlocks: (planId: string) => ['time_blocks', planId] as const,
  tasks: (planId: string) => ['tasks', planId] as const,
  gratitude: (planId: string) => ['gratitude_entries', planId] as const,
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface DailyPlanData {
  plan: DailyPlan | null
  priorities: DailyPriority[]
  timeBlocks: TimeBlock[]
  tasks: Task[]
  gratitudeEntries: GratitudeEntry[]
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDailyPlan(userId: string, date: string) {
  const qc = useQueryClient()
  const supabase = createClient()

  // ── Fetch plan (or create if missing) ────────────────────────────────────
  const planQuery = useQuery({
    queryKey: keys.plan(userId, date),
    queryFn: async (): Promise<DailyPlan> => {
      const { data: existing } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle()

      if (existing) return existing as DailyPlan

      const { data: created, error } = await supabase
        .from('daily_plans')
        .upsert(
          { user_id: userId, date, water_glasses: 0, completed: false },
          { onConflict: 'user_id,date' },
        )
        .select()
        .single()

      if (error) throw error
      return created as DailyPlan
    },
    enabled: !!userId && !!date,
  })

  const planId = planQuery.data?.id ?? ''

  // ── Priorities ────────────────────────────────────────────────────────────
  const prioritiesQuery = useQuery({
    queryKey: keys.priorities(planId),
    queryFn: async (): Promise<DailyPriority[]> => {
      const { data, error } = await supabase
        .from('daily_priorities')
        .select('*')
        .eq('plan_id', planId)
        .order('position')
      if (error) throw error
      return (data ?? []) as DailyPriority[]
    },
    enabled: !!planId,
  })

  // ── Time blocks ───────────────────────────────────────────────────────────
  const timeBlocksQuery = useQuery({
    queryKey: keys.timeBlocks(planId),
    queryFn: async (): Promise<TimeBlock[]> => {
      const { data, error } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('plan_id', planId)
        .order('order_index')
      if (error) throw error
      return (data ?? []) as TimeBlock[]
    },
    enabled: !!planId,
  })

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const tasksQuery = useQuery({
    queryKey: keys.tasks(planId),
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('plan_id', planId)
        .order('position')
      if (error) throw error
      return (data ?? []) as Task[]
    },
    enabled: !!planId,
  })

  // ── Gratitude entries ─────────────────────────────────────────────────────
  const gratitudeQuery = useQuery({
    queryKey: keys.gratitude(planId),
    queryFn: async (): Promise<GratitudeEntry[]> => {
      const { data, error } = await supabase
        .from('gratitude_entries')
        .select('*')
        .eq('plan_id', planId)
        .order('position')
      if (error) throw error
      return (data ?? []) as GratitudeEntry[]
    },
    enabled: !!planId,
  })

  // ── Mutations ─────────────────────────────────────────────────────────────

  const updatePlan = useMutation({
    mutationFn: async (data: Partial<DailyPlan>) => {
      const { error } = await supabase
        .from('daily_plans')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', planId)
      if (error) throw error
    },
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: keys.plan(userId, date) })
      const prev = qc.getQueryData<DailyPlan>(keys.plan(userId, date))
      qc.setQueryData<DailyPlan>(keys.plan(userId, date), (old) =>
        old ? { ...old, ...data } : old,
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.plan(userId, date), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.plan(userId, date) }),
  })

  const updatePriority = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DailyPriority> }) => {
      const { error } = await supabase.from('daily_priorities').update(data).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: keys.priorities(planId) })
      const prev = qc.getQueryData<DailyPriority[]>(keys.priorities(planId))
      qc.setQueryData<DailyPriority[]>(keys.priorities(planId), (old) =>
        old?.map((p) => (p.id === id ? { ...p, ...data } : p)) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.priorities(planId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.priorities(planId) }),
  })

  const createPriority = useMutation({
    mutationFn: async (position: 1 | 2 | 3) => {
      const { error } = await supabase.from('daily_priorities').insert({
        plan_id: planId,
        position,
        text: '',
        completed: false,
        weekly_goal_id: null,
      })
      if (error) throw error
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.priorities(planId) }),
  })

  const updateTimeBlock = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TimeBlock> }) => {
      const { error } = await supabase.from('time_blocks').update(data).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: keys.timeBlocks(planId) })
      const prev = qc.getQueryData<TimeBlock[]>(keys.timeBlocks(planId))
      qc.setQueryData<TimeBlock[]>(keys.timeBlocks(planId), (old) =>
        old?.map((b) => (b.id === id ? { ...b, ...data } : b)) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.timeBlocks(planId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.timeBlocks(planId) }),
  })

  const createTimeBlock = useMutation({
    mutationFn: async (timeLabel: string) => {
      const existing = qc.getQueryData<TimeBlock[]>(keys.timeBlocks(planId)) ?? []
      const orderIndex = existing.length
      const { error } = await supabase.from('time_blocks').insert({
        plan_id: planId,
        time_label: timeLabel,
        content: '',
        category: 'libre',
        is_calendar_event: false,
        calendar_event_id: null,
        calendar_event_data: null,
        order_index: orderIndex,
      })
      if (error) throw error
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.timeBlocks(planId) }),
  })

  const deleteTimeBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('time_blocks').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.timeBlocks(planId) })
      const prev = qc.getQueryData<TimeBlock[]>(keys.timeBlocks(planId))
      qc.setQueryData<TimeBlock[]>(keys.timeBlocks(planId), (old) =>
        old?.filter((b) => b.id !== id) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.timeBlocks(planId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.timeBlocks(planId) }),
  })

  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const { error } = await supabase.from('tasks').update(data).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: keys.tasks(planId) })
      const prev = qc.getQueryData<Task[]>(keys.tasks(planId))
      qc.setQueryData<Task[]>(keys.tasks(planId), (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...data } : t)) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.tasks(planId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.tasks(planId) }),
  })

  const createTask = useMutation({
    mutationFn: async (text: string) => {
      const existing = qc.getQueryData<Task[]>(keys.tasks(planId)) ?? []
      const { error } = await supabase.from('tasks').insert({
        plan_id: planId,
        text,
        completed: false,
        position: existing.length,
        weekly_goal_id: null,
      })
      if (error) throw error
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.tasks(planId) }),
  })

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.tasks(planId) })
      const prev = qc.getQueryData<Task[]>(keys.tasks(planId))
      qc.setQueryData<Task[]>(keys.tasks(planId), (old) =>
        old?.filter((t) => t.id !== id) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.tasks(planId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.tasks(planId) }),
  })

  const updateGratitude = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const { error } = await supabase.from('gratitude_entries').update({ text }).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, text }) => {
      await qc.cancelQueries({ queryKey: keys.gratitude(planId) })
      const prev = qc.getQueryData<GratitudeEntry[]>(keys.gratitude(planId))
      qc.setQueryData<GratitudeEntry[]>(keys.gratitude(planId), (old) =>
        old?.map((g) => (g.id === id ? { ...g, text } : g)) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.gratitude(planId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.gratitude(planId) }),
  })

  const createGratitude = useMutation({
    mutationFn: async (text: string) => {
      const existing = qc.getQueryData<GratitudeEntry[]>(keys.gratitude(planId)) ?? []
      const { error } = await supabase.from('gratitude_entries').insert({
        plan_id: planId,
        text,
        position: existing.length + 1,
      })
      if (error) throw error
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.gratitude(planId) }),
  })

  // ── Return ────────────────────────────────────────────────────────────────

  const isLoading =
    planQuery.isLoading ||
    (!!planId && (prioritiesQuery.isLoading || timeBlocksQuery.isLoading || tasksQuery.isLoading || gratitudeQuery.isLoading))

  return {
    plan: planQuery.data ?? null,
    priorities: prioritiesQuery.data ?? [],
    timeBlocks: timeBlocksQuery.data ?? [],
    tasks: tasksQuery.data ?? [],
    gratitudeEntries: gratitudeQuery.data ?? [],
    isLoading,

    updatePlan: (data: Partial<DailyPlan>) => updatePlan.mutate(data),
    updatePriority: (id: string, data: Partial<DailyPriority>) =>
      updatePriority.mutate({ id, data }),
    createPriority: (position: 1 | 2 | 3) => createPriority.mutate(position),
    updateTimeBlock: (id: string, data: Partial<TimeBlock>) =>
      updateTimeBlock.mutate({ id, data }),
    createTimeBlock: (timeLabel: string) => createTimeBlock.mutate(timeLabel),
    deleteTimeBlock: (id: string) => deleteTimeBlock.mutate(id),
    updateTask: (id: string, data: Partial<Task>) => updateTask.mutate({ id, data }),
    createTask: (text: string) => createTask.mutate(text),
    deleteTask: (id: string) => deleteTask.mutate(id),
    updateGratitude: (id: string, text: string) => updateGratitude.mutate({ id, text }),
    createGratitude: (text: string) => createGratitude.mutate(text),
  }
}

export type UseDailyPlanReturn = ReturnType<typeof useDailyPlan>
