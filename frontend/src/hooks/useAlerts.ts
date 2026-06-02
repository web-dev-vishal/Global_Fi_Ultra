import { useState, useEffect, useCallback } from 'react'
import { alertsApi } from '@/lib/api'
import type { Alert } from '@/types'
import { MOCK_ALERTS } from '@/data/mockData'

export function useAlerts() {
  const [alerts, setAlerts]       = useState<Alert[]>([])
  const [loading, setLoading]     = useState(true)
  const [usingMock, setUsingMock] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))
    try {
      const r = await alertsApi.list({ limit: 100 })
      setAlerts(r.alerts ?? [])
      setUsingMock(false)
    } catch {
      setAlerts(MOCK_ALERTS as unknown as Alert[])
      setUsingMock(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const deleteAlert = useCallback(async (id: string) => {
    try {
      await alertsApi.delete(id)
      setAlerts(p => p.filter(a => a._id !== id))
    } catch {
      setAlerts(p => p.filter(a => a._id !== id)) // optimistic for mock
    }
  }, [])

  const toggleAlert = useCallback(async (alert: Alert) => {
    try {
      const updated = alert.isActive
        ? await alertsApi.deactivate(alert._id)
        : await alertsApi.activate(alert._id)
      setAlerts(p => p.map(a => a._id === updated._id ? updated : a))
    } catch {
      setAlerts(p => p.map(a => a._id === alert._id ? { ...a, isActive: !a.isActive } : a))
    }
  }, [])

  const addAlert = useCallback((alert: Alert) => {
    setAlerts(p => [alert, ...p])
  }, [])

  return { alerts, loading, usingMock, reload: load, deleteAlert, toggleAlert, addAlert }
}
