import React from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { HealthCheck } from '@/components/system/HealthCheck'
import { CircuitBreakers } from '@/components/system/CircuitBreakers'
import { WebSocketStatus } from '@/components/system/WebSocketStatus'
import { SystemWarnings } from '@/components/system/SystemWarnings'
import { useSystemStatus } from '@/hooks/useSystemStatus'

export function System() {
  const { health, ready, cbs, loading, usingMock, reload } = useSystemStatus()
  return (
    <div className="p-5 sm:p-6 max-w-[1200px] mx-auto page-enter">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">System Status</h1>
            {usingMock && <Badge variant="amber">Demo</Badge>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Health monitoring, WebSocket & circuit breakers</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => reload()} loading={loading} icon={<RefreshCw className="h-3.5 w-3.5" />}>
          Refresh
        </Button>
      </div>

      <div className="space-y-5">
        <HealthCheck health={health} ready={ready} loading={loading} />

        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Circuit Breakers</h2>
          <CircuitBreakers cbs={cbs} loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WebSocketStatus />
          <SystemWarnings />
        </div>
      </div>
    </div>
  )
}
