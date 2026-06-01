import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shield, Trash2, BarChart3, FileText, AlertTriangle, RefreshCw, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { adminApi } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

export function Admin() {
  const { toast } = useApp()
  const [metrics, setMetrics] = useState<{ period: string; metrics: Record<string, unknown> } | null>(null)
  const [logs, setLogs] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [clearingCache, setClearingCache] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [m, l] = await Promise.allSettled([
        adminApi.getMetrics(24),
        adminApi.getLogs(20),
      ])
      if (m.status === 'fulfilled') setMetrics(m.value as { period: string; metrics: Record<string, unknown> })
      if (l.status === 'fulfilled') setLogs((l.value.logs ?? []) as Record<string, unknown>[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleClearCache = async () => {
    try {
      setClearingCache(true)
      const result = await adminApi.clearCache()
      toast.success('Cache cleared', result.message ?? 'Redis cache flushed successfully.')
    } catch (err) {
      toast.error('Failed to clear cache', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setClearingCache(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Admin Panel"
        description="System administration and monitoring"
        actions={
          <Button variant="outline" size="sm" onClick={fetchData} loading={loading} aria-label="Refresh admin data">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      {/* Warning banner */}
      <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
        Admin endpoints are not yet protected by authentication. Do not expose in production.
      </div>

      {error && <ErrorState message={error} onRetry={fetchData} className="mb-6" />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-500" aria-hidden="true" />
                Cache Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Flush all Redis cache entries. This will cause the next API requests to fetch fresh data from external sources.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearCache}
                loading={clearingCache}
                className="w-full"
                aria-label="Clear all Redis cache"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                Clear All Cache
              </Button>
            </CardContent>
          </Card>

          {/* Metrics summary */}
          {(loading || metrics) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" aria-hidden="true" />
                  Metrics (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}
                  </div>
                ) : metrics ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">Period: {metrics.period}</p>
                    {Object.entries(metrics.metrics ?? {}).slice(0, 8).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-semibold tabular-nums">
                          {typeof value === 'number' ? value.toLocaleString() : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Error logs */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" aria-hidden="true" />
                  Recent Error Logs
                </CardTitle>
                {logs.length > 0 && (
                  <Badge variant="muted" className="text-xs">{logs.length} entries</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 rounded-full bg-emerald-500/10 mb-2">
                    <Shield className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium">No error logs</p>
                  <p className="text-xs text-muted-foreground">System is running cleanly.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto" role="list" aria-label="Error logs">
                  {logs.map((log, i) => {
                    const l = log
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="p-3 rounded-lg border border-border bg-muted/30 font-mono text-xs"
                        role="listitem"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Badge variant="destructive" className="text-[10px] shrink-0">ERROR</Badge>
                          {l.timestamp && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                              {formatRelativeTime(String(l.timestamp))}
                            </span>
                          )}
                        </div>
                        {l.message && (
                          <p className="text-foreground/80 break-all">{String(l.message)}</p>
                        )}
                        {l.requestId && (
                          <p className="text-muted-foreground mt-1">ID: {String(l.requestId)}</p>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
