import { create } from 'zustand'
import { toISODateString } from '@/lib/utils/dates'

interface PlannerState {
  selectedDate: string
  setSelectedDate: (date: string) => void

  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  activeTab: string
  setActiveTab: (tab: string) => void
}

export const usePlannerStore = create<PlannerState>((set) => ({
  selectedDate: toISODateString(new Date()),
  setSelectedDate: (date) => set({ selectedDate: date }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  activeTab: 'planner',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
