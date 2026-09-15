import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create((set, get) => ({
  // ── UI State
  activeTab: 'dashboard',
  energyLevel: 'high',
  weeklyReviewOpen: false,
  initialized: false,
  loading: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setEnergyLevel: (level) => set({ energyLevel: level }),

  // Limpia los datos al cerrar sesión (evita filtrar datos entre usuarios)
  resetData: () => set({
    inbox: [], actions: [], projects: [], habits: [],
    initialized: false, activeTab: 'dashboard',
  }),

  // ── Data
  inbox: [],
  actions: [],
  projects: [],
  habits: [],

  // ── Init: carga desde Supabase, siembra si está vacío
  // Candado anti-reentrada: al cambiar el estado de auth, Supabase emite
  // varios eventos (INITIAL_SESSION, SIGNED_IN…). Sin este guard, varias
  // llamadas concurrentes veían la tabla vacía y sembraban en paralelo,
  // triplicando los datos. `loading` se comprueba de forma síncrona antes
  // de cualquier await, así solo la primera llamada procede.
  initializeFromDB: async () => {
    if (get().initialized || get().loading) return
    set({ loading: true })

    try {
      const [inboxRes, actionsRes, projectsRes, habitsRes] = await Promise.all([
        supabase.from('inbox').select('*').order('created_at', { ascending: false }),
        supabase.from('actions').select('*').order('created_at'),
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('habits').select('*').order('created_at'),
      ])

      // Sin siembra automática: la app carga solo lo que el usuario ya tiene.
      // Una tabla vacía se queda vacía (no se regeneran datos de ejemplo).

      set({
        inbox: inboxRes.data ?? [],
        actions: (actionsRes.data ?? []).map(normalizeAction),
        projects: (projectsRes.data ?? []).map(normalizeProject),
        habits: habitsRes.data ?? [],
        initialized: true,
      })
    } finally {
      set({ loading: false })
    }
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
    if (type === 'action') {
      const { data } = await supabase
        .from('actions')
        .insert({ text: fields.text, ctx: fields.ctx || '', done: false, energy: fields.energy || 'med', project: fields.project || '' })
        .select().single()
      if (data) {
        await supabase.from('inbox').update({ processed: true }).eq('id', id)
        set((s) => ({
          inbox: s.inbox.map((i) => i.id === id ? { ...i, processed: true } : i),
          actions: [...s.actions, normalizeAction(data)],
        }))
      }
    } else {
      const { data } = await supabase
        .from('projects')
        .insert({ name: fields.name, status: 'active', next_action: fields.nextAction || '', pillar: fields.pillar || '' })
        .select().single()
      if (data) {
        await supabase.from('inbox').update({ processed: true }).eq('id', id)
        set((s) => ({
          inbox: s.inbox.map((i) => i.id === id ? { ...i, processed: true } : i),
          projects: [...s.projects, normalizeProject(data)],
        }))
      }
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
