import React, { useState, createContext, useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from '@/components/common/ToastContainer'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useApp } from '@/context/AppContext'
import type { FinancialDataResponse } from '@/types'

// ─── WebSocket Context ────────────────────────────────────────────────────────
// Single WebSocket connection shared across all pages via context

interface WebSocketContextValue {
  connected: boolean
  socketId: string | undefined
  financialData: FinancialDataResponse | null
  systemWarnings: SystemWarning[]
  circuitBreakerChanges: CircuitBreakerChange[]
  joinLiveStream: () => void
  leaveLiveStream: () => void
}

interface SystemWarning {
  id: string
  service: string
  message: string
  severity: string
  timestamp: string
}

interface CircuitBreakerChange {
  id: string
  service: string
  state: string
  timestamp: string
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

export function useSharedWebSocket(): WebSocketContextValue {
  const ctx = useContext(WebSocketContext)
  if (!ctx) throw new Error('useSharedWebSocket must be used within AppLayout')
  return ctx
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toasts, removeToast } = useApp()

  // Single shared WebSocket connection for the entire app
  const ws = useWebSocket({ autoConnect: true })

  return (
    <WebSocketContext.Provider
      value={{
        connected: ws.connected,
        socketId: ws.socketId,
        financialData: ws.financialData,
        systemWarnings: ws.systemWarnings,
        circuitBreakerChanges: ws.circuitBreakerChanges,
        joinLiveStream: ws.joinLiveStream,
        leaveLiveStream: ws.leaveLiveStream,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((c) => !c)}
          />
        </div>

        {/* Mobile sidebar via Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Mobile top bar */}
          <div className="flex md:hidden items-center h-14 px-4 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="mr-2"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
            <span className="font-bold text-sm tracking-tight">Global-Fi Ultra</span>
          </div>

          {/* Desktop header */}
          <div className="hidden md:flex">
            <Header
              connected={ws.connected}
              warningCount={ws.systemWarnings.length}
            />
          </div>

          {/* Mobile header (compact) */}
          <div className="flex md:hidden">
            <Header
              connected={ws.connected}
              warningCount={ws.systemWarnings.length}
              compact
            />
          </div>

          <main
            className="flex-1 overflow-y-auto"
            id="main-content"
            role="main"
            aria-label="Main content"
          >
            <Outlet />
          </main>
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </WebSocketContext.Provider>
  )
}
