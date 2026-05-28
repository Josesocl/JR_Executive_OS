'use client'

import { useState, useRef } from 'react'
import type { IkigaiPurpose } from '@/lib/types'

interface PurposeStatementProps {
  purpose: IkigaiPurpose | null
  onUpdate: (data: Partial<IkigaiPurpose>) => void
}

export function PurposeStatement({ purpose, onUpdate }: PurposeStatementProps) {
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const debouncedUpdate = (field: keyof IkigaiPurpose, value: string) => {
    const timers = debounceTimers.current
    if (timers.has(field)) clearTimeout(timers.get(field)!)
    const timer = setTimeout(() => {
      timers.delete(field)
      onUpdate({ [field]: value || null })
    }, 600)
    timers.set(field, timer)
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-5">
      <h2 className="text-base font-bold text-[#1a1a2e]">Mi Propósito IKIGAI</h2>

      {/* Main statement */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Declaración de propósito
        </label>
        <DebouncedTextarea
          field="statement"
          defaultValue={purpose?.statement ?? ''}
          placeholder="Mi propósito es..."
          onChange={debouncedUpdate}
          rows={3}
          borderColor="#e8b86d"
        />
      </div>

      {/* 3-column row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Mis valores
          </label>
          <DebouncedInput
            field="values_text"
            defaultValue={purpose?.values_text ?? ''}
            placeholder="Integridad, familia..."
            onChange={debouncedUpdate}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Mi visión
          </label>
          <DebouncedInput
            field="vision_text"
            defaultValue={purpose?.vision_text ?? ''}
            placeholder="En 10 años quiero..."
            onChange={debouncedUpdate}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Mi misión
          </label>
          <DebouncedInput
            field="mission_text"
            defaultValue={purpose?.mission_text ?? ''}
            placeholder="Ayudo a..."
            onChange={debouncedUpdate}
          />
        </div>
      </div>

      {/* 5-year vision */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Mi visión a 5 años
        </label>
        <DebouncedTextarea
          field="five_year_vision"
          defaultValue={purpose?.five_year_vision ?? ''}
          placeholder="En 5 años mi vida será..."
          onChange={debouncedUpdate}
          rows={4}
        />
      </div>
    </div>
  )
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

interface DebouncedInputProps {
  field: keyof IkigaiPurpose
  defaultValue: string
  placeholder?: string
  onChange: (field: keyof IkigaiPurpose, value: string) => void
}

function DebouncedInput({ field, defaultValue, placeholder, onChange }: DebouncedInputProps) {
  const [value, setValue] = useState(defaultValue)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    onChange(field, e.target.value)
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d]/30 text-[#1a1a2e] placeholder:text-stone-400 transition-colors"
    />
  )
}

interface DebouncedTextareaProps {
  field: keyof IkigaiPurpose
  defaultValue: string
  placeholder?: string
  onChange: (field: keyof IkigaiPurpose, value: string) => void
  rows?: number
  borderColor?: string
}

function DebouncedTextarea({
  field,
  defaultValue,
  placeholder,
  onChange,
  rows = 3,
  borderColor,
}: DebouncedTextareaProps) {
  const [value, setValue] = useState(defaultValue)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    onChange(field, e.target.value)
  }

  return (
    <div
      className="relative"
      style={borderColor ? { borderLeft: `3px solid ${borderColor}`, paddingLeft: '0.75rem' } : undefined}
    >
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d]/30 text-[#1a1a2e] placeholder:text-stone-400 transition-colors resize-none"
      />
    </div>
  )
}
