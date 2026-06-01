import React from 'react'
import { Moon, Sun, Bell, Wifi, WifiOff, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  connected: boolean
  warningCount?: number
}

export function Header({ connected, warningCount = 0 }: HeaderProps) {
  const { isDark, toggleTheme, currentUser, logout } = useApp()
  const navigate = useNavigate()

  return (
    <header
      className="flex items-center justify-between h-14 px-4 border-b border-border bg-card/80 backdrop-blur-sm shrink-0 w-full"
      role="banner"
    >
      {/* Left: breadcrumb / page title area */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full',
            connected
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          )}
          aria-live="polite"
          aria-label={connected ? 'WebSocket connected' : 'WebSocket disconnected'}
        >
          {connected ? (
            <Wifi className="w-3 h-3" aria-hidden="true" />
          ) : (
            <WifiOff className="w-3 h-3" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{connected ? 'Live' : 'Offline'}</span>
          {connected && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Warnings bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${warningCount > 0 ? `, ${warningCount} new` : ''}`}
          onClick={() => navigate('/system')}
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {warningCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
              aria-hidden="true"
            >
              {warningCount > 9 ? '9+' : warningCount}
            </span>
          )}
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>

        {/* User menu */}
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 pl-2 pr-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                  {currentUser.firstName}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{currentUser.firstName} {currentUser.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button size="sm" onClick={() => navigate('/login')}>
            <User className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Sign in
          </Button>
        )}
      </div>
    </header>
  )
}
