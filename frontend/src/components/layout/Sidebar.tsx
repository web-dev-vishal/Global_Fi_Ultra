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

const SECTION_1: NavItem[] = [
  { label: 'Dashboard',  href: '/',           icon: LayoutDashboard },
  { label: 'Markets',    href: '/markets',    icon: TrendingUp },
  { label: 'Assets',     href: '/assets',     icon: BarChart3 },
  { label: 'Watchlists', href: '/watchlists', icon: Star },
]

const SECTION_2: NavItem[] = [
  { label: 'Alerts',      href: '/alerts', icon: Bell },
  { label: 'AI Insights', href: '/ai',     icon: Sparkles, badge: 'AI' },
]

const SECTION_3: NavItem[] = [
  { label: 'Users',  href: '/users',  icon: Users },
  { label: 'System', href: '/system', icon: Activity },
  { label: 'Admin',  href: '/admin',  icon: Shield },
]

interface SidebarProps { collapsed: boolean; onToggle: () => void }

function NavItemRow({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  const { label, href, icon: Icon, badge } = item
  return (
    <NavLink
      to={href}
      title={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-3 rounded-r-lg px-3 py-2 text-sm transition-colors duration-100 group',
        collapsed && 'justify-center px-0',
        active
          ? 'border-l-2 border-l-blue-500 bg-blue-500/10 font-medium text-blue-700 dark:text-blue-400 light:bg-blue-50 light:text-blue-700'
          : 'border-l-2 border-l-transparent font-normal text-slate-500 dark:text-[var(--text-2)] hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-[var(--text-1)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1'
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

      {/* Badge — only when expanded */}
      {!collapsed && badge && (
        <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 rounded-full font-semibold leading-4">
          {badge}
        </span>
      )}

      {/* Collapsed tooltip — Level 4 */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-[var(--border-md)] rounded-xl text-xs font-medium text-slate-800 dark:text-[var(--text-1)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl transition-opacity duration-150 flex items-center gap-1.5">
          {label}
          {badge && (
            <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1 rounded-full font-semibold">
              {badge}
            </span>
          )}
        </div>
      )}
    </NavLink>
  )
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) {
    return <div className="my-1 mx-2 h-px bg-slate-200 dark:bg-slate-800" />
  }
  return (
    <div className="flex items-center gap-2 px-3 mb-1 mt-3">
      <span className="text-[10px] uppercase tracking-widest text-[var(--text-3)] font-semibold">
        {label}
      </span>
    </div>
  )
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { pathname } = useLocation()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full shrink-0 overflow-visible bg-white dark:bg-[#0D1526] border-r border-slate-200 dark:border-slate-800"
      aria-label="Main navigation"
    >
      {/* ─── Logo ─── */}
      <div className={cn(
        'flex items-center h-14 border-b border-slate-200 dark:border-slate-800 shrink-0',
        collapsed ? 'justify-center px-0' : 'px-3.5'
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 shrink-0">
            <Zap className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
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
                <span className="text-sm font-semibold text-slate-900 dark:text-[var(--text-1)] whitespace-nowrap tracking-tight">
                  Global-Fi <span className="text-blue-500 dark:text-blue-400">Ultra</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Nav ─── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" aria-label="Primary navigation">
        {SECTION_1.map(item => (
          <NavItemRow key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} />
        ))}

        <SectionLabel label="Tools" collapsed={collapsed} />
        {SECTION_2.map(item => (
          <NavItemRow key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} />
        ))}

        <SectionLabel label="Admin" collapsed={collapsed} />
        {SECTION_3.map(item => (
          <NavItemRow key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} />
        ))}
      </nav>

      {/* ─── Settings ─── */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-2">
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'relative flex items-center gap-3 rounded-r-lg px-3 py-2 text-sm transition-colors duration-100 group',
            collapsed && 'justify-center px-0',
            pathname === '/settings'
              ? 'border-l-2 border-l-blue-500 bg-blue-500/10 font-medium text-blue-700 dark:text-blue-400'
              : 'border-l-2 border-l-transparent font-normal text-slate-500 dark:text-[var(--text-2)] hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-[var(--text-1)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }} className="whitespace-nowrap">
                Settings
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-[var(--border-md)] rounded-xl text-xs font-medium text-slate-800 dark:text-[var(--text-1)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl transition-opacity">
              Settings
            </div>
          )}
        </NavLink>
      </div>

      {/* ─── Collapse toggle ─── */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'absolute top-[72px] -right-3 z-20',
          'flex items-center justify-center w-6 h-6 rounded-full',
          'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600',
          'text-slate-500 dark:text-slate-300',
          'hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:scale-110',
          'transition-all duration-150 shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50'
        )}
      >
        {collapsed
          ? <ChevronRight className="h-3.5 w-3.5" />
          : <ChevronLeft  className="h-3.5 w-3.5" />
        }
      </button>
    </motion.aside>
  )
}
