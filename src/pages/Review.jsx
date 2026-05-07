import { RefreshCw } from 'lucide-react'
import { Card, SectionTitle } from '../components/ui'

const REVIEW_QUESTIONS = [
  {
    q: '¿Mente despejada — libré el inbox mental?',
    a: 'Captura todo lo que está dando vueltas. Nada debería estar solo en tu cabeza.',
  },
  {
    q: '¿Revisé todos mis proyectos activos?',
    a: 'Cada proyecto activo debe tener al menos una próxima acción concreta.',
  },
  {
    q: '¿Revisé mis compromisos de calendario de la semana pasada y la próxima?',
    a: 'Incluye reuniones, viajes, fechas límite y compromisos con terceros.',
  },
  {
    q: '¿Están actualizadas mis listas "En espera de"?',
    a: 'Identifica quién tiene la pelota y si necesitas hacer seguimiento activo.',
  },
  {
    q: '¿Cuál fue el mayor logro estratégico de la semana?',
    a: 'Celebra el progreso real. El momentum se construye con reconocimiento.',
  },
  {
    q: '¿Qué decisión estratégica debo tomar esta semana?',
    a: 'Define la decisión con claridad, el contexto mínimo necesario y la fecha límite.',
  },
]

export default function Review() {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-medium text-gray-900">Revisión semanal ejecutiva</h2>
        <p className="text-sm text-gray-400">Protocolo GTD · Cada viernes, 45–60 minutos.</p>
      </div>

      <div className="space-y-3">
        {REVIEW_QUESTIONS.map((r, i) => (
          <Card key={i}>
            <div className="flex gap-3">
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium mt-0.5"
                style={{ background: '#185FA5' }}
              >
                {i + 1}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800 mb-1.5">{r.q}</div>
                <div
                  className="text-xs text-gray-500 leading-relaxed p-2.5 bg-surface-secondary rounded-lg"
                  style={{ borderLeft: '2px solid #185FA5' }}
                >
                  {r.a}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
