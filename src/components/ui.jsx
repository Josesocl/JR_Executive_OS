import { clsx } from 'clsx'

// ─── Badge ────────────────────────────────────────────────────────────────────
const badgeVariants = {
  blue:   'bg-blue-50 text-blue-800',
  green:  'bg-green-50 text-green-800',
  amber:  'bg-amber-50 text-amber-800',
  red:    'bg-red-50 text-red-800',
  teal:   'bg-teal-50 text-teal-800',
  purple: 'bg-purple-50 text-purple-800',
  gray:   'bg-gray-100 text-gray-600',
}

export function Badge({ children, variant = 'gray', className }) {
  return (
    <span className={clsx('badge', badgeVariants[variant], className)}>
      {children}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, onClick }) {
  return (
    <div
      className={clsx('card p-4', onClick && 'cursor-pointer hover:border-gray-300 transition-colors', className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ children, className }) {
  return (
    <div className={clsx('flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400 mb-2', className)}>
      {children}
    </div>
  )
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
const progressColors = {
  blue:   'bg-blue-500',
  green:  'bg-green-500',
  amber:  'bg-amber-500',
  red:    'bg-red-400',
  gold:   'bg-yellow-600',
  navy:   'bg-[#1a3a5c]',
}

export function ProgressBar({ value, color = 'blue', className }) {
  return (
    <div className={clsx('progress-bar', className)}>
      <div
        className={clsx('progress-fill', progressColors[color])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
export function MetricCard({ label, value, sub, color, children }) {
  return (
    <div className="bg-surface-secondary rounded-lg p-3">
      <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</div>
      <div className={clsx('text-3xl font-medium leading-none', color || 'text-gray-900')}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
      {children}
    </div>
  )
}

// ─── Step Number ─────────────────────────────────────────────────────────────
export function StepNum({ n, color = '#185FA5' }) {
  return (
    <div
      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium mt-0.5"
      style={{ background: color }}
    >
      {n}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-300">
      {Icon && <Icon size={32} className="mb-2" />}
      <p className="text-sm">{message}</p>
    </div>
  )
}
