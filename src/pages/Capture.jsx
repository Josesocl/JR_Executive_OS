import { useState } from 'react'
import { Plus, Phone, FileText, Lightbulb, BarChart2, CheckCircle2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Card, SectionTitle, StepNum, Badge } from '../components/ui'
import ProcessModal from '../components/ProcessModal'

const QUICK_CAPTURES = [
  { Icon: Phone,     label: 'Llamada',   text: '📞 Llamar a cliente sobre propuesta Hormisur' },
  { Icon: FileText,  label: 'Documento', text: '📝 Actualizar propuesta EOS — nuevo cliente' },
  { Icon: Lightbulb, label: 'Idea',      text: '🤔 Idea: taller de productividad para CChC' },
  { Icon: BarChart2, label: 'Revisión',  text: '📊 Revisar métricas del mes antes del jueves' },
]

const GTD_STEPS = [
  { n: 1, name: '¿Es accionable?',                  desc: 'Si no → archivo de referencia, lista algún-día o papelera.' },
  { n: 2, name: '¿Cuál es el resultado deseado?',   desc: 'Define el proyecto si requiere más de un paso.' },
  { n: 3, name: '¿Cuál es la próxima acción física?', desc: 'Una acción concreta y específica. Nunca vaga.' },
  { n: 4, name: '¿2 minutos o menos?',              desc: 'Si sí → hazlo ahora. Si no → agenda, delega o lista.' },
]

const SYSTEM_LISTS = [
  { label: 'Próximas acciones', count: 23 },
  { label: 'Proyectos',         count: 11 },
  { label: 'En espera de',      count: 5  },
  { label: 'Calendario',        count: 8  },
  { label: 'Algún día / quizás',count: 17 },
  { label: 'Referencia',        count: 41 },
]

export default function Capture() {
  const [input, setInput] = useState('')
  const [processingItem, setProcessingItem] = useState(null) // inbox item being processed
  const { inbox, captureItem } = useStore()
  const pending = inbox.filter(i => !i.processed)

  const handleCapture = () => {
    const val = input.trim()
    if (!val) return
    captureItem(val)
    setInput('')
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-medium text-gray-900">Sistema de captura total</h2>
        <p className="text-sm text-gray-400">Captura todo. Procesa después. Inbox cero.</p>
      </div>

      {/* Capture bar */}
      <div className="flex gap-2 mb-3">
        <input
          className="input-base flex-1"
          placeholder="Captura un pensamiento, tarea, idea o compromiso..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCapture()}
          autoFocus
        />
        <button className="btn-primary" onClick={handleCapture}>
          <Plus size={14} /> Capturar
        </button>
      </div>

      {/* Quick capture */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {QUICK_CAPTURES.map(({ Icon, label, text }) => (
          <button key={label} className="btn-ghost" onClick={() => captureItem(text)}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Inbox */}
      <Card className="mb-4">
        <SectionTitle>
          Bandeja de entrada · sin procesar
          <Badge variant="red" className="ml-1">{pending.length}</Badge>
        </SectionTitle>
        {pending.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-green-600">
            <CheckCircle2 size={16} />
            <span className="text-sm">¡Inbox cero! Estás al día.</span>
          </div>
        ) : (
          <div>
            {pending.map(item => (
              <div key={item.id} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                <span className="flex-1 text-sm text-gray-700">{item.text}</span>
                <span className="text-xs text-gray-400 mr-2">{item.time}</span>
                <button
                  className="btn-ghost py-1 px-2 text-xs"
                  onClick={() => setProcessingItem(item)}
                >
                  Procesar →
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* GTD Flow */}
        <Card>
          <SectionTitle>Flujo de clarificación GTD</SectionTitle>
          {GTD_STEPS.map(s => (
            <div key={s.n} className="flex gap-2.5 py-2 border-b border-gray-100 last:border-0">
              <StepNum n={s.n} />
              <div>
                <div className="text-sm font-medium text-gray-800">{s.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{s.desc}</div>
              </div>
            </div>
          ))}
        </Card>

        {/* System lists */}
        <Card>
          <SectionTitle>Listas del sistema</SectionTitle>
          {SYSTEM_LISTS.map(l => (
            <div key={l.label} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
              <span className="flex-1 text-sm text-gray-700">{l.label}</span>
              <Badge variant="gray">{l.count}</Badge>
            </div>
          ))}
        </Card>
      </div>

      {processingItem && (
        <ProcessModal
          item={processingItem}
          onClose={() => setProcessingItem(null)}
        />
      )}
    </div>
  )
}
