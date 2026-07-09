import { useState } from 'react'
import { FolderOpen, Clock, CheckCircle2, Archive, Plus, Pencil, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Card, SectionTitle, Badge, EmptyState } from '../components/ui'
import Modal from '../components/Modal'

const STATUS_OPTIONS = [
  { value: 'active',  label: 'Activo'     },
  { value: 'waiting', label: 'En espera'  },
  { value: 'someday', label: 'Algún día'  },
]

const PILLAR_OPTIONS = ['Estrategia', 'Comercial', 'Marca', 'Eventos', 'EOS', 'Tecnología', 'Consejo', 'Otro']

const statusConfig = {
  active:  { label: 'Activo',     variant: 'blue',  Icon: FolderOpen   },
  waiting: { label: 'En espera',  variant: 'amber', Icon: Clock        },
  someday: { label: 'Algún día',  variant: 'gray',  Icon: Archive      },
  done:    { label: 'Completado', variant: 'green', Icon: CheckCircle2 },
}

const EMPTY_FORM = { name: '', status: 'active', nextAction: '', pillar: '' }

export default function Projects() {
  const { projects, addProject, updateProject, deleteProject } = useStore()
  const [modal, setModal] = useState(null) // null | { mode: 'create' } | { mode: 'edit', project }
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const grouped = {
    active:  projects.filter(p => p.status === 'active'),
    waiting: projects.filter(p => p.status === 'waiting'),
    someday: projects.filter(p => p.status === 'someday'),
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setModal({ mode: 'create' })
  }

  const openEdit = (project) => {
    setForm({ name: project.name, status: project.status, nextAction: project.nextAction || '', pillar: project.pillar || '' })
    setModal({ mode: 'edit', project })
  }

  const closeModal = () => setModal(null)

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    if (modal.mode === 'create') {
      await addProject(form)
    } else {
      await updateProject(modal.project.id, form)
    }
    setSaving(false)
    closeModal()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este proyecto?')) return
    await deleteProject(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Proyectos</h2>
          <p className="text-sm text-gray-400">Cada proyecto tiene al menos una próxima acción.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={14} /> Nuevo proyecto
        </button>
      </div>

      {projects.length === 0 && (
        <EmptyState icon={FolderOpen} message="Sin proyectos. Crea el primero." />
      )}

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
                {p.pillar && <Badge variant="gray" className="text-xs">{p.pillar}</Badge>}
                <button onClick={() => openEdit(p)} className="text-gray-300 hover:text-blue-500 transition-colors" aria-label="Editar proyecto">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-500 transition-colors" aria-label="Eliminar proyecto">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </Card>
        )
      })}

      {modal && (
        <Modal title={modal.mode === 'create' ? 'Nuevo proyecto' : 'Editar proyecto'} onClose={closeModal}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nombre *</label>
              <input className="input-base w-full" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Propuesta Hormisur Q3" autoFocus />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Próxima acción</label>
              <input className="input-base w-full" value={form.nextAction} onChange={e => setForm(f => ({ ...f, nextAction: e.target.value }))} placeholder="Ej: Enviar seguimiento" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Estado</label>
                <select className="input-base w-full" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Pilar</label>
                <select className="input-base w-full" value={form.pillar} onChange={e => setForm(f => ({ ...f, pillar: e.target.value }))}>
                  <option value="">— Sin pilar —</option>
                  {PILLAR_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-ghost" onClick={closeModal}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
