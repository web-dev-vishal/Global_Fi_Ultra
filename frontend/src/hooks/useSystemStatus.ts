import { useState, useEffect, useCallback } from 'react'
import { healthApi, statusApi } from '@/lib/api'
import type { HealthStatus, ReadinessStatus, CircuitBreakerStatus } from '@/types'
import { MOCK_HEALTH, MOCK_CIRCUIT_BREAKERS } from '@/data/mockData'

export function useSystemStatus() {
  const [health, setHealth]     = useState<HealthStatus | null>(null)
  const [ready, setReady]       = useState<ReadinessStatus | null>(null)
  const [cbs, setCbs]           = useState<CircuitBreakerStatus[]>([])
  const [loading, setLoading]   = useState(true)
  const [usingMock, setMock]    = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))
    try {
      const [h, r, cb] = await Promise.allSettled([
        healthApi.check(), healthApi.readiness(), statusApi.circuitBreakers(),
      ])
      if (h.status === 'fulfilled')  setHealth(h.value)
      if (r.status === 'fulfilled')  setReady(r.value)
      if (cb.status === 'fulfilled') setCbs(cb.value.circuitBreakers ?? [])
      setMock(false)
    } catch {
      setHealth(MOCK_HEALTH as HealthStatus)
      setCbs(MOCK_CIRCUIT_BREAKERS as CircuitBreakerStatus[])
      setMock(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [load])

  return { health, ready, cbs, loading, usingMock, reload: load }
}
