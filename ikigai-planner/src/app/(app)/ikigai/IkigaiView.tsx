'use client'

import { useIkigai } from '@/hooks/useIkigai'
import { IkigaiSection } from '@/components/goals/IkigaiSection'
import { PurposeStatement } from '@/components/goals/PurposeStatement'
import type { IkigaiItem } from '@/lib/types'

interface IkigaiViewProps {
  userId: string
}

const SECTION_CONFIG = [
  { section: 'love' as const, label: 'Lo que amas', color: '#e8b86d' },
  { section: 'good' as const, label: 'En lo que eres bueno', color: '#43a047' },
  { section: 'needs' as const, label: 'Lo que el mundo necesita', color: '#1976d2' },
  { section: 'paid' as const, label: 'Por lo que te pagan', color: '#7b1fa2' },
]

export function IkigaiView({ userId }: IkigaiViewProps) {
  const { items, purpose, isLoading, addItem, updateItem, deleteItem, updatePurpose } =
    useIkigai(userId)

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6 min-h-full" style={{ backgroundColor: '#f0ece4' }}>
        <div className="h-7 w-40 bg-stone-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 h-52 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-stone-200 h-52 animate-pulse" />
      </div>
    )
  }

  const getItems = (section: IkigaiItem['section']) =>
    items.filter((i) => i.section === section)

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-full" style={{ backgroundColor: '#f0ece4' }}>
      {/* Page header */}
      <div>
        <h1 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>
          Mi IKIGAI
        </h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Descubre tu razón de ser — la intersección de lo que amas, lo que dominas, lo que el mundo necesita y por lo que te pagan.
        </p>
      </div>

      {/* 2×2 Canvas grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTION_CONFIG.map(({ section, label, color }) => (
          <IkigaiSection
            key={section}
            section={section}
            label={label}
            color={color}
            items={getItems(section)}
            onAdd={(text) => addItem(section, text)}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        ))}
      </div>

      {/* Purpose statement */}
      <PurposeStatement purpose={purpose} onUpdate={updatePurpose} />
    </div>
  )
}
