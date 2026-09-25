import { Brain, GitFork, Map, HeartHandshake, UserCheck, Presentation, Send, Loader2 } from 'lucide-react'
import { Card, SectionTitle } from '../components/ui'
import { clsx } from 'clsx'
import { useState } from 'react'
import { useStore } from '../store/useStore'

const AGENTS = [
  {
    id: 'chief-of-staff', Icon: Brain, name: 'Chief of Staff',
    desc: 'Prioridades, agenda, seguimientos y resúmenes estratégicos.',
    bg: 'bg-blue-50', ic: 'text-blue-600',
    commands: [
      '¿Cuáles son mis 3 prioridades críticas de hoy?',
      'Genera mi brief ejecutivo de la semana',
      'Revisa mis compromisos pendientes de seguimiento',
    ],
  },
  {
    id: 'gtd-processor', Icon: GitFork, name: 'GTD Processor',
    desc: 'Procesa inbox, clarifica acciones, organiza proyectos.',
    bg: 'bg-teal-50', ic: 'text-teal-600',
    commands: [
      'Procesa mi bandeja de entrada completa',
      'Clarifica cada ítem y define su próxima acción',
      'Identifica proyectos sin próxima acción asignada',
    ],
  },
  {
    id: 'strategic-planner', Icon: Map, name: 'Strategic Planner',
    desc: 'OKRs, roadmaps, planes trimestrales y KPIs.',
    bg: 'bg-purple-50', ic: 'text-purple-600',
    commands: [
      'Genera mi plan estratégico del trimestre',
      'Define OKRs para el pilar de integración IA',
      'Crea el roadmap de El Método JR™',
    ],
  },
  {
    id: 'coach', Icon: HeartHandshake, name: 'Coach Conductual',
    desc: 'Hábitos, responsabilidad, comportamiento y momentum.',
    bg: 'bg-amber-50', ic: 'text-amber-600',
    commands: [
      'Revisa mi consistencia de hábitos esta semana',
      '¿Qué comportamiento estoy evitando y por qué?',
      'Dame una pregunta de activación de identidad',
    ],
  },
  {
    id: 'delegation', Icon: UserCheck, name: 'Delegación IA',
    desc: 'Analiza qué delegar, a quién y cómo hacer seguimiento.',
    bg: 'bg-red-50', ic: 'text-red-500',
    commands: [
      '¿Qué en mi lista debería delegar esta semana?',
      'Analiza mi carga cognitiva actual',
      'Crea un protocolo de delegación para mi equipo',
    ],
  },
  {
    id: 'workshop', Icon: Presentation, name: 'Workshop Generator',
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
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')

  const { inbox, actions, projects, habits } = useStore()
  const agent = selected !== null ? AGENTS[selected] : null

  async function run(command) {
    if (!agent || !command?.trim() || loading) return
    setLoading(true)
    setError('')
    setResponse('')
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          command,
          context: { inbox, actions, projects, habits },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(
          data.error === 'no_key'
            ? 'Los agentes aún no tienen la clave de IA configurada (ANTHROPIC_API_KEY en Vercel).'
            : data.message || 'Ocurrió un error al ejecutar el agente.'
        )
      } else {
        setResponse(data.text || '(sin respuesta)')
      }
    } catch {
      setError('No se pudo conectar con el agente. Revisa tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-medium text-gray-900">Agentes IA especializados</h2>
        <p className="text-sm text-gray-400">Cada agente usa el contexto real de tus proyectos, acciones e inbox.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {AGENTS.map((a, i) => (
          <Card
            key={a.id}
            className={clsx('cursor-pointer transition-all', selected === i && 'ring-2 ring-blue-300')}
            onClick={() => { setSelected(selected === i ? null : i); setResponse(''); setError('') }}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${a.bg}`}>
              <a.Icon size={18} className={a.ic} />
            </div>
            <div className="text-sm font-medium text-gray-800 mb-1">{a.name}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{a.desc}</div>
          </Card>
        ))}
      </div>

      {agent && (
        <Card>
          <SectionTitle>
            <agent.Icon size={12} />
            {agent.name}
          </SectionTitle>

          {/* Comandos sugeridos */}
          <div className="space-y-2">
            {agent.commands.map((cmd, i) => (
              <button
                key={i}
                onClick={() => run(cmd)}
                disabled={loading}
                className="flex items-center gap-2 w-full text-left p-2.5 bg-surface-secondary rounded-lg hover:bg-surface-tertiary text-sm text-gray-700 transition-colors disabled:opacity-50"
              >
                <span className="text-blue-400">↗</span>
                {cmd}
              </button>
            ))}
          </div>

          {/* Entrada libre */}
          <form
            onSubmit={(e) => { e.preventDefault(); run(input); }}
            className="flex gap-2 mt-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Pídele algo a ${agent.name}...`}
              disabled={loading}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3 rounded-lg text-white flex items-center justify-center disabled:opacity-40"
              style={{ background: '#185FA5' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>

          {/* Respuesta */}
          {loading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={14} className="animate-spin" /> {agent.name} está pensando...
            </div>
          )}
          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</div>
          )}
          {response && !loading && (
            <div className="mt-3 text-sm text-gray-800 bg-surface-secondary rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
              {response}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
