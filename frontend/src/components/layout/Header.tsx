import React from 'react'
import { Bell, Wifi, WifiOff, User, LogOut, Settings, ChevronDown, Menu, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useApp } from '@/context/AppContext'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  connected: boolean
  warningCount?: number
  onMobileMenuClick?: () => void
}

export function Header({ connected, warningCount = 0, onMobileMenuClick }: HeaderProps) {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()

  return (
    <header
      className="flex items-center justify-between h-14 px-5 shrink-0 w-full bg-white dark:bg-[#0D1526] border-b border-slate-200 dark:border-slate-800"
      role="banner"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuClick}
          className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg transition-colors text-slate-500 dark:text-[#6D7B8D] hover:bg-slate-100 dark:hover:bg-[#444f57] hover:text-slate-900 dark:hover:text-[#f0ede8]"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 dark:bg-[#ffd0b7]/20 border border-blue-200 dark:border-[#ffd0b7]/30">
            <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-[#ffd0b7]" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-[#f0ede8]">Global-Fi Ultra</span>
        </div>

        {/* Live status badge — desktop */}
        <button
          onClick={() => navigate('/system')}
          className={`hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
            connected
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
              : 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
          }`}
          aria-label={connected ? 'Live — view system' : 'Offline'}
        >
          {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {connected ? 'Live' : 'Offline'}
          {connected && <span className="w-1.5 h-1.5 rounded-full pulse-dot bg-emerald-500" />}
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Bell */}
        <button
          className="relative flex items-center justify-center h-9 w-9 rounded-lg transition-colors text-slate-500 dark:text-[#6D7B8D] hover:bg-slate-100 dark:hover:bg-[#444f57] hover:text-slate-900 dark:hover:text-[#f0ede8]"
          aria-label={`Notifications${warningCount > 0 ? `, ${warningCount} new` : ''}`}
          onClick={() => navigate('/system')}
        >
          <Bell className="h-4 w-4" />
          {warningCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold leading-none bg-red-500 text-white">
              {warningCount > 9 ? '9+' : warningCount}
            </span>
          )}
        </button>

        {/* User menu */}
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 pl-2 pr-2.5">
                <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/25">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate text-slate-800 dark:text-[#f0ede8]">
                  {currentUser.firstName}
                </span>
                <ChevronDown className="h-3 w-3 opacity-40 text-slate-500 dark:text-[#6D7B8D]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-[#f0ede8]">{currentUser.firstName} {currentUser.lastName}</p>
                  <p className="text-xs truncate text-slate-500 dark:text-[#6D7B8D]">{currentUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}
                className="!text-red-600 dark:!text-[#ff8f8f] focus:!text-red-700 dark:focus:!text-[#ff8f8f] focus:!bg-red-50 dark:focus:!bg-[rgba(255,107,107,0.10)]">
                <LogOut className="mr-2 h-4 w-4" />Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button size="sm" onClick={() => navigate('/login')} className="gap-1.5">
            <User className="h-3.5 w-3.5" />Sign in
          </Button>
        )}
      </div>
    </header>
  )
}
