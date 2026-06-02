import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useSharedWebSocket } from '@/components/layout/AppLayout'

interface LayoutProps {
  actionSlot?: React.ReactNode
}

export function Layout({ actionSlot }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { connected, systemWarnings } = useSharedWebSocket()

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1220]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[220px] border-r border-slate-800 bg-[#0D1526]">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          connected={connected}
          warningCount={systemWarnings.length}
          onMobileMenu={() => setMobileOpen(true)}
          actionSlot={actionSlot}
        />
        <main className="flex-1 overflow-y-auto" id="main-content" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
