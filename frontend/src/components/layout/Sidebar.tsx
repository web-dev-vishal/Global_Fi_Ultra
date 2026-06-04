import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, BarChart3, Star, Bell,
  Sparkles, Users, Activity, Shield, Settings, Zap,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ── Nav data ── */
interface NavItem { label: string; href: string; icon: React.ElementType; badge?: string; badgeColor?: string }

const SECTION_CORE: NavItem[] = [
  { label: 'Dashboard',  href: '/',           icon: LayoutDashboard },
  { label: 'Markets',    href: '/markets',    icon: TrendingUp },
  { label: 'Assets',     href: '/assets',     icon: BarChart3 },
  { label: 'Watchlists', href: '/watchlists', icon: Star },
]

const SECTION_TOOLS: NavItem[] = [
  { label: 'Alerts',      href: '/alerts', icon: Bell },
  { label: 'AI Insights', href: '/ai',     icon: Sparkles, badge: 'AI', badgeColor: 'ai' },
]

const SECTION_ADMIN: NavItem[] = [
  { label: 'Users',  href: '/users',  icon: Users },
  { label: 'System', href: '/system', icon: Activity },
  { label: 'Admin',  href: '/admin',  icon: Shield },
]

/* ── NavItem Row ── */
function NavItemRow({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  const { label, href, icon: Icon, badge, badgeColor } = item

  return (
    <NavLink
      to={href}
      title={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-lg transition-all duration-100',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-1',
        'focus-visible:ring-offset-[var(--bg-1)]',
        collapsed ? 'justify-center w-9 h-9 mx-auto' : 'px-2.5 py-1.5 h-8',
        active
          ? 'bg-[var(--accent-subtle)] text-[var(--accent-bright)]'
          : 'text-[var(--text-3)] hover:bg-[var(--bg-4)] hover:text-[var(--text-2)]'
      )}
    >
      {/* Active indicator */}
      {active && !collapsed && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[var(--accent)]"
          style={{ left: '-1px' }}
        />
      )}

      <Icon
        className={cn(
          'h-[15px] w-[15px] shrink-0 transition-colors',
          active ? 'text-[var(--accent-bright)]' : 'text-[var(--text-3)] group-hover:text-[var(--text-2)]'
        )}
        aria-hidden="true"
      />

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'flex-1 text-[13px] font-[450] leading-none whitespace-nowrap',
              active ? 'text-[var(--accent-bright)]' : 'text-[var(--text-2)] group-hover:text-[var(--text-1)]'
            )}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badge */}
      {!collapsed && badge && (
        <span className={cn(
          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full border leading-none',
          badgeColor === 'ai'
            ? 'bg-[var(--ai-subtle)] text-[var(--ai-bright)] border-[var(--ai-border)]'
            : 'bg-[var(--accent-subtle)] text-[var(--accent-bright)] border-[rgba(37,99,235,0.25)]'
        )}>
          {badge}
        </span>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className={cn(
          'pointer-events-none absolute left-full ml-3 z-50',
          'flex items-center gap-2 px-2.5 py-1.5',
          'bg-[var(--bg-3)] border border-[var(--border-3)]',
          'rounded-lg text-[12px] font-medium text-[var(--text-1)]',
          'whitespace-nowrap shadow-[var(--shadow-float)]',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          'translate-x-1 group-hover:translate-x-0',
        )}>
          {label}
          {badge && (
            <span className="text-[9px] font-bold px-1 rounded bg-[var(--ai-subtle)] text-[var(--ai-bright)]">
              {badge}
            </span>
          )}
        </div>
      )}
    </NavLink>
  )
}

/* ── Section Header ── */
function SectionDivider({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) {
    return <div className="my-2 mx-3 h-px bg-[var(--border-1)]" />
  }
  return (
    <div className="flex items-center gap-2 px-2.5 pt-4 pb-1.5">
      <span className="section-label">{label}</span>
    </div>
  )
}

/* ── Main Sidebar ── */
interface SidebarProps { collapsed: boolean; onToggle: () => void }

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { pathname } = useLocation()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 216 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative flex flex-col h-full shrink-0 overflow-visible',
        'bg-[var(--bg-1)]',
        'border-r border-[var(--border-2)]',
      )}
      aria-label="Main navigation"
    >

      {/* ── Logo ── */}
      <div className={cn(
        'flex items-center h-[52px] shrink-0 border-b border-[var(--border-1)]',
        collapsed ? 'justify-center' : 'px-3.5'
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Brand mark */}
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--accent-muted)] border border-[rgba(37,99,235,0.35)] shrink-0">
            <Zap className="w-3.5 h-3.5 text-[var(--accent-bright)]" />
            {/* Subtle inner glow */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--accent-bright)]/10 to-transparent" />
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
                <div className="flex items-baseline gap-1">
                  <span className="text-[13px] font-semibold text-[var(--text-1)] tracking-tight whitespace-nowrap">
                    Global-Fi
                  </span>
                  <span className="text-[13px] font-semibold text-[var(--accent-bright)] tracking-tight">
                    Ultra
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav
        className={cn('flex-1 overflow-y-auto py-2 scrollbar-none', collapsed ? 'px-1.5' : 'px-2')}
        aria-label="Primary navigation"
      >
        <div className="space-y-0.5">
          {SECTION_CORE.map(item => (
            <NavItemRow key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} />
          ))}
        </div>

        <SectionDivider label="Tools" collapsed={collapsed} />
        <div className="space-y-0.5">
          {SECTION_TOOLS.map(item => (
            <NavItemRow key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} />
          ))}
        </div>

        <SectionDivider label="Admin" collapsed={collapsed} />
        <div className="space-y-0.5">
          {SECTION_ADMIN.map(item => (
            <NavItemRow key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} />
          ))}
        </div>
      </nav>

      {/* ── Settings footer ── */}
      <div className={cn(
        'border-t border-[var(--border-1)] py-2',
        collapsed ? 'px-1.5' : 'px-2'
      )}>
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          aria-current={pathname === '/settings' ? 'page' : undefined}
          className={cn(
            'group relative flex items-center gap-2.5 rounded-lg transition-all duration-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]',
            collapsed ? 'justify-center w-9 h-9 mx-auto' : 'px-2.5 py-1.5 h-8',
            pathname === '/settings'
              ? 'bg-[var(--accent-subtle)] text-[var(--accent-bright)]'
              : 'text-[var(--text-3)] hover:bg-[var(--bg-4)] hover:text-[var(--text-2)]'
          )}
        >
          {pathname === '/settings' && !collapsed && (
            <span className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[var(--accent)]" />
          )}
          <Settings
            className={cn(
              'h-[15px] w-[15px] shrink-0',
              pathname === '/settings' ? 'text-[var(--accent-bright)]' : 'text-[var(--text-3)] group-hover:text-[var(--text-2)]'
            )}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className={cn(
                  'text-[13px] font-[450] whitespace-nowrap',
                  pathname === '/settings' ? 'text-[var(--accent-bright)]' : 'text-[var(--text-2)] group-hover:text-[var(--text-1)]'
                )}
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="pointer-events-none absolute left-full ml-3 z-50 flex items-center px-2.5 py-1.5 bg-[var(--bg-3)] border border-[var(--border-3)] rounded-lg text-[12px] font-medium text-[var(--text-1)] whitespace-nowrap shadow-[var(--shadow-float)] opacity-0 group-hover:opacity-100 transition-opacity">
              Settings
            </div>
          )}
        </NavLink>
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'absolute top-[62px] -right-3 z-20',
          'flex items-center justify-center w-5 h-5 rounded-full',
          'bg-[var(--bg-3)] border border-[var(--border-3)]',
          'text-[var(--text-3)] hover:text-[var(--text-1)]',
          'hover:bg-[var(--bg-4)] hover:border-[var(--border-4)]',
          'hover:scale-110 active:scale-95',
          'transition-all duration-150 shadow-[var(--shadow-raised)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]'
        )}
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3" />
          : <ChevronLeft  className="h-3 w-3" />
        }
      </button>
    </motion.aside>
  )
}
