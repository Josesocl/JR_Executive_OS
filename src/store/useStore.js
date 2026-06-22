import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// ─── Seed data (solo se inserta si la BD está vacía) ──────────────────────────

const seedInbox = [
  { text: 'Idea: usar IA para scoring de candidatos en Tooltek', time: 'hace 2h', processed: false },
  { text: 'Revisar propuesta de colaboración Fundación Emprender', time: 'ayer', processed: false },
  { text: 'Leer artículo sobre EOS en empresas familiares', time: 'ayer', processed: false },
  { text: 'Responder consulta de dueño sobre gobierno corporativo', time: 'lun', processed: false },
  { text: 'Preparar material taller "El Método JR" — versión 1.0', time: 'lun', processed: false },
  { text: 'Explorar integración WhatsApp → sistema de captura', time: 'dom', processed: false },
  { text: 'Actualizar perfil LinkedIn con nuevo posicionamiento', time: 'vie', processed: false },
]

const seedActions = [
  { text: 'Preparar agenda reunión Nubatech — propuesta Q3', ctx: 'Nubatech · hoy 15:00', done: true, energy: 'high', project: 'Nubatech' },
  { text: 'Revisar borrador cláusulas EOS — Limatco', ctx: 'EOS · esta semana', done: true, energy: 'high', project: 'Limatco' },
  { text: 'Confirmar speaker para taller CChC junio', ctx: 'CChC · hoy', done: false, energy: 'med', project: 'CChC' },
  { text: 'Enviar seguimiento propuesta Hormisur', ctx: 'Hormisur · urgente', done: false, energy: 'med', project: 'Hormisur' },
  { text: 'Actualizar Documento Fundacional v4', ctx: 'Marca JR · semana', done: false, energy: 'high', project: 'Marca JR' },
]

const seedProjects = [
  { name: 'Nubatech Q3', status: 'active', next_action: 'Preparar agenda reunión', pillar: 'Estrategia' },
  { name: 'Hormisur — Propuesta', status: 'active', next_action: 'Enviar seguimiento', pillar: 'Comercial' },
  { name: 'El Método JR™', status: 'active', next_action: 'Preparar material v1.0', pillar: 'Marca' },
  { name: 'CChC — Taller junio', status: 'active', next_action: 'Confirmar speaker', pillar: 'Eventos' },
  { name: 'EOS Limatco', status: 'active', next_action: 'Revisar cláusulas', pillar: 'EOS' },
  { name: 'GTD Executive OS', status: 'active', next_action: 'Desplegar web app', pillar: 'Tecnología' },
  { name: 'Fundación Emprender', status: 'waiting', next_action: 'Revisar propuesta colaboración', pillar: 'Consejo' },
  { name: 'LinkedIn Rebrand', status: 'someday', next_action: 'Actualizar perfil', pillar: 'Marca' },
]

const seedHabits = [
  { name: 'Revisión semanal GTD', streak: 5, target: 7 },
  { name: 'Captura diaria inbox', streak: 12, target: 14 },
  { name: 'Planificación matutina', streak: 3, target: 7 },
  { name: 'Revisión OKRs mensual', streak: 2, target: 4 },
]

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create((set, get) => ({
  // ── UI State
  activeTab: 'dashboard',
  energyLevel: 'high',
  weeklyReviewOpen: false,
  initialized: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setEnergyLevel: (level) => set({ energyLevel: level }),

  // ── Data
  inbox: [],
  actions: [],
  projects: [],
  habits: [],

  // ── Init: carga desde Supabase, siembra si está vacío
  initializeFromDB: async () => {
    if (get().initialized) return

    const [inboxRes, actionsRes, projectsRes, habitsRes] = await Promise.all([
      supabase.from('inbox').select('*').order('created_at', { ascending: false }),
      supabase.from('actions').select('*').order('created_at'),
      supabase.from('projects').select('*').order('created_at'),
      supabase.from('habits').select('*').order('created_at'),
    ])

    // Sembrar datos iniciales si las tablas están vacías
    if (!inboxRes.data?.length) {
      await supabase.from('inbox').insert(seedInbox)
      const fresh = await supabase.from('inbox').select('*').order('created_at', { ascending: false })
      inboxRes.data = fresh.data
    }
    if (!actionsRes.data?.length) {
      await supabase.from('actions').insert(seedActions)
      const fresh = await supabase.from('actions').select('*').order('created_at')
      actionsRes.data = fresh.data
    }
    if (!projectsRes.data?.length) {
      await supabase.from('projects').insert(seedProjects)
      const fresh = await supabase.from('projects').select('*').order('created_at')
      projectsRes.data = fresh.data
    }
    if (!habitsRes.data?.length) {
      await supabase.from('habits').insert(seedHabits)
      const fresh = await supabase.from('habits').select('*').order('created_at')
      habitsRes.data = fresh.data
    }

    set({
      inbox: inboxRes.data ?? [],
      actions: (actionsRes.data ?? []).map(normalizeAction),
      projects: (projectsRes.data ?? []).map(normalizeProject),
      habits: habitsRes.data ?? [],
      initialized: true,
    })
  },

  // ── Inbox
  captureItem: async (text) => {
    const { data } = await supabase
      .from('inbox')
      .insert({ text, time: 'ahora', processed: false })
      .select()
      .single()
    if (data) set((s) => ({ inbox: [data, ...s.inbox] }))
  },

  processInboxItem: async (id) => {
    await supabase.from('inbox').update({ processed: true }).eq('id', id)
    set((s) => ({
      inbox: s.inbox.map((i) => (i.id === id ? { ...i, processed: true } : i)),
    }))
  },

  // ── Next Actions
  toggleAction: async (id) => {
    const action = get().actions.find((a) => a.id === id)
    if (!action) return
    const newDone = !action.done
    await supabase.from('actions').update({ done: newDone }).eq('id', id)
    set((s) => ({
      actions: s.actions.map((a) => (a.id === id ? { ...a, done: newDone } : a)),
    }))
  },

  addAction: async (text, ctx = '', energy = 'med', project = '') => {
    const { data } = await supabase
      .from('actions')
      .insert({ text, ctx, done: false, energy, project })
      .select()
      .single()
    if (data) set((s) => ({ actions: [...s.actions, normalizeAction(data)] }))
  },

  addProject: async (fields) => {
    const { data } = await supabase
      .from('projects')
      .insert({ name: fields.name, status: fields.status, next_action: fields.nextAction, pillar: fields.pillar })
      .select().single()
    if (data) set((s) => ({ projects: [...s.projects, normalizeProject(data)] }))
  },

  updateProject: async (id, fields) => {
    await supabase.from('projects')
      .update({ name: fields.name, status: fields.status, next_action: fields.nextAction, pillar: fields.pillar })
      .eq('id', id)
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, ...fields, nextAction: fields.nextAction } : p
      ),
    }))
  },

  deleteProject: async (id) => {
    await supabase.from('projects').delete().eq('id', id)
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }))
  },

  updateAction: async (id, fields) => {
    await supabase.from('actions')
      .update({ text: fields.text, ctx: fields.ctx, energy: fields.energy, project: fields.project })
      .eq('id', id)
    set((s) => ({
      actions: s.actions.map((a) => a.id === id ? { ...a, ...fields } : a),
    }))
  },

  deleteAction: async (id) => {
    await supabase.from('actions').delete().eq('id', id)
    set((s) => ({ actions: s.actions.filter((a) => a.id !== id) }))
  },

  convertInboxItem: async (id, type, fields) => {
    await supabase.from('inbox').update({ processed: true }).eq('id', id)
    if (type === 'action') {
      const { data } = await supabase
        .from('actions')
        .insert({ text: fields.text, ctx: fields.ctx || '', done: false, energy: fields.energy || 'med', project: fields.project || '' })
        .select().single()
      if (data) set((s) => ({
        inbox: s.inbox.map((i) => i.id === id ? { ...i, processed: true } : i),
        actions: [...s.actions, normalizeAction(data)],
      }))
    } else {
      const { data } = await supabase
        .from('projects')
        .insert({ name: fields.name, status: 'active', next_action: fields.nextAction || '', pillar: fields.pillar || '' })
        .select().single()
      if (data) set((s) => ({
        inbox: s.inbox.map((i) => i.id === id ? { ...i, processed: true } : i),
        projects: [...s.projects, normalizeProject(data)],
      }))
    }
  },

  // ── Habits
  incrementHabit: async (id) => {
    const habit = get().habits.find((h) => h.id === id)
    if (!habit) return
    const newStreak = habit.streak + 1
    const lastDone = new Date().toISOString()
    await supabase.from('habits').update({ streak: newStreak, last_done: lastDone }).eq('id', id)
    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === id ? { ...h, streak: newStreak, lastDone: lastDone } : h
      ),
    }))
  },

  // ── Computed helpers
  getExecScore: () => {
    const { actions } = get()
    if (!actions.length) return 0
    return Math.round((actions.filter((a) => a.done).length / actions.length) * 100)
  },

  getInboxCount: () => get().inbox.filter((i) => !i.processed).length,
}))

// ─── Helpers para normalizar snake_case → camelCase ───────────────────────────

function normalizeAction(a) {
  return { ...a, nextAction: a.next_action }
}

function normalizeProject(p) {
  return { ...p, nextAction: p.next_action }
}
