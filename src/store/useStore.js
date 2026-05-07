import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Initial data ────────────────────────────────────────────────────────────

const initialInbox = [
  { id: 1, text: 'Idea: usar IA para scoring de candidatos en Tooltek', time: 'hace 2h', processed: false },
  { id: 2, text: 'Revisar propuesta de colaboración Fundación Emprender', time: 'ayer', processed: false },
  { id: 3, text: 'Leer artículo sobre EOS en empresas familiares', time: 'ayer', processed: false },
  { id: 4, text: 'Responder consulta de dueño sobre gobierno corporativo', time: 'lun', processed: false },
  { id: 5, text: 'Preparar material taller "El Método JR" — versión 1.0', time: 'lun', processed: false },
  { id: 6, text: 'Explorar integración WhatsApp → sistema de captura', time: 'dom', processed: false },
  { id: 7, text: 'Actualizar perfil LinkedIn con nuevo posicionamiento', time: 'vie', processed: false },
]

const initialActions = [
  { id: 1, text: 'Preparar agenda reunión Nubatech — propuesta Q3', ctx: 'Nubatech · hoy 15:00', done: true, energy: 'high', project: 'Nubatech' },
  { id: 2, text: 'Revisar borrador cláusulas EOS — Limatco', ctx: 'EOS · esta semana', done: true, energy: 'high', project: 'Limatco' },
  { id: 3, text: 'Confirmar speaker para taller CChC junio', ctx: 'CChC · hoy', done: false, energy: 'med', project: 'CChC' },
  { id: 4, text: 'Enviar seguimiento propuesta Hormisur', ctx: 'Hormisur · urgente', done: false, energy: 'med', project: 'Hormisur' },
  { id: 5, text: 'Actualizar Documento Fundacional v4', ctx: 'Marca JR · semana', done: false, energy: 'high', project: 'Marca JR' },
]

const initialProjects = [
  { id: 1, name: 'Nubatech Q3', status: 'active', nextAction: 'Preparar agenda reunión', pillar: 'Estrategia' },
  { id: 2, name: 'Hormisur — Propuesta', status: 'active', nextAction: 'Enviar seguimiento', pillar: 'Comercial' },
  { id: 3, name: 'El Método JR™', status: 'active', nextAction: 'Preparar material v1.0', pillar: 'Marca' },
  { id: 4, name: 'CChC — Taller junio', status: 'active', nextAction: 'Confirmar speaker', pillar: 'Eventos' },
  { id: 5, name: 'EOS Limatco', status: 'active', nextAction: 'Revisar cláusulas', pillar: 'EOS' },
  { id: 6, name: 'GTD Executive OS', status: 'active', nextAction: 'Desplegar web app', pillar: 'Tecnología' },
  { id: 7, name: 'Fundación Emprender', status: 'waiting', nextAction: 'Revisar propuesta colaboración', pillar: 'Consejo' },
  { id: 8, name: 'LinkedIn Rebrand', status: 'someday', nextAction: 'Actualizar perfil', pillar: 'Marca' },
]

const initialHabits = [
  { id: 1, name: 'Revisión semanal GTD', streak: 5, target: 7, lastDone: null },
  { id: 2, name: 'Captura diaria inbox', streak: 12, target: 14, lastDone: null },
  { id: 3, name: 'Planificación matutina', streak: 3, target: 7, lastDone: null },
  { id: 4, name: 'Revisión OKRs mensual', streak: 2, target: 4, lastDone: null },
]

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create(
  persist(
    (set, get) => ({
      // ── UI State
      activeTab: 'dashboard',
      energyLevel: 'high',
      weeklyReviewOpen: false,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setEnergyLevel: (level) => set({ energyLevel: level }),

      // ── Inbox
      inbox: initialInbox,
      nextInboxId: 8,

      captureItem: (text) => {
        const id = get().nextInboxId
        set((s) => ({
          inbox: [{ id, text, time: 'ahora', processed: false }, ...s.inbox],
          nextInboxId: id + 1,
        }))
      },

      processInboxItem: (id) => {
        set((s) => ({
          inbox: s.inbox.map((i) => i.id === id ? { ...i, processed: true } : i),
        }))
      },

      // ── Next Actions
      actions: initialActions,

      toggleAction: (id) => {
        set((s) => ({
          actions: s.actions.map((a) => a.id === id ? { ...a, done: !a.done } : a),
        }))
      },

      addAction: (text, ctx = '', energy = 'med', project = '') => {
        const id = Date.now()
        set((s) => ({
          actions: [...s.actions, { id, text, ctx, done: false, energy, project }],
        }))
      },

      // ── Projects
      projects: initialProjects,

      // ── Habits
      habits: initialHabits,

      incrementHabit: (id) => {
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, streak: h.streak + 1, lastDone: new Date().toISOString() } : h
          ),
        }))
      },

      // ── Computed helpers (not stored, derived live)
      getExecScore: () => {
        const { actions } = get()
        if (!actions.length) return 0
        return Math.round((actions.filter((a) => a.done).length / actions.length) * 100)
      },

      getInboxCount: () => get().inbox.filter((i) => !i.processed).length,
    }),
    {
      name: 'gtd-os-storage',
      version: 1,
    }
  )
)
