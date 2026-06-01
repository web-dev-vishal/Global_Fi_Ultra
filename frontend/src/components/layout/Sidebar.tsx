import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  TrendingUp,
  Bell,
  BookMarked,
  Users,
  Bot,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  BarChart3,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/context/AppContext'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  badgeVariant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Markets', href: '/markets', icon: TrendingUp },
  { label: 'Assets', href: '/assets', icon: BarChart3 },
  { label: 'Watchlists', href: '/watchlists', icon: BookMarked },
  { label: 'Alerts', href: '/alerts', icon: Bell },
  { label: 'AI Insights', href: '/ai', icon: Bot, badge: 'AI', badgeVariant: 'info' },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'System', href: '/system', icon: Activity },
  { label: 'Admin', href: '/admin', icon: Shield },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const { isDark } = useApp()

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-full border-r border-border bg-card overflow-hidden"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary shrink-0">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <span className="font-bold text-sm tracking-tight whitespace-nowrap">
                  Global-Fi Ultra
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" role="navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href)

          return (
            <NavLink
              key={item.href}
              to={item.href}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
                aria-hidden="true"
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="flex-1 whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <Badge variant={item.badgeVariant ?? 'default'} className="text-[10px] px-1.5 py-0">
                  {item.badge}
                </Badge>
              )}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-md transition-opacity">
                  {item.label}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-2">
        <NavLink
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all group relative',
            location.pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 shrink-0" aria-hidden="true" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-md transition-opacity">
              Settings
            </div>
          )}
        </NavLink>
      </div>

      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onToggle}
        className="absolute -right-3 top-[52px] z-10 h-6 w-6 rounded-full border border-border bg-background shadow-sm"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </motion.aside>
  )
}
