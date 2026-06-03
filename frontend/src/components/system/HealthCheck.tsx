import React from 'react'
import { Activity, Cpu } from 'lucide-react'
import type { HealthStatus, ReadinessStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'

function relTime(s: string) {
  const diff = Date.now() - new Date(s).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s ago`
  return `${Math.floor(secs / 60)}m ago`
}

const cardCls = 'bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl p-5'
const rowCls  = 'flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40'

export function HealthCheck({
  health, ready, loading,
}: {
  health: HealthStatus | null; ready: ReadinessStatus | null; loading?: boolean
}) {
  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SkeletonCard /><SkeletonCard />
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Health card */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-[var(--text-1)]">Health Check</h3>
        </div>
        {health ? (
          <div className="space-y-3">
            <div className={rowCls}>
              <span className="text-sm text-[var(--text-2)]">Status</span>
              <Badge
                variant={health.status === 'healthy' ? 'green' : health.status === 'degraded' ? 'amber' : 'red'}
                dot
              >
                {health.status}
              </Badge>
            </div>
            <div className={rowCls}>
              <span className="text-sm text-[var(--text-2)]">AI Features</span>
              <Badge variant={health.features?.ai ? 'green' : 'slate'}>
                {health.features?.ai ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className={rowCls}>
              <span className="text-sm text-[var(--text-2)]">Last checked</span>
              <span className="text-xs text-[var(--text-3)]">{relTime(health.timestamp)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-2)]">Unable to reach health endpoint</p>
        )}
      </div>

      {/* Readiness card */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-[var(--text-1)]">Readiness</h3>
        </div>
        {ready ? (
          <div className="space-y-3">
            {Object.entries(ready.checks).map(([k, v]) => {
              const s = typeof v === 'string' ? v : (v as any)?.enabled ? 'enabled' : 'disabled'
              const good = ['connected','enabled','ready'].includes(s)
              return (
                <div key={k} className={rowCls}>
                  <span className="text-sm text-[var(--text-2)] capitalize">{k}</span>
                  <Badge variant={good ? 'green' : 'red'} dot>{s}</Badge>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-2)]">Readiness data unavailable</p>
        )}
      </div>
    </div>
  )
}
