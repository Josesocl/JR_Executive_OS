'use client'

interface EnergyMeterProps {
  value: number | null
  onChange: (v: number) => void
}

export function EnergyMeter({ value, onChange }: EnergyMeterProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-500 w-14 flex-shrink-0">Energía</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="text-xl leading-none transition-transform hover:scale-110"
            style={{
              color: (value ?? 0) >= n ? '#e8b86d' : '#d1d5db',
              filter: (value ?? 0) >= n ? 'none' : 'grayscale(1)',
            }}
            title={`Energía ${n}`}
          >
            ⚡
          </button>
        ))}
      </div>
      {value !== null && (
        <span className="text-xs text-gray-400">{value}/5</span>
      )}
    </div>
  )
}
