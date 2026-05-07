import { FolderOpen, Clock, CheckCircle2, Archive } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Card, SectionTitle, Badge } from '../components/ui'
import { clsx } from 'clsx'

const statusConfig = {
  active:   { label: 'Activo',    variant: 'blue',  Icon: FolderOpen  },
  waiting:  { label: 'En espera', variant: 'amber', Icon: Clock       },
  someday:  { label: 'Algún día', variant: 'gray',  Icon: Archive     },
  done:     { label: 'Completado',variant: 'green', Icon: CheckCircle2},
}

export default function Projects() {
  const { projects } = useStore()
  const grouped = {
    active:  projects.filter(p => p.status === 'active'),
    waiting: projects.filter(p => p.status === 'waiting'),
    someday: projects.filter(p => p.status === 'someday'),
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-medium text-gray-900">Proyectos</h2>
        <p className="text-sm text-gray-400">Cada proyecto tiene al menos una próxima acción.</p>
      </div>

      {Object.entries(grouped).map(([status, items]) => {
        if (!items.length) return null
        const { label, Icon } = statusConfig[status]
        return (
          <Card key={status} className="mb-4">
            <SectionTitle>
              <Icon size={12} />
              {label} · {items.length}
            </SectionTitle>
            {items.map(p => (
              <div key={p.id} className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{p.name}</div>
                  {p.nextAction && (
                    <div className="text-xs text-gray-400 mt-0.5">→ {p.nextAction}</div>
                  )}
                </div>
                <Badge variant="gray" className="text-xs">{p.pillar}</Badge>
              </div>
            ))}
          </Card>
        )
      })}
    </div>
  )
}
