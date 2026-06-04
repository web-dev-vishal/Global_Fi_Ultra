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
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchVal, setSearchVal]     = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const meta = PAGE_META[pathname] ?? { title: 'Global-Fi Ultra', subtitle: '' }

  return (
    <header
      className={cn(
        'flex items-center h-[52px] px-4 shrink-0 gap-3',
        'bg-[var(--bg-1)] border-b border-[var(--border-1)]',
      )}
      role="banner"
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenu}
        className={cn(
          'flex md:hidden items-center justify-center h-7 w-7 rounded-md',
          'text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-4)]',
          'transition-colors duration-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]'
        )}
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Page title — desktop */}
      <div className="hidden md:flex flex-col min-w-0">
        <h1 className="text-[13px] font-semibold text-[var(--text-1)] leading-tight tracking-[-0.01em]">
          {meta.title}
        </h1>
        {meta.subtitle && (
          <p className="text-[11px] text-[var(--text-3)] leading-tight mt-0.5">
            {meta.subtitle}
          </p>
        )}
      </div>

      <div className="flex-1" />

      {/* ── Search ── */}
      <AnimatePresence mode="wait">
        {searchOpen ? (
          <motion.div
            key="search-open"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden"
          >
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-3)]" />
            <input
              autoFocus
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search assets, pages…"
              className={cn(
                'w-full h-7 pl-8 pr-8 rounded-md text-xs',
                'bg-[var(--bg-3)] border border-[var(--border-3)]',
                'text-[var(--text-1)] placeholder:text-[var(--text-3)]',
                'focus:outline-none focus:border-[var(--accent)] focus:shadow-[var(--shadow-accent)]',
                'transition-all duration-150'
              )}
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchVal('') }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="search-closed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSearchOpen(true)}
            className={cn(
              'flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px]',
              'bg-[var(--bg-3)] border border-[var(--border-2)]',
              'text-[var(--text-3)] hover:text-[var(--text-2)] hover:border-[var(--border-3)]',
              'transition-all duration-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]'
            )}
          >
            <Search className="h-3 w-3" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[9px] bg-[var(--bg-4)] border border-[var(--border-2)] px-1.5 py-0.5 rounded font-mono leading-none">
              ⌘K
            </kbd>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Connection status ── */}
      <div className={cn(
        'flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border',
        connected
          ? 'bg-[var(--success-subtle)] text-[var(--success-bright)] border-[var(--success-border)]'
          : 'bg-[var(--warning-subtle)] text-[var(--warning-bright)] border-[var(--warning-border)]'
      )}>
        {connected ? (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--success-bright)] opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--success-bright)]" />
          </span>
        ) : (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--warning-bright)] opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--warning-bright)]" />
          </span>
        )}
        <span className="hidden sm:inline">{connected ? 'Live' : 'Offline'}</span>
      </div>

      {/* ── Bell ── */}
      <button
        onClick={() => navigate('/system')}
        className={cn(
          'relative flex items-center justify-center h-7 w-7 rounded-md',
          'text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-4)]',
          'transition-colors duration-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]'
        )}
        aria-label={`Alerts (${warningCount})`}
      >
        <Bell className="h-3.5 w-3.5" />
        {warningCount > 0 && (
          <span className={cn(
            'absolute -top-0.5 -right-0.5',
            'flex h-3.5 w-3.5 items-center justify-center',
            'rounded-full bg-[var(--danger)] text-white',
            'text-[9px] font-bold leading-none'
          )}>
            {warningCount > 9 ? '9+' : warningCount}
          </span>
        )}
      </button>

      {/* Action slot */}
      {actionSlot}

      {/* ── Theme toggle ── */}
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={cn(
          'flex items-center justify-center h-7 w-7 rounded-md',
          'text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-4)]',
          'transition-colors duration-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]'
        )}
      >
        {isDark
          ? <Sun  className="h-3.5 w-3.5 text-[var(--gold-bright)]" />
          : <Moon className="h-3.5 w-3.5 text-[var(--accent)]" />
        }
      </button>

      {/* ── User menu ── */}
      {currentUser ? (
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(o => !o)}
            className={cn(
              'flex items-center gap-2 h-7 pl-1 pr-2 rounded-md',
              'hover:bg-[var(--bg-4)]',
              'transition-colors duration-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]'
            )}
          >
            {/* Avatar */}
            <div className={cn(
              'flex items-center justify-center w-5 h-5 rounded-full',
              'bg-gradient-to-br from-[var(--accent)] to-[var(--ai)]',
              'text-white text-[9px] font-bold shrink-0'
            )}>
              {currentUser.firstName[0]}{currentUser.lastName[0]}
            </div>
            <span className="hidden sm:inline text-[12px] font-medium text-[var(--text-2)] max-w-[72px] truncate">
              {currentUser.firstName}
            </span>
            <ChevronDown className={cn(
              'h-3 w-3 text-[var(--text-3)] transition-transform duration-150',
              userMenuOpen && 'rotate-180'
            )} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0,  scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    'absolute right-0 top-9 w-52 z-50',
                    'bg-[var(--bg-3)] border border-[var(--border-3)]',
                    'rounded-xl shadow-[var(--shadow-float)]',
                    'overflow-hidden'
                  )}
                >
                  {/* User info */}
                  <div className="px-3.5 py-3 border-b border-[var(--border-1)]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--ai)] text-white text-[11px] font-bold shrink-0">
                        {currentUser.firstName[0]}{currentUser.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-[var(--text-1)] truncate">
                          {currentUser.firstName} {currentUser.lastName}
                        </p>
                        <p className="text-[11px] text-[var(--text-3)] truncate">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <button
                      onClick={() => { navigate('/settings'); setUserMenuOpen(false) }}
                      className={cn(
                        'flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-[12px]',
                        'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-4)]',
                        'transition-colors duration-100'
                      )}
                    >
                      <Settings className="h-3.5 w-3.5 text-[var(--text-3)]" />
                      Settings
                    </button>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false) }}
                      className={cn(
                        'flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-[12px]',
                        'text-[var(--danger-bright)] hover:bg-[var(--danger-subtle)]',
                        'transition-colors duration-100'
                      )}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className={cn(
            'flex items-center gap-1.5 h-7 px-3 rounded-md',
            'bg-[var(--accent)] hover:bg-[var(--accent-hover)]',
            'text-white text-[12px] font-semibold',
            'transition-all duration-100 hover:scale-[1.02] active:scale-[0.98]',
            'shadow-[0_2px_8px_var(--accent-glow)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]'
          )}
        >
          <User className="h-3.5 w-3.5" />
          Sign In
        </button>
      )}
    </header>
  )
}
