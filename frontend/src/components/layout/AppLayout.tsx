import React, { createContext, useContext, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useApp } from '@/context/AppContext'
import { SidebarProvider, useSidebar } from '@/context/SidebarContext'
import type { FinancialDataResponse, AIMessage } from '@/types'

// ─── Shared WebSocket Context ─────────────────────────────────────────────────

interface SystemWarning       { id: string; service: string; message: string; severity: string; timestamp: string }
interface CircuitBreakerChange { id: string; service: string; state: string; timestamp: string }

export interface WebSocketContextValue {
  connected: boolean; socketId: string | undefined
  financialData: FinancialDataResponse | null
  systemWarnings: SystemWarning[]; circuitBreakerChanges: CircuitBreakerChange[]
  clearWarnings: () => void; joinLiveStream: () => void; leaveLiveStream: () => void
  aiMessages: AIMessage[]; isAIStreaming: boolean
  sendAIChat: (message: string, sessionId?: string) => void
  stopAIStream: () => void; clearAIMessages: () => void
}

const WSCtx = createContext<WebSocketContextValue | null>(null)

export function useSharedWebSocket(): WebSocketContextValue {
  const ctx = useContext(WSCtx)
  if (!ctx) throw new Error('useSharedWebSocket must be inside AppLayout')
  return ctx
}

// ─── Inner shell (needs SidebarProvider in scope) ────────────────────────────

function AppShell() {
  const { isCollapsed, toggle } = useSidebar()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toasts, removeToast } = useApp()
  const ws = useWebSocket({ autoConnect: true })

  return (
    <WSCtx.Provider value={ws}>
      <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-[#0B1220]">
        {/* Desktop sidebar */}
        <div className="hidden md:flex shrink-0">
          <Sidebar collapsed={isCollapsed} onToggle={toggle} />
        </div>

        {/* Mobile sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-[220px] bg-[#0D1526] border-r border-slate-800">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar
            connected={ws.connected}
            warningCount={ws.systemWarnings.length}
            onMobileMenu={() => setMobileOpen(true)}
          />
          <main className="flex-1 overflow-y-auto" id="main-content" role="main">
            <Outlet />
          </main>
        </div>
      </div>
    </WSCtx.Provider>
  )
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppShell />
    </SidebarProvider>
  )
}
