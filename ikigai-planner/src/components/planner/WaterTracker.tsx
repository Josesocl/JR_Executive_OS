'use client'

interface WaterTrackerProps {
  value: number
  onChange: (v: number) => void
}

export function WaterTracker({ value, onChange }: WaterTrackerProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-500 w-14 flex-shrink-0">Agua</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n === value ? 0 : n)}
            className="text-xl leading-none transition-transform hover:scale-110"
            style={{
              filter: n <= value ? 'none' : 'grayscale(1) opacity(0.4)',
            }}
            title={`${n} vaso${n !== 1 ? 's' : ''}`}
          >
            💧
          </button>
        ))}
      </div>
      <span className="text-xs text-gray-400">{value}/8</span>
    </div>
  )
}
