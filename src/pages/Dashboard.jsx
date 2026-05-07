import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle2, Circle, Zap, Battery, BatteryLow, Flame, FolderOpen, Inbox, Target } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Card, MetricCard, ProgressBar, SectionTitle, Badge } from '../components/ui'
import { clsx } from 'clsx'

const PILLARS = [
  { name: 'Diagnóstico estratégico', pct: 90, color: 'green' },
  { name: 'Gobierno corporativo',    pct: 75, color: 'blue'  },
  { name: 'Mentoría y coaching',     pct: 85, color: 'teal'  },
  { name: 'Modelo de gestión EOS',   pct: 60, color: 'amber' },
  { name: 'Crecimiento comercial',   pct: 50, color: 'amber' },
  { name: 'Integración IA',          pct: 40, color: 'red'   },
]

const ENERGY_OPTIONS = [
  { level: 'high', label: 'Alta',  Icon: Zap,        suggest: 'Energía alta — ideal para decisiones estratégicas y trabajo profundo.',        cls: 'bg-green-50 border-green-300 text-green-700' },
  { level: 'med',  label: 'Media', Icon: Battery,    suggest: 'Energía media — perfecto para reuniones, emails y seguimientos.',              cls: 'bg-amber-50 border-amber-300 text-amber-700' },
  { level: 'low',  label: 'Baja',  Icon: BatteryLow, suggest: 'Energía baja — dedícate a tareas de baja carga cognitiva y captura.',         cls: 'bg-red-50 border-red-300 text-red-700' },
]

const WEEKS = [
  { label: 'S-3', val: 61 },
  { label: 'S-2', val: 79 },
  { label: 'S-1', val: 85 },
  { label: 'Esta', val: 73 },
]

export default function Dashboard() {
  const { actions, toggleAction, energyLevel, setEnergyLevel, getExecScore, inbox, projects } = useStore()
  const score = getExecScore()
  const inboxPending = inbox.filter(i => !i.processed).length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const withNextAction = projects.filter(p => p.status === 'active' && p.nextAction).length
  const today = format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })
  const energyData = ENERGY_OPTIONS.find(e => e.level === energyLevel)
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-500'

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-lg font-medium text-gray-900 capitalize">{today}</h1>
          <p className="text-sm text-gray-400">Sistema Operativo Ejecutivo™</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="green">
            <CheckCircle2 size={10} />
            3 agentes activos
          </Badge>
          {inboxPending > 0 && (
            <Badge variant="red">
              <Inbox size={10} />
              {inboxPending} en bandeja
            </Badge>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <MetricCard label="Ejecución hoy" value={`${score}%`} sub="Acciones completadas" color={scoreColor}>
          <ProgressBar value={score} color={score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red'} className="mt-2" />
        </MetricCard>
        <MetricCard label="Proyectos activos" value={activeProjects} sub={`${withNextAction} con próxima acción`} />
        <MetricCard label="Bandeja entrada" value={inboxPending} sub="Pendientes de procesar" color={inboxPending > 5 ? 'text-red-500' : 'text-gray-900'} />
        <MetricCard label="Racha revisión" value="5" sub="Semanas consecutivas" color="text-yellow-600" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Actions */}
        <Card>
          <SectionTitle>
            <Target size={12} />
            Próximas acciones · Hoy
          </SectionTitle>
          <div>
            {actions.map(a => (
              <div key={a.id} className="action-item">
                <button
                  onClick={() => toggleAction(a.id)}
                  className="flex-shrink-0 mt-0.5 text-gray-300 hover:text-green-500 transition-colors"
                >
                  {a.done
                    ? <CheckCircle2 size={16} className="text-green-500" />
                    : <Circle size={16} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={clsx('text-sm', a.done && 'line-through text-gray-400')}>{a.text}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{a.ctx}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly bars + Energy */}
        <Card>
          <SectionTitle>Ejecución · últimas 4 semanas</SectionTitle>
          <div className="mb-4">
            {WEEKS.map(w => {
              const c = w.val >= 80 ? '#639922' : w.val >= 65 ? '#BA7517' : '#E24B4A'
              return (
                <div key={w.label} className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 w-8">{w.label}</span>
                  <div className="flex-1 h-4 bg-surface-secondary rounded overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${w.val}%`, background: c }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-8 text-right">{w.val}%</span>
                </div>
              )
            })}
          </div>

          <SectionTitle>
            <Zap size={12} />
            Nivel de energía ahora
          </SectionTitle>
          <div className="flex gap-1.5 mb-2">
            {ENERGY_OPTIONS.map(({ level, label, Icon }) => (
              <button
                key={level}
                onClick={() => setEnergyLevel(level)}
                className={clsx(
                  'flex-1 py-1.5 text-xs border rounded-lg flex items-center justify-center gap-1 transition-all',
                  energyLevel === level
                    ? ENERGY_OPTIONS.find(e => e.level === level).cls
                    : 'border-gray-200 text-gray-400 hover:border-gray-300'
                )}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{energyData?.suggest}</p>
        </Card>
      </div>

      {/* Pillars */}
      <Card>
        <SectionTitle>Los 6 pilares de servicio · Estado de posicionamiento</SectionTitle>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {PILLARS.map(p => (
            <div key={p.name} className="bg-surface-secondary rounded-lg px-3 py-2">
              <div className="text-xs font-medium text-gray-700 mb-2">{p.name}</div>
              <ProgressBar value={p.pct} color={p.color} />
              <div className="text-xs text-gray-400 mt-1">{p.pct}% posicionado</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
