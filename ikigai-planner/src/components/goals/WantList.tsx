'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { WantListItem } from '@/lib/types'

type PriorityFilter = 'all' | 'A' | 'B' | 'C'

interface WantListProps {
  userId: string
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

const keys = {
  items: (userId: string) => ['want_list', userId] as const,
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WantList({ userId }: WantListProps) {
  const qc = useQueryClient()
  const supabase = createClient()
  const [filter, setFilter] = useState<PriorityFilter>('all')
  const [addingText, setAddingText] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data: items = [], isLoading } = useQuery({
    queryKey: keys.items(userId),
    queryFn: async (): Promise<WantListItem[]> => {
      const { data, error } = await supabase
        .from('want_list')
        .select('*')
        .eq('user_id', userId)
        .order('order_index')
      if (error) throw error
      return (data ?? []) as WantListItem[]
    },
    enabled: !!userId,
  })

  // ── Add item ───────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (text: string) => {
      const orderIndex = items.length
      const { data, error } = await supabase
        .from('want_list')
        .insert({ user_id: userId, text, order_index: orderIndex, priority_group: null })
        .select()
        .single()
      if (error) throw error
      return data as WantListItem
    },
    onMutate: async (text) => {
      await qc.cancelQueries({ queryKey: keys.items(userId) })
      const prev = qc.getQueryData<WantListItem[]>(keys.items(userId))
      const optimistic: WantListItem = {
        id: `temp-${Date.now()}`,
        user_id: userId,
        text,
        priority_group: null,
        order_index: items.length,
        converted_to_goal: null,
        created_at: new Date().toISOString(),
      }
      qc.setQueryData<WantListItem[]>(keys.items(userId), (old) => [...(old ?? []), optimistic])
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.items(userId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.items(userId) }),
  })

  // ── Update item ────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WantListItem> }) => {
      const { error } = await supabase.from('want_list').update(data).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: keys.items(userId) })
      const prev = qc.getQueryData<WantListItem[]>(keys.items(userId))
      qc.setQueryData<WantListItem[]>(keys.items(userId), (old) =>
        old?.map((i) => (i.id === id ? { ...i, ...data } : i)) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.items(userId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.items(userId) }),
  })

  // ── Delete item ────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('want_list').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.items(userId) })
      const prev = qc.getQueryData<WantListItem[]>(keys.items(userId))
      qc.setQueryData<WantListItem[]>(keys.items(userId), (old) =>
        old?.filter((i) => i.id !== id) ?? [],
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.items(userId), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.items(userId) }),
  })

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddSubmit = () => {
    const trimmed = addingText.trim()
    if (trimmed) {
      addMutation.mutate(trimmed)
    }
    setAddingText('')
    setIsAdding(false)
  }

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddSubmit()
    if (e.key === 'Escape') {
      setAddingText('')
      setIsAdding(false)
    }
  }

  const handlePriorityToggle = (item: WantListItem, group: 'A' | 'B' | 'C') => {
    const newGroup = item.priority_group === group ? null : group
    updateMutation.mutate({ id: item.id, data: { priority_group: newGroup } })
  }

  // ── Filtered items ─────────────────────────────────────────────────────────

  const filteredItems =
    filter === 'all' ? items : items.filter((i) => i.priority_group === filter)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 bg-stone-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-[#1a1a2e]">Mi Lista de Deseos</h2>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#e8b86d20', color: '#e8b86d' }}
        >
          {items.length}
        </span>
        <p className="text-xs text-stone-400 hidden sm:block">
          Metodología Proctor Gallagher — escribe todo lo que quieres
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {(['all', 'A', 'B', 'C'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors',
              filter === f
                ? 'text-[#1a1a2e] font-semibold'
                : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200',
            )}
            style={filter === f ? { backgroundColor: '#e8b86d', color: '#1a1a2e' } : undefined}
          >
            {f === 'all' ? 'Todos' : `Grupo ${f}`}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {filteredItems.map((item, idx) => (
          <WantListRow
            key={item.id}
            item={item}
            index={items.indexOf(item) + 1}
            displayIndex={idx + 1}
            onUpdate={(data) => updateMutation.mutate({ id: item.id, data })}
            onDelete={() => deleteMutation.mutate(item.id)}
            onPriorityToggle={(group) => handlePriorityToggle(item, group)}
          />
        ))}

        {filteredItems.length === 0 && (
          <p className="text-sm text-stone-400 italic py-4 text-center">
            {filter === 'all'
              ? 'Tu lista está vacía. ¡Agrega lo que deseas!'
              : `Sin elementos en el grupo ${filter}.`}
          </p>
        )}
      </div>

      {/* Add input */}
      {isAdding ? (
        <div className="flex items-center gap-2 bg-white rounded-lg border border-[#e8b86d] p-2.5">
          <span className="text-xs text-stone-400 font-mono w-5 text-right flex-shrink-0">
            {items.length + 1}.
          </span>
          <input
            type="text"
            value={addingText}
            onChange={(e) => setAddingText(e.target.value)}
            onKeyDown={handleAddKeyDown}
            onBlur={handleAddSubmit}
            placeholder="¿Qué quieres tener, ser o hacer?"
            autoFocus
            className="flex-1 text-sm bg-transparent outline-none text-[#1a1a2e] placeholder:text-stone-400"
          />
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full text-sm py-2.5 rounded-lg border border-dashed border-stone-300 text-stone-400 hover:border-[#e8b86d] hover:text-[#1a1a2e] transition-colors"
        >
          + Agregar deseo
        </button>
      )}
    </div>
  )
}

// ─── Want List Row ────────────────────────────────────────────────────────────

interface WantListRowProps {
  item: WantListItem
  index: number
  displayIndex: number
  onUpdate: (data: Partial<WantListItem>) => void
  onDelete: () => void
  onPriorityToggle: (group: 'A' | 'B' | 'C') => void
}

const PRIORITY_STYLES: Record<'A' | 'B' | 'C', { bg: string; text: string; active: string }> = {
  A: { bg: '#fef9ee', text: '#b45309', active: '#e8b86d' },
  B: { bg: '#f0fdf4', text: '#166534', active: '#43a047' },
  C: { bg: '#eff6ff', text: '#1d4ed8', active: '#1976d2' },
}

function WantListRow({ item, index, onUpdate, onDelete, onPriorityToggle }: WantListRowProps) {
  const [editing, setEditing] = useState(false)
  const [localText, setLocalText] = useState(item.text)

  const handleBlur = () => {
    const trimmed = localText.trim()
    if (trimmed && trimmed !== item.text) {
      onUpdate({ text: trimmed })
    } else {
      setLocalText(item.text)
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') handleBlur()
  }

  return (
    <div className="group flex items-center gap-2 bg-white rounded-lg border border-stone-200 px-3 py-2.5 hover:border-stone-300 transition-colors">
      <span className="text-xs text-stone-400 font-mono w-5 text-right flex-shrink-0">
        {index}.
      </span>

      {/* Text */}
      {editing ? (
        <input
          type="text"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 text-sm bg-transparent border-b border-stone-300 outline-none text-[#1a1a2e]"
        />
      ) : (
        <span
          className="flex-1 text-sm text-[#1a1a2e] cursor-text"
          onClick={() => setEditing(true)}
        >
          {item.text}
        </span>
      )}

      {/* Priority buttons */}
      <div className="flex gap-0.5 flex-shrink-0">
        {(['A', 'B', 'C'] as const).map((group) => {
          const isActive = item.priority_group === group
          const styles = PRIORITY_STYLES[group]
          return (
            <button
              key={group}
              onClick={() => onPriorityToggle(group)}
              className="text-xs w-5 h-5 rounded font-bold transition-colors"
              style={{
                backgroundColor: isActive ? styles.active : styles.bg,
                color: isActive ? '#fff' : styles.text,
              }}
              title={`Grupo ${group}`}
            >
              {group}
            </button>
          )
        })}
      </div>

      {/* Priority badge (when assigned) */}
      {item.priority_group && (
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded hidden"
          aria-hidden="true"
        >
          {item.priority_group}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity text-base leading-none flex-shrink-0"
        title="Eliminar"
      >
        ×
      </button>
    </div>
  )
}
