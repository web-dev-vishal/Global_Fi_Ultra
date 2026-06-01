import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from '@/components/common/ToastContainer'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useApp } from '@/context/AppContext'

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { toasts, removeToast } = useApp()
  const { connected, systemWarnings } = useWebSocket({ autoConnect: true })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          connected={connected}
          warningCount={systemWarnings.length}
        />
        <main
          className="flex-1 overflow-y-auto"
          id="main-content"
          role="main"
          aria-label="Main content"
        >
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
