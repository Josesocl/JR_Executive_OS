import { Heart, Star, Globe, Coins } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Card, SectionTitle, ProgressBar } from '../components/ui'

const COACHING_QUESTIONS = [
  '¿Qué estoy ignorando que, si lo atendiera, cambiaría todo?',
  '¿Qué tarea estoy procrastinando y cuál es el costo real de no hacerla?',
  '¿Qué debería dejar de hacer para tener espacio para lo importante?',
  '¿Estoy operando como dueño estratégico o como empleado de mi negocio?',
]

const IKIGAI = [
  { label: 'Lo que amo',           Icon: Heart,  items: 'Acompañar empresarios · Pensar estrategia · Enseñar', bg: 'bg-red-50',    ic: 'text-red-400'    },
  { label: 'En lo que soy bueno',  Icon: Star,   items: 'Gobierno · Sistemas · Diagnóstico · Coaching',        bg: 'bg-yellow-50', ic: 'text-yellow-500' },
  { label: 'Lo que el mundo necesita', Icon: Globe,  items: 'Empresas bien gobernadas · Dueños con claridad',  bg: 'bg-blue-50',   ic: 'text-blue-400'   },
  { label: 'Por lo que me pagan',  Icon: Coins,  items: 'Resultados · Sistemas · Transformación · Escala',     bg: 'bg-green-50',  ic: 'text-green-500'  },
]

export default function Coaching() {
  const { habits, incrementHabit } = useStore()

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-medium text-gray-900">Coaching conductual</h2>
        <p className="text-sm text-gray-400">Atomic Habits + Ikigai · Identidad y sistemas.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Coaching questions */}
        <Card>
          <SectionTitle>Preguntas de activación ejecutiva</SectionTitle>
          <div className="space-y-2">
            {COACHING_QUESTIONS.map((q, i) => (
              <div
                key={i}
                className="text-sm text-gray-700 leading-relaxed p-2.5 bg-surface-secondary rounded-lg cursor-pointer hover:bg-surface-tertiary transition-colors"
                style={{ borderLeft: '3px solid #b8860b' }}
              >
                {q}
              </div>
            ))}
          </div>
        </Card>

        {/* Habit loops */}
        <Card>
          <SectionTitle>Bucles de hábito activos</SectionTitle>
          <div className="space-y-4 mt-1">
            {habits.map(h => {
              const pct = Math.round((h.streak / h.target) * 100)
              const color = pct >= 80 ? 'green' : 'amber'
              return (
                <div key={h.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-gray-700">{h.name}</span>
                    <span className="text-xs text-gray-400">{h.streak}/{h.target}</span>
                  </div>
                  <ProgressBar value={pct} color={color} />
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Ikigai */}
      <Card>
        <SectionTitle>Marco de identidad — Ikigai ejecutivo</SectionTitle>
        <div className="grid grid-cols-4 gap-3 mt-2">
          {IKIGAI.map(({ label, Icon, items, bg, ic }) => (
            <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
              <Icon size={20} className={`${ic} mx-auto mb-2`} />
              <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{items}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
