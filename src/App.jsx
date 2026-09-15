import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
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

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary">
      <p className="text-text-secondary text-sm">Cargando...</p>
    </div>
  )
}

export default function App() {
  // undefined = auth state still loading; null = signed out; object = signed in
  const [session, setSession] = useState(undefined)
  const { activeTab, initialized, initializeFromDB, resetData } = useStore()
  const Page = PAGE_MAP[activeTab] || Dashboard

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s) resetData()
    })
    return () => sub.subscription.unsubscribe()
  }, [resetData])

  useEffect(() => {
    if (session) initializeFromDB()
  }, [session, initializeFromDB])

  if (session === undefined) return <Loading />
  if (!session) return <Login />
  if (!initialized) return <Loading />

  return (
    <div className="flex min-h-screen bg-surface-secondary">
      <Sidebar userEmail={session.user?.email} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <Page />
        </div>
      </main>
    </div>
  )
}
