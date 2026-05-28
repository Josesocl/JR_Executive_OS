export const CATEGORIES = {
  libre:       { label: 'Libre',       color: '#9e9e9e', bg: '#f5f5f5',  emoji: '⬜', tw: 'bg-gray-100 border-gray-400' },
  trabajo:     { label: 'Trabajo',     color: '#1976d2', bg: '#e3f2fd',  emoji: '💼', tw: 'bg-blue-50 border-blue-500' },
  salud:       { label: 'Salud',       color: '#43a047', bg: '#e8f5e9',  emoji: '💚', tw: 'bg-green-50 border-green-500' },
  social:      { label: 'Social',      color: '#fb8c00', bg: '#fff3e0',  emoji: '🤝', tw: 'bg-orange-50 border-orange-500' },
  aprendizaje: { label: 'Aprendizaje', color: '#7b1fa2', bg: '#f3e5f5',  emoji: '📚', tw: 'bg-purple-50 border-purple-500' },
  creativo:    { label: 'Creativo',    color: '#00897b', bg: '#e0f2f1',  emoji: '🎨', tw: 'bg-teal-50 border-teal-500' },
  urgente:     { label: 'Urgente',     color: '#c62828', bg: '#fce4ec',  emoji: '🔴', tw: 'bg-red-50 border-red-500' },
  admin:       { label: 'Admin',       color: '#5d4037', bg: '#efebe9',  emoji: '⚙️', tw: 'bg-stone-50 border-stone-500' },
} as const

export type CategoryKey = keyof typeof CATEGORIES
