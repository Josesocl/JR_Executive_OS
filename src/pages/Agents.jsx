import { Brain, GitFork, Map, HeartHandshake, UserCheck, Presentation } from 'lucide-react'
import { Card, SectionTitle, Badge } from '../components/ui'
import { clsx } from 'clsx'
import { useState } from 'react'

const AGENTS = [
  {
    Icon: Brain,        name: 'Chief of Staff',      status: 'active',
    desc: 'Prioridades, agenda, seguimientos y resúmenes estratégicos.',
    bg: 'bg-blue-50', ic: 'text-blue-600',
    commands: [
      '¿Cuáles son mis 3 prioridades críticas de hoy?',
      'Genera mi brief ejecutivo de la semana',
      'Revisa mis compromisos pendientes de seguimiento',
    ],
  },
  {
    Icon: GitFork,      name: 'GTD Processor',       status: 'active',
    desc: 'Procesa inbox, clarifica acciones, organiza proyectos.',
    bg: 'bg-teal-50', ic: 'text-teal-600',
    commands: [
      'Procesa mi bandeja de entrada completa',
      'Clarifica este ítem y define su próxima acción',
      'Identifica proyectos sin próxima acción asignada',
    ],
  },
  {
    Icon: Map,          name: 'Strategic Planner',   status: 'active',
    desc: 'OKRs, roadmaps, planes trimestrales y KPIs.',
    bg: 'bg-purple-50', ic: 'text-purple-600',
    commands: [
      'Genera mi plan estratégico Q3 para JR Jottar',
      'Define OKRs para el pillar de integración IA',
      'Crea el roadmap de El Método JR™',
    ],
  },
  {
    Icon: HeartHandshake, name: 'Coach Conductual', status: 'standby',
    desc: 'Hábitos, responsabilidad, comportamiento y momentum.',
    bg: 'bg-amber-50', ic: 'text-amber-600',
    commands: [
      'Revisa mi consistencia de hábitos esta semana',
      '¿Qué comportamiento estoy evitando y por qué?',
      'Dame una pregunta de activación de identidad',
    ],
  },
  {
    Icon: UserCheck,    name: 'Delegación IA',       status: 'standby',
    desc: 'Analiza qué delegar, a quién y cómo hacer seguimiento.',
    bg: 'bg-red-50', ic: 'text-red-500',
    commands: [
      '¿Qué en mi lista debería delegar esta semana?',
      'Analiza mi carga cognitiva actual',
      'Crea un protocolo de delegación para mi equipo',
    ],
  },
  {
    Icon: Presentation, name: 'Workshop Generator', status: 'standby',
    desc: 'Crea talleres, materiales, ejercicios y guías de facilitador.',
    bg: 'bg-gray-50', ic: 'text-gray-500',
    commands: [
      'Genera un taller GTD de 4 horas para ejecutivos CChC',
      'Crea el módulo 1 del curso de productividad ejecutiva',
      'Diseña ejercicios para "El Método JR"',
    ],
  },
]

export default function Agents() {
  const [selected, setSelected] = useState(null)
  const agent = selected !== null ? AGENTS[selected] : null

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-medium text-gray-900">Agentes IA especializados</h2>
        <p className="text-sm text-gray-400">Cada agente tiene un objetivo claro, herramientas y memoria propia.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {AGENTS.map((a, i) => (
          <Card
            key={a.name}
            className={clsx('cursor-pointer transition-all', selected === i && 'ring-2 ring-blue-300')}
            onClick={() => setSelected(selected === i ? null : i)}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${a.bg}`}>
              <a.Icon size={18} className={a.ic} />
            </div>
            <div className="text-sm font-medium text-gray-800 mb-1">{a.name}</div>
            <div className="text-xs text-gray-400 leading-relaxed mb-2">{a.desc}</div>
            <div className="flex items-center gap-1.5">
              <div className={clsx('w-1.5 h-1.5 rounded-full', a.status === 'active' ? 'bg-green-500' : 'bg-amber-400')} />
              <span className="text-xs text-gray-400">{a.status === 'active' ? 'Activo' : 'En espera'}</span>
            </div>
          </Card>
        ))}
      </div>

      {agent && (
        <Card>
          <SectionTitle>
            <agent.Icon size={12} />
            {agent.name} · Comandos disponibles
          </SectionTitle>
          <div className="space-y-2">
            {agent.commands.map((cmd, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 bg-surface-secondary rounded-lg cursor-pointer hover:bg-surface-tertiary text-sm text-gray-700 transition-colors"
              >
                <span className="text-blue-400">↗</span>
                {cmd}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
