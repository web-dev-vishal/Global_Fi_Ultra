import React from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useSharedWebSocket } from '@/components/layout/AppLayout'

export function WebSocketStatus() {
  const { connected, socketId, systemWarnings } = useSharedWebSocket()
  return (
    <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        {connected ? <Wifi className="h-4 w-4 text-emerald-400" /> : <WifiOff className="h-4 w-4 text-red-400" />}
        <h3 className="text-sm font-semibold text-white">WebSocket</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40">
          <span className="text-sm text-slate-400">Connection</span>
          <Badge variant={connected ? 'green' : 'red'} dot>{connected ? 'Connected' : 'Disconnected'}</Badge>
        </div>
        {socketId && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40">
            <span className="text-sm text-slate-400">Socket ID</span>
            <code className="text-xs text-slate-300 bg-slate-700 px-2 py-0.5 rounded font-mono truncate max-w-[140px]">{socketId}</code>
          </div>
        )}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40">
          <span className="text-sm text-slate-400">Warnings</span>
          <Badge variant={systemWarnings.length > 0 ? 'amber' : 'green'}>{systemWarnings.length}</Badge>
        </div>
      </div>
    </div>
  )
}
