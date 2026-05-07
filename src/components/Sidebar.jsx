import {
  LayoutDashboard, Inbox, FolderOpen, ListChecks,
  RefreshCw, Heart, Brain, Settings, ChevronRight
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',        Icon: LayoutDashboard },
  { id: 'capture',    label: 'Captura',           Icon: Inbox },
  { id: 'projects',   label: 'Proyectos',         Icon: FolderOpen },
  { id: 'actions',    label: 'Próximas acciones', Icon: ListChecks },
  { id: 'review',     label: 'Revisión semanal',  Icon: RefreshCw },
  { id: 'coaching',   label: 'Coaching',          Icon: Heart },
  { id: 'agents',     label: 'Agentes IA',        Icon: Brain },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, getInboxCount } = useStore()
  const inboxCount = getInboxCount()

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#185FA5' }}>
            <Brain size={16} color="white" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 leading-tight">GTD Executive OS™</div>
            <div className="text-xs text-gray-400">por JR Jottar</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5',
              activeTab === id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-500 hover:bg-surface-secondary hover:text-gray-700'
            )}
          >
            <Icon size={15} />
            <span className="flex-1 text-left">{label}</span>
            {id === 'capture' && inboxCount > 0 && (
              <span className="badge bg-red-50 text-red-700 text-xs px-1.5 py-0">{inboxCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
            JR
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-800 truncate">José Ramón Jottar</div>
            <div className="text-xs text-gray-400">Executive OS™</div>
          </div>
          <Settings size={13} className="text-gray-300 cursor-pointer hover:text-gray-500" />
        </div>
      </div>
    </aside>
  )
}
