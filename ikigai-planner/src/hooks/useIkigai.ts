'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { IkigaiItem, IkigaiPurpose } from '@/lib/types'

// ─── Query Keys ──────────────────────────────────────────────────────────────

const keys = {
  items: (userId: string) => ['ikigai_items', userId] as const,
  purpose: (userId: string) => ['ikigai_purpose', userId] as const,
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useIkigai(userId: string) {
  const qc = useQueryClient()
  const supabase = createClient()
  const updateItemTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const updatePurposeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch items ─────────────────────────────────────────────────────────
  const itemsQuery = useQuery({
    queryKey: keys.items(userId),
    queryFn: async (): Promise<IkigaiItem[]> => {
      const { data, error } = await supabase
        .from('ikigai_items')
        .select('*')
        .eq('user_id', userId)
        .order('order_index')
      if (error) throw error
      return (data ?? []) as IkigaiItem[]
    },
    enabled: !!userId,
  })

  // ── Fetch/create purpose ─────────────────────────────────────────────────
  const purposeQuery = useQuery({
    queryKey: keys.purpose(userId),
    queryFn: async (): Promise<IkigaiPurpose | null> => {
      const { data: existing } = await supabase
        .from('ikigai_purpose')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (existing) return existing as IkigaiPurpose

      const { data: created, error } = await supabase
        .from('ikigai_purpose')
        .upsert(
          {
            user_id: userId,
            statement: null,
            values_text: null,
            vision_text: null,
            mission_text: null,
            version: 1,
            disc_profile: null,
            intelligence_types: [],
            core_values: [],
            five_year_vision: null,
            a1_goal_id: null,
          },
          { onConflict: 'user_id' },
        )
        .select()
        .single()

      if (error) throw error
      return created as IkigaiPurpose
    },
    enabled: !!userId,
  })

  // ── Add item ──────────────────────────────────────────────────────────────
  const addItemMutation = useMutation({
    mutationFn: async ({ section, text }: { section: IkigaiItem['section']; text: string }) => {
      const existing = qc.getQueryData<IkigaiItem[]>(keys.items(userId)) ?? []
      const sectionItems = existing.filter((i) => i.section === section)
      const orderIndex = sectionItems.length

      const { data, error } = await supabase
        .from('ikigai_items')
        .insert({ user_id: userId, section, text, order_index: orderIndex })
        .select()
        .single()
      if (error) throw error
      return data as IkigaiItem
    },
    onMutate: async ({ section, text }) => {
      await qc.cancelQueries({ queryKey: keys.items(userId) })
      const prev = qc.getQueryData<IkigaiItem[]>(keys.items(userId))
      const optimistic: IkigaiItem = {
        id: `temp-${Date.now()}`,
        user_id: userId,
        section,
        text,
        order_index: (prev?.filter((i) => i.section === section).length ?? 0),
        created_at: new Date().toISOString(),
      }
      qc.setQueryData<IkigaiItem[]>(keys.items(userId), (old) => [...(old ?? []), optimistic])
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.items(userId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.items(userId) }),
  })

  // ── Update item (debounced) ───────────────────────────────────────────────
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const { error } = await supabase.from('ikigai_items').update({ text }).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, text }) => {
      await qc.cancelQueries({ queryKey: keys.items(userId) })
      const prev = qc.getQueryData<IkigaiItem[]>(keys.items(userId))
      qc.setQueryData<IkigaiItem[]>(keys.items(userId), (old) =>
        old?.map((i) => (i.id === id ? { ...i, text } : i)) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.items(userId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.items(userId) }),
  })

  // ── Delete item ───────────────────────────────────────────────────────────
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ikigai_items').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.items(userId) })
      const prev = qc.getQueryData<IkigaiItem[]>(keys.items(userId))
      qc.setQueryData<IkigaiItem[]>(keys.items(userId), (old) =>
        old?.filter((i) => i.id !== id) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.items(userId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.items(userId) }),
  })

  // ── Update purpose (debounced) ────────────────────────────────────────────
  const updatePurposeMutation = useMutation({
    mutationFn: async (data: Partial<IkigaiPurpose>) => {
      const current = qc.getQueryData<IkigaiPurpose>(keys.purpose(userId))
      const { error } = await supabase
        .from('ikigai_purpose')
        .upsert(
          {
            user_id: userId,
            ...current,
            ...data,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
      if (error) throw error
    },
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: keys.purpose(userId) })
      const prev = qc.getQueryData<IkigaiPurpose>(keys.purpose(userId))
      qc.setQueryData<IkigaiPurpose | null>(keys.purpose(userId), (old) =>
        old ? { ...old, ...data } : old,
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.purpose(userId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.purpose(userId) }),
  })

  // ── Public API ────────────────────────────────────────────────────────────

  const addItem = (section: IkigaiItem['section'], text: string) => {
    if (!text.trim()) return
    addItemMutation.mutate({ section, text: text.trim() })
  }

  const updateItem = (id: string, text: string) => {
    // Optimistic update immediately; debounce actual network call
    qc.setQueryData<IkigaiItem[]>(keys.items(userId), (old) =>
      old?.map((i) => (i.id === id ? { ...i, text } : i)) ?? [],
    )
    const timers = updateItemTimers.current
    if (timers.has(id)) clearTimeout(timers.get(id)!)
    const timer = setTimeout(() => {
      timers.delete(id)
      updateItemMutation.mutate({ id, text })
    }, 600)
    timers.set(id, timer)
  }

  const deleteItem = (id: string) => {
    deleteItemMutation.mutate(id)
  }

  const updatePurpose = (data: Partial<IkigaiPurpose>) => {
    // Optimistic update immediately; debounce actual network call
    qc.setQueryData<IkigaiPurpose | null>(keys.purpose(userId), (old) =>
      old ? { ...old, ...data } : old,
    )
    if (updatePurposeTimer.current) clearTimeout(updatePurposeTimer.current)
    updatePurposeTimer.current = setTimeout(() => {
      updatePurposeTimer.current = null
      updatePurposeMutation.mutate(data)
    }, 800)
  }

  return {
    items: itemsQuery.data ?? [],
    purpose: purposeQuery.data ?? null,
    isLoading: itemsQuery.isLoading || purposeQuery.isLoading,
    addItem,
    updateItem,
    deleteItem,
    updatePurpose,
  }
}

export type UseIkigaiReturn = ReturnType<typeof useIkigai>
