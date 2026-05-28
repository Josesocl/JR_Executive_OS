'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitLog } from '@/lib/types'

const keys = {
  habits: (userId: string) => ['habits', userId] as const,
  logs: (userId: string, date: string) => ['habit_logs', userId, date] as const,
}

export function useHabits(userId: string, date: string) {
  const qc = useQueryClient()
  const supabase = createClient()

  const habitsQuery = useQuery({
    queryKey: keys.habits(userId),
    queryFn: async (): Promise<Habit[]> => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('order_index')
      if (error) throw error
      return (data ?? []) as Habit[]
    },
    enabled: !!userId,
  })

  const logsQuery = useQuery({
    queryKey: keys.logs(userId, date),
    queryFn: async (): Promise<HabitLog[]> => {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
      if (error) throw error
      return (data ?? []) as HabitLog[]
    },
    enabled: !!userId && !!date,
  })

  const toggleHabit = useMutation({
    mutationFn: async (habitId: string) => {
      const logs = qc.getQueryData<HabitLog[]>(keys.logs(userId, date)) ?? []
      const existing = logs.find((l) => l.habit_id === habitId)

      if (existing) {
        const { error } = await supabase.from('habit_logs').delete().eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('habit_logs').insert({
          habit_id: habitId,
          user_id: userId,
          date,
          completed: true,
        })
        if (error) throw error
      }
    },
    onMutate: async (habitId) => {
      await qc.cancelQueries({ queryKey: keys.logs(userId, date) })
      const prev = qc.getQueryData<HabitLog[]>(keys.logs(userId, date))
      const existing = prev?.find((l) => l.habit_id === habitId)

      qc.setQueryData<HabitLog[]>(keys.logs(userId, date), (old) => {
        if (existing) {
          return old?.filter((l) => l.habit_id !== habitId) ?? []
        } else {
          return [
            ...(old ?? []),
            {
              id: `temp-${habitId}`,
              habit_id: habitId,
              user_id: userId,
              date,
              completed: true,
            },
          ]
        }
      })

      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.logs(userId, date), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.logs(userId, date) }),
  })

  return {
    habits: habitsQuery.data ?? [],
    logs: logsQuery.data ?? [],
    isLoading: habitsQuery.isLoading || logsQuery.isLoading,
    toggleHabit: (habitId: string) => toggleHabit.mutate(habitId),
  }
}
