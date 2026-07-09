import { useState } from 'react'
import { Zap, FolderOpen } from 'lucide-react'
import { useStore } from '../store/useStore'
import Modal from './Modal'

const ENERGY_OPTIONS = [
  { value: 'high', label: 'Alta'  },
  { value: 'med',  label: 'Media' },
  { value: 'low',  label: 'Baja'  },
]

const PILLAR_OPTIONS = ['Estrategia', 'Comercial', 'Marca', 'Eventos', 'EOS', 'Tecnología', 'Consejo', 'Otro']

export default function ProcessModal({ item, onClose }) {
  const { convertInboxItem, projects } = useStore()
  const [type, setType]     = useState('action') // 'action' | 'project'
  const [saving, setSaving] = useState(false)

  const [actionForm, setActionForm] = useState({ text: item.text, ctx: '', energy: 'med', project: '' })
  const [projectForm, setProjectForm] = useState({ name: item.text, nextAction: '', pillar: '' })

  const handleSave = async () => {
    setSaving(true)
    await convertInboxItem(item.id, type, type === 'action' ? actionForm : projectForm)
    setSaving(false)
    onClose()
  }

  return (
    <Modal title={`Procesar: "${item.text.slice(0, 40)}…"`} onClose={onClose}>
      {/* Type selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setType('action')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-colors ${type === 'action' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
        >
          <Zap size={14} /> Acción
        </button>
        <button
          onClick={() => setType('project')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-colors ${type === 'project' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
        >
          <FolderOpen size={14} /> Proyecto
        </button>
      </div>

      {type === 'action' ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Acción concreta *</label>
            <input className="input-base w-full" value={actionForm.text} onChange={e => setActionForm(f => ({ ...f, text: e.target.value }))} autoFocus />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Contexto / fecha</label>
            <input className="input-base w-full" value={actionForm.ctx} onChange={e => setActionForm(f => ({ ...f, ctx: e.target.value }))} placeholder="Ej: reunión Nubatech · jueves" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Energía</label>
              <select className="input-base w-full" value={actionForm.energy} onChange={e => setActionForm(f => ({ ...f, energy: e.target.value }))}>
                {ENERGY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Proyecto</label>
              <select className="input-base w-full" value={actionForm.project} onChange={e => setActionForm(f => ({ ...f, project: e.target.value }))}>
                <option value="">— Sin proyecto —</option>
                {projects.filter(p => p.status === 'active').map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre del proyecto *</label>
            <input className="input-base w-full" value={projectForm.name} onChange={e => setProjectForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Primera próxima acción</label>
            <input className="input-base w-full" value={projectForm.nextAction} onChange={e => setProjectForm(f => ({ ...f, nextAction: e.target.value }))} placeholder="Ej: Llamar a contacto clave" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Pilar</label>
            <select className="input-base w-full" value={projectForm.pillar} onChange={e => setProjectForm(f => ({ ...f, pillar: e.target.value }))}>
              <option value="">— Sin pilar —</option>
              {PILLAR_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving || (type === 'action' ? !actionForm.text.trim() : !projectForm.name.trim())}
        >
          {saving ? 'Guardando…' : `Convertir en ${type === 'action' ? 'acción' : 'proyecto'}`}
        </button>
      </div>
    </Modal>
  )
}
