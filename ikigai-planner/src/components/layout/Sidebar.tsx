'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  Target,
  Trophy,
  CalendarDays,
  CalendarRange,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { label: 'Dashboard',     icon: LayoutDashboard, href: '/dashboard' },
  { label: 'IKIGAI',        icon: Target,           href: '/ikigai' },
  { label: 'Metas',         icon: Trophy,           href: '/goals' },
  { label: 'Planner',       icon: CalendarDays,     href: '/planner' },
  { label: 'Semana',        icon: CalendarRange,    href: '/weekly' },
  { label: 'Mes',           icon: Calendar,         href: '/monthly' },
  { label: 'Configuración', icon: Settings,         href: '/settings' },
] as const

interface SidebarProps {
  user: User
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    'Usuario'

  const avatarUrl: string | undefined =
    user.user_metadata?.avatar_url ?? user.user_metadata?.picture

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile overlay (sidebar hidden on small screens, toggled via state in parent) */}
      <aside
        className={cn(
          'hidden md:flex flex-col transition-all duration-300 relative flex-shrink-0',
          collapsed ? 'w-16' : 'w-56',
        )}
        style={{ backgroundColor: '#1a1a2e', color: 'white' }}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-5 border-b border-white/10',
            collapsed && 'justify-center px-2',
          )}
        >
          {collapsed ? (
            <span className="text-lg font-bold" style={{ color: '#e8b86d' }}>
              IK
            </span>
          ) : (
            <>
              <span className="text-xl font-bold tracking-tight" style={{ color: '#e8b86d' }}>
                IKIGAI
              </span>
              <span className="text-xl font-light tracking-tight text-white">
                Planner
              </span>
            </>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'text-[#1a1a2e] font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/10',
                  collapsed && 'justify-center px-2 mx-1',
                )}
                style={active ? { backgroundColor: '#e8b86d' } : undefined}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-3">
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2 px-1">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-[#1a1a2e]"
                  style={{ backgroundColor: '#e8b86d' }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-white/80 truncate">{displayName}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-2 w-full rounded-lg px-2 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors',
              collapsed && 'justify-center',
            )}
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-stone-200 bg-white text-[#1a1a2e] hover:bg-stone-100 transition-colors z-10"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>
    </>
  )
}
