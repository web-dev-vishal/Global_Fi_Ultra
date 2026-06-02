import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, BarChart3, Star, Bell,
  Sparkles, Users, Activity, Shield, Settings, Zap,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem { label: string; href: string; icon: React.ElementType; badge?: string }

const NAV: NavItem[] = [
  { label: 'Dashboard',   href: '/',           icon: LayoutDashboard },
  { label: 'Markets',     href: '/markets',    icon: TrendingUp },
  { label: 'Assets',      href: '/assets',     icon: BarChart3 },
  { label: 'Watchlists',  href: '/watchlists', icon: Star },
  { label: 'Alerts',      href: '/alerts',     icon: Bell },
  { label: 'AI Insights', href: '/ai',         icon: Sparkles, badge: 'AI' },
  { label: 'Users',       href: '/users',      icon: Users },
  { label: 'System',      href: '/system',     icon: Activity },
  { label: 'Admin',       href: '/admin',      icon: Shield },
]

interface SidebarProps { collapsed: boolean; onToggle: () => void }

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { pathname } = useLocation()

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full shrink-0 overflow-hidden bg-[#0D1526] border-r border-slate-800"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 shrink-0">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.14 }}
                className="overflow-hidden min-w-0"
              >
                <span className="text-sm font-bold text-white whitespace-nowrap tracking-tight">
                  Global-Fi <span className="text-blue-400">Ultra</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon, badge }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <NavLink
              key={href}
              to={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="flex-1 whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && badge && (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 rounded-full font-semibold">
                  {badge}
                </span>
              )}
              {/* Collapsed tooltip */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#131D2E] border border-slate-700 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl transition-opacity duration-150">
                  {label}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Settings */}
      <div className="border-t border-slate-800 p-2">
        <NavLink
          to="/settings"
          className={cn(
            'relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
            pathname === '/settings'
              ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="whitespace-nowrap">Settings</motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#131D2E] border border-slate-700 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl transition-opacity">
              Settings
            </div>
          )}
        </NavLink>
      </div>

      {/* Collapse button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[52px] z-20 flex items-center justify-center h-6 w-6 rounded-full bg-[#131D2E] border border-slate-700 shadow-md hover:border-slate-500 transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3 text-slate-400" />
          : <ChevronLeft className="h-3 w-3 text-slate-400" />
        }
      </button>
    </motion.aside>
  )
}
