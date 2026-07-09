import { useState } from 'react'
import { CheckCircle2, Circle, Plus, Pencil, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Card, Badge, EmptyState } from '../components/ui'
import Modal from '../components/Modal'

const ENERGY_OPTIONS = [
  { value: 'high', label: 'Alta'   },
  { value: 'med',  label: 'Media'  },
  { value: 'low',  label: 'Baja'   },
]

const energyColors = {
  high: { badge: 'green', label: 'Alta'  },
  med:  { badge: 'amber', label: 'Media' },
  low:  { badge: 'gray',  label: 'Baja'  },
}

const EMPTY_FORM = { text: '', ctx: '', energy: 'med', project: '' }

export default function Actions() {
  const { actions, projects, toggleAction, addAction, updateAction, deleteAction } = useStore()
  const pending = actions.filter(a => !a.done)
  const done    = actions.filter(a => a.done)

  const [showAdd, setShowAdd]   = useState(false)
  const [addForm, setAddForm]   = useState(EMPTY_FORM)
  const [editModal, setEditModal] = useState(null) // null | { action }
  const [editForm, setEditForm]   = useState(EMPTY_FORM)
  const [addSaving, setAddSaving] = useState(false)
  const [editSaving, setEditSaving] = useState(false)

  const handleAdd = async () => {
    if (!addForm.text.trim()) return
    setAddSaving(true)
    await addAction(addForm.text.trim(), addForm.ctx, addForm.energy, addForm.project)
    setAddForm(EMPTY_FORM)
    setShowAdd(false)
    setAddSaving(false)
  }

  const openEdit = (action) => {
    setEditForm({ text: action.text, ctx: action.ctx || '', energy: action.energy || 'med', project: action.project || '' })
    setEditModal({ action })
  }

  const handleUpdate = async () => {
    if (!editForm.text.trim()) return
    setEditSaving(true)
    await updateAction(editModal.action.id, editForm)
    setEditModal(null)
    setEditSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta acción?')) return
    await deleteAction(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Próximas acciones</h2>
          <p className="text-sm text-gray-400">Una acción concreta por cada contexto y proyecto.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(v => !v)}>
          <Plus size={14} /> Nueva acción
        </button>
      </div>

      {/* Inline add form */}
      {showAdd && (
        <Card className="mb-4 border-blue-200">
          <div className="space-y-2">
            <input
              className="input-base w-full"
              placeholder="¿Cuál es la próxima acción física y concreta?"
              value={addForm.text}
              onChange={e => setAddForm(f => ({ ...f, text: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
            <div className="grid grid-cols-3 gap-2">
              <input className="input-base" placeholder="Contexto / fecha" value={addForm.ctx} onChange={e => setAddForm(f => ({ ...f, ctx: e.target.value }))} />
              <select className="input-base" value={addForm.energy} onChange={e => setAddForm(f => ({ ...f, energy: e.target.value }))}>
                {ENERGY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} energía</option>)}
              </select>
              <select className="input-base" value={addForm.project} onChange={e => setAddForm(f => ({ ...f, project: e.target.value }))}>
                <option value="">— Sin proyecto —</option>
                {projects.filter(p => p.status === 'active').map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAdd} disabled={addSaving || !addForm.text.trim()}>
                {addSaving ? 'Guardando…' : 'Agregar'}
              </button>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Pendientes · {pending.length}</div>
        {pending.length === 0 && <EmptyState icon={CheckCircle2} message="¡Sin pendientes!" />}
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
                <Badge variant={energyColors[a.energy]?.badge || 'gray'}>{energyColors[a.energy]?.label}</Badge>
              </div>
            </div>
            <button onClick={() => openEdit(a)} className="text-gray-300 hover:text-blue-500 transition-colors mt-0.5" aria-label="Editar acción">
              <Pencil size={13} />
            </button>
            <button onClick={() => handleDelete(a.id)} className="text-gray-300 hover:text-red-500 transition-colors mt-0.5" aria-label="Eliminar acción">
              <Trash2 size={13} />
            </button>
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
              <div className="text-sm text-gray-500 line-through flex-1">{a.text}</div>
              <button onClick={() => handleDelete(a.id)} className="text-gray-200 hover:text-red-400 transition-colors" aria-label="Eliminar acción">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </Card>
      )}

      {editModal && (
        <Modal title="Editar acción" onClose={() => setEditModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Acción *</label>
              <input className="input-base w-full" value={editForm.text} onChange={e => setEditForm(f => ({ ...f, text: e.target.value }))} autoFocus />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Contexto / fecha</label>
              <input className="input-base w-full" value={editForm.ctx} onChange={e => setEditForm(f => ({ ...f, ctx: e.target.value }))} placeholder="Ej: Nubatech · hoy 15:00" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Energía</label>
                <select className="input-base w-full" value={editForm.energy} onChange={e => setEditForm(f => ({ ...f, energy: e.target.value }))}>
                  {ENERGY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Proyecto</label>
                <select className="input-base w-full" value={editForm.project} onChange={e => setEditForm(f => ({ ...f, project: e.target.value }))}>
                  <option value="">— Sin proyecto —</option>
                  {projects.filter(p => p.status === 'active').map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-ghost" onClick={() => setEditModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={handleUpdate} disabled={editSaving || !editForm.text.trim()}>
                {editSaving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
