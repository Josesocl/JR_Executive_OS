import Sidebar from './components/Sidebar'
import { useStore } from './store/useStore'
import Dashboard from './pages/Dashboard'
import Capture from './pages/Capture'
import Projects from './pages/Projects'
import Actions from './pages/Actions'
import Review from './pages/Review'
import Coaching from './pages/Coaching'
import Agents from './pages/Agents'

const PAGE_MAP = {
  dashboard: Dashboard,
  capture:   Capture,
  projects:  Projects,
  actions:   Actions,
  review:    Review,
  coaching:  Coaching,
  agents:    Agents,
}

export default function App() {
  const { activeTab } = useStore()
  const Page = PAGE_MAP[activeTab] || Dashboard

  return (
    <div className="flex min-h-screen bg-surface-secondary">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <Page />
        </div>
      </main>
    </div>
  )
}
