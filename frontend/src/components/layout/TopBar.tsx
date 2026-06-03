import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Bell, User, LogOut, Settings, ChevronDown, Search, X, Menu,
  Sun, Moon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/':           { title: 'Dashboard',    subtitle: 'Real-time market overview' },
  '/markets':    { title: 'Live Markets', subtitle: 'Fetch real-time financial data' },
  '/assets':     { title: 'Assets',       subtitle: 'Manage tracked instruments' },
  '/watchlists': { title: 'Watchlists',   subtitle: 'Monitor your favourite assets' },
  '/alerts':     { title: 'Price Alerts', subtitle: 'Get notified on price moves' },
  '/ai':         { title: 'AI Insights',  subtitle: 'Groq LLaMA-powered analysis' },
  '/users':      { title: 'Users',        subtitle: 'Manage user accounts' },
  '/system':     { title: 'System',       subtitle: 'Health, WebSocket & circuit breakers' },
  '/admin':      { title: 'Admin',        subtitle: 'Cache management & error logs' },
  '/settings':   { title: 'Settings',     subtitle: 'Preferences & configuration' },
}

interface TopBarProps {
  connected: boolean
  warningCount: number
  onMobileMenu: () => void
  actionSlot?: React.ReactNode
}

export function TopBar({ connected, warningCount, onMobileMenu, actionSlot }: TopBarProps) {
  const { pathname } = useLocation()
  const { currentUser, logout, isDark, toggleTheme } = useApp()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal]   = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const meta = PAGE_META[pathname] ?? { title: 'Global-Fi Ultra', subtitle: '' }

  return (
    /* Level 1 — topbar */
    <header
      className="flex items-center h-14 px-4 shrink-0 gap-3 bg-white dark:bg-[#0D1526] border-b border-slate-200 dark:border-slate-800 shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
      role="banner"
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenu}
        className="flex md:hidden items-center justify-center h-8 w-8 rounded-lg text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Page title */}
      <div className="hidden md:flex flex-col min-w-0">
        <h1 className="text-sm font-semibold text-[var(--text-1)] leading-tight">{meta.title}</h1>
        {meta.subtitle && (
          <p className="text-xs text-[var(--text-3)] leading-tight">{meta.subtitle}</p>
        )}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <AnimatePresence>
        {searchOpen ? (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-3)]" />
            <input
              autoFocus
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search…"
              className="w-full h-8 pl-8 pr-8 rounded-lg text-xs bg-slate-50 dark:bg-[var(--bg-input)] border border-slate-200 dark:border-[var(--border)] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-[var(--accent)] transition-all duration-150"
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchVal('') }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-1)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-slate-300 dark:hover:border-[var(--border-md)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 rounded">⌘K</kbd>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Connection status badge */}
      <div className={cn(
        'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border',
        connected
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
      )}>
        {!connected && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
        )}
        {connected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />}
        <span className="hidden sm:inline">{connected ? 'Live' : 'Offline'}</span>
      </div>

      {/* Bell */}
      <button
        onClick={() => navigate('/system')}
        className="relative flex items-center justify-center h-8 w-8 rounded-lg text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        aria-label={`Alerts (${warningCount})`}
      >
        <Bell className="h-4 w-4" />
        {warningCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {warningCount > 9 ? '9+' : warningCount}
          </span>
        )}
      </button>

      {/* Action slot */}
      {actionSlot}

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="flex items-center justify-center h-8 w-8 rounded-lg text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
      >
        {isDark
          ? <Sun  className="h-4 w-4 text-amber-400" />
          : <Moon className="h-4 w-4 text-blue-500" />
        }
      </button>

      {/* User menu */}
      {currentUser ? (
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(o => !o)}
            className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold shrink-0">
              {currentUser.firstName[0]}{currentUser.lastName[0]}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-[var(--text-2)] max-w-[80px] truncate">
              {currentUser.firstName}
            </span>
            <ChevronDown className="h-3 w-3 text-[var(--text-3)]" />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                /* Level 4 — dropdown */
                className="absolute right-0 top-10 w-52 bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-[var(--border-md)] rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-slate-200 dark:border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--text-1)]">{currentUser.firstName} {currentUser.lastName}</p>
                  <p className="text-xs text-[var(--text-3)] truncate">{currentUser.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { navigate('/settings'); setUserMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-[var(--text-3)]" />Settings
                  </button>
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        >
          <User className="h-3.5 w-3.5" />
          <span>Sign In</span>
        </button>
      )}
    </header>
  )
}
