import { CheckCircle2, Circle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Card, Badge } from '../components/ui'
import { clsx } from 'clsx'

const energyColors = {
  high: { badge: 'green', label: 'Alta' },
  med:  { badge: 'amber', label: 'Media' },
  low:  { badge: 'gray',  label: 'Baja' },
}

export default function Actions() {
  const { actions, toggleAction } = useStore()
  const pending = actions.filter(a => !a.done)
  const done = actions.filter(a => a.done)

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-medium text-gray-900">Próximas acciones</h2>
        <p className="text-sm text-gray-400">Una acción concreta por cada contexto y proyecto.</p>
      </div>

      <Card className="mb-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Pendientes · {pending.length}</div>
        {pending.map(a => (
          <div key={a.id} className="flex items-start gap-2.5 py-2.5 border-b border-gray-100 last:border-0">
            <button onClick={() => toggleAction(a.id)} className="mt-0.5 text-gray-300 hover:text-green-500 transition-colors flex-shrink-0">
              <Circle size={16} />
            </button>
            <div className="flex-1">
              <div className="text-sm text-gray-800">{a.text}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">{a.ctx}</span>
                {a.project && <Badge variant="gray">{a.project}</Badge>}
                <Badge variant={energyColors[a.energy]?.badge || 'gray'}>
                  {energyColors[a.energy]?.label}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {done.length > 0 && (
        <Card>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Completadas hoy · {done.length}</div>
          {done.map(a => (
            <div key={a.id} className="flex items-start gap-2.5 py-2 border-b border-gray-100 last:border-0 opacity-50">
              <button onClick={() => toggleAction(a.id)} className="mt-0.5 flex-shrink-0">
                <CheckCircle2 size={16} className="text-green-500" />
              </button>
              <div className="text-sm text-gray-500 line-through">{a.text}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
