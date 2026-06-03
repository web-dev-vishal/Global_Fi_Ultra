import React from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useSharedWebSocket } from '@/components/layout/AppLayout'

const rowCls = 'flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40'

export function WebSocketStatus() {
  const { connected, socketId, systemWarnings } = useSharedWebSocket()

  return (
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        {connected
          ? <Wifi  className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          : <WifiOff className="h-4 w-4 text-red-400" />
        }
        <h3 className="text-sm font-semibold text-[var(--text-1)]">WebSocket</h3>
      </div>

      <div className="space-y-3">
        <div className={rowCls}>
          <span className="text-sm text-[var(--text-2)]">Connection</span>
          <Badge variant={connected ? 'green' : 'red'} dot>
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {socketId && (
          <div className={rowCls}>
            <span className="text-sm text-[var(--text-2)]">Socket ID</span>
            <code className="text-xs text-[var(--text-2)] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[var(--border)] px-2 py-0.5 rounded font-mono truncate max-w-[140px]">
              {socketId}
            </code>
          </div>
        )}

        <div className={rowCls}>
          <span className="text-sm text-[var(--text-2)]">Warnings</span>
          <Badge variant={systemWarnings.length > 0 ? 'amber' : 'green'}>
            {systemWarnings.length}
          </Badge>
        </div>
      </div>
    </div>
  )
}
