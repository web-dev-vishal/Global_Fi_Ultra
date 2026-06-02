import React from 'react'
import { Moon, Sun, Bell, Wifi, WifiOff, User, LogOut, Settings, ChevronDown, Menu, Zap } from 'lucide-react'
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
      className="flex items-center justify-between h-14 px-5 shrink-0 w-full"
      style={{ background: '#2e363c', borderBottom: '1px solid #4d5860' }}
      role="banner"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuClick}
          className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ color: '#6D7B8D' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#444f57'; e.currentTarget.style.color = '#f0ede8' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6D7B8D' }}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: '#ffd0b7' }}>
            <Zap className="w-3.5 h-3.5" style={{ color: '#3b2a1e' }} />
          </div>
          <span className="font-bold text-sm" style={{ color: '#f0ede8' }}>Global-Fi Ultra</span>
        </div>

        {/* Live status badge — desktop */}
        <button
          onClick={() => navigate('/system')}
          className="hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all"
          style={connected
            ? { background: 'rgba(110,231,183,0.10)', color: '#6ee7b7', border: '1px solid rgba(110,231,183,0.22)' }
            : { background: 'rgba(255,107,107,0.10)', color: '#ff8f8f', border: '1px solid rgba(255,107,107,0.22)' }
          }
          aria-label={connected ? 'Live — view system' : 'Offline'}
        >
          {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {connected ? 'Live' : 'Offline'}
          {connected && <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#6ee7b7' }} />}
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Bell */}
        <button
          className="relative flex items-center justify-center h-9 w-9 rounded-lg transition-colors"
          style={{ color: '#6D7B8D' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#444f57'; e.currentTarget.style.color = '#f0ede8' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6D7B8D' }}
          aria-label={`Notifications${warningCount > 0 ? `, ${warningCount} new` : ''}`}
          onClick={() => navigate('/system')}
        >
          <Bell className="h-4 w-4" />
          {warningCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold leading-none"
              style={{ background: '#ff6b6b', color: '#2e363c' }}>
              {warningCount > 9 ? '9+' : warningCount}
            </span>
          )}
        </button>

        {/* User menu */}
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 pl-2 pr-2.5">
                <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border"
                  style={{ background: 'rgba(255,208,183,0.15)', color: '#ffd0b7', border: '1px solid rgba(255,208,183,0.25)' }}>
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate" style={{ color: '#f0ede8' }}>
                  {currentUser.firstName}
                </span>
                <ChevronDown className="h-3 w-3 opacity-40" style={{ color: '#6D7B8D' }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold" style={{ color: '#f0ede8' }}>{currentUser.firstName} {currentUser.lastName}</p>
                  <p className="text-xs truncate" style={{ color: '#6D7B8D' }}>{currentUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}
                className="!text-[#ff8f8f] focus:!text-[#ff8f8f] focus:!bg-[rgba(255,107,107,0.10)]">
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
