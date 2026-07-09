'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TimeBlock, TimeBlockCategory } from '@/lib/types'
import { useCallback, useRef } from 'react'

const DEBOUNCE_MS = 800

export function useTimeBlocks(planId: string) {
  const qc = useQueryClient()
  const supabase = createClient()
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const query = useQuery({
    queryKey: ['time_blocks', planId],
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

  const updateBlock = useCallback(
    (id: string, updates: { content?: string; category?: TimeBlockCategory }) => {
      // Optimistic update immediately
      qc.setQueryData<TimeBlock[]>(['time_blocks', planId], (old) =>
        old?.map((b) => (b.id === id ? { ...b, ...updates } : b)) ?? [],
      )

      // Debounce the actual Supabase call
      const existing = timersRef.current.get(id)
      if (existing) clearTimeout(existing)

      const timer = setTimeout(async () => {
        const { error } = await supabase.from('time_blocks').update(updates).eq('id', id)
        if (error) {
          qc.invalidateQueries({ queryKey: ['time_blocks', planId] })
        }
        timersRef.current.delete(id)
      }, DEBOUNCE_MS)

      timersRef.current.set(id, timer)
    },
    [planId, qc, supabase],
  )

  const createBlock = useCallback(
    async (timeLabel: string) => {
      const existing = qc.getQueryData<TimeBlock[]>(['time_blocks', planId]) ?? []
      const { error } = await supabase.from('time_blocks').insert({
        plan_id: planId,
        time_label: timeLabel,
        content: '',
        category: 'libre',
        is_calendar_event: false,
        calendar_event_id: null,
        calendar_event_data: null,
        order_index: existing.length,
      })
      if (error) throw error
      qc.invalidateQueries({ queryKey: ['time_blocks', planId] })
    },
    [planId, qc, supabase],
  )

  return {
    blocks: query.data ?? [],
    isLoading: query.isLoading,
    updateBlock,
    createBlock,
  }
}
