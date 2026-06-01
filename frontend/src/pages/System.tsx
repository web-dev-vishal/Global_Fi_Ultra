import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Wifi, WifiOff, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, Zap, Clock, Server
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { useSharedWebSocket } from '@/components/layout/AppLayout'
import { healthApi, statusApi } from '@/lib/api'
import type { HealthStatus, ReadinessStatus, CircuitBreakerStatus } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

export function System() {
  const { toast } = useApp()
  const { connected, socketId, systemWarnings, circuitBreakerChanges, clearWarnings } = useSharedWebSocket()
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [readiness, setReadiness] = useState<ReadinessStatus | null>(null)
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreakerStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [h, r, cb] = await Promise.allSettled([
        healthApi.check(),
        healthApi.readiness(),
        statusApi.circuitBreakers(),
      ])
      if (h.status === 'fulfilled') setHealth(h.value)
      if (r.status === 'fulfilled') setReadiness(r.value)
      if (cb.status === 'fulfilled') setCircuitBreakers(cb.value.circuitBreakers ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system status')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'ready': case 'connected': return 'text-emerald-500'
      case 'degraded': return 'text-yellow-500'
      default: return 'text-red-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': case 'ready': case 'connected': return 'success'
      case 'degraded': return 'warning'
      default: return 'destructive'
    }
  }

  const getCBColor = (state: string) => {
    switch (state) {
      case 'CLOSED': return 'success'
      case 'HALF_OPEN': return 'warning'
      case 'OPEN': return 'destructive'
      default: return 'muted'
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="System Status"
        description="Real-time health monitoring and circuit breaker status"
        actions={
          <Button variant="outline" size="sm" onClick={fetchStatus} loading={loading} aria-label="Refresh system status">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={fetchStatus} className="mb-6" />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Health + Readiness */}
        <div className="space-y-4">
          {/* Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                Health Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : health ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold capitalize ${getStatusColor(health.status)}`}>
                      {health.status}
                    </span>
                    <Badge variant={getStatusBadge(health.status) as 'success' | 'warning' | 'destructive'}>
                      {health.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(health.timestamp)}
                  </p>
                  {health.features && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">AI Features:</span>
                      <Badge variant={health.features.ai ? 'success' : 'muted'} className="text-[10px]">
                        {health.features.ai ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unable to reach health endpoint</p>
              )}
            </CardContent>
          </Card>

          {/* Readiness */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-500" aria-hidden="true" />
                Readiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}
                </div>
              ) : readiness ? (
                <div className="space-y-2">
                  {Object.entries(readiness.checks).map(([key, value]) => {
                    const status = typeof value === 'string' ? value : (value as { enabled?: boolean })?.enabled ? 'enabled' : 'disabled'
                    return (
                      <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium capitalize">{key}</span>
                        <Badge variant={getCBColor(status.toUpperCase()) as 'success' | 'warning' | 'destructive' | 'muted'} className="text-[10px]">
                          {status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Readiness data unavailable</p>
              )}
            </CardContent>
          </Card>

          {/* WebSocket */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                {connected ? (
                  <Wifi className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" aria-hidden="true" />
                )}
                WebSocket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={connected ? 'success' : 'destructive'}>
                  {connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              {socketId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Socket ID</span>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono truncate max-w-[120px]">
                    {socketId}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Circuit Breakers */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                Circuit Breakers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              ) : circuitBreakers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No circuit breaker data available</p>
              ) : (
                <div className="space-y-2">
                  {circuitBreakers.map((cb) => (
                    <motion.div
                      key={cb.service}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          cb.state === 'CLOSED' ? 'bg-emerald-500' :
                          cb.state === 'HALF_OPEN' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} aria-hidden="true" />
                        <div>
                          <p className="text-sm font-medium capitalize">{cb.service.replace(/_/g, ' ')}</p>
                          {cb.failures > 0 && (
                            <p className="text-xs text-muted-foreground">{cb.failures} failures</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={getCBColor(cb.state) as 'success' | 'warning' | 'destructive' | 'muted'}>
                        {cb.state}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Warnings */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                  System Warnings
                  {systemWarnings.length > 0 && (
                    <Badge variant="warning" className="text-[10px]">{systemWarnings.length}</Badge>
                  )}
                </CardTitle>
                {systemWarnings.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearWarnings} aria-label="Clear all warnings">
                    Clear all
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {systemWarnings.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  No active warnings
                </div>
              ) : (
                <div className="space-y-2" role="list" aria-label="System warnings">
                  {systemWarnings.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                      role="listitem"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300">{w.service}</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">{w.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatRelativeTime(w.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CB Changes */}
          {circuitBreakerChanges.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" />
                  Recent CB Changes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2" role="list" aria-label="Circuit breaker state changes">
                  {circuitBreakerChanges.map((change) => (
                    <div
                      key={change.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
                      role="listitem"
                    >
                      <div>
                        <p className="text-xs font-medium capitalize">{change.service.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-muted-foreground">{formatRelativeTime(change.timestamp)}</p>
                      </div>
                      <Badge variant={getCBColor(change.state) as 'success' | 'warning' | 'destructive' | 'muted'} className="text-[10px]">
                        {change.state}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
