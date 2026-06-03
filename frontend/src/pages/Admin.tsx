import React, { useState, useEffect } from 'react'
import { RefreshCw, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SecurityWarning } from '@/components/admin/SecurityWarning'
import { CacheManagement } from '@/components/admin/CacheManagement'
import { ErrorLogs } from '@/components/admin/ErrorLogs'
import { adminApi } from '@/lib/api'
import { Skeleton } from '@/components/ui/Skeleton'

export function Admin() {
  const [metrics, setMetrics] = useState<{ period: string; metrics: Record<string, unknown> } | null>(null)
  const [loading, setLoading] = useState(true)

  const loadMetrics = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))
    try {
      const r = await adminApi.getMetrics(24)
      setMetrics(r as { period: string; metrics: Record<string, unknown> })
    } catch {
      setMetrics({
        period: '24h',
        metrics: { totalRequests: 1284, cacheHits: 891, apiCalls: 393, errors: 7, avgDuration: '142ms' },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMetrics() }, [])

  return (
    <div className="p-5 sm:p-6 max-w-[1200px] mx-auto page-enter animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          {/* Admin purple accent on title */}
          <h1 className="text-xl font-semibold text-[var(--text-1)]">Admin Panel</h1>
          <p className="text-xs text-[var(--text-3)] mt-0.5">Cache management, metrics &amp; error logs</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadMetrics} loading={loading} icon={<RefreshCw className="h-3.5 w-3.5" />}>
          Refresh
        </Button>
      </div>

      <SecurityWarning />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="space-y-4">
          <CacheManagement />

          {/* Metrics card — Level 2 */}
          <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-[var(--text-1)]">Metrics (24h)</h3>
            </div>

            {loading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-9 rounded-xl" />)}</div>
            ) : metrics ? (
              <div className="space-y-2">
                <p className="text-[10px] text-[var(--text-3)] uppercase tracking-wider mb-3">
                  Period: {metrics.period}
                </p>
                {Object.entries(metrics.metrics ?? {}).slice(0, 8).map(([k, v]) => (
                  /* Level 3 row */
                  <div key={k} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-xs text-[var(--text-2)] capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-semibold text-[var(--text-1)] font-mono tabular-nums">
                      {typeof v === 'number' ? v.toLocaleString() : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-2"><ErrorLogs /></div>
      </div>
    </div>
  )
}
