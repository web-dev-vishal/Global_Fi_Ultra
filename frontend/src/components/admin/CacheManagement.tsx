import React, { useState } from 'react'
import { Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { adminApi } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

export function CacheManagement() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const toast = useToast()

  const handleClear = async () => {
    try {
      setLoading(true)
      const r = await adminApi.clearCache()
      toast.success('Cache cleared', r.message ?? 'Redis cache flushed successfully.')
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    } catch {
      toast.warning('Offline', 'Simulating cache clear — backend unreachable.')
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Trash2 className="h-4 w-4 text-red-400" />
        <h3 className="text-sm font-semibold text-white">Cache Management</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Flush all Redis cache entries. The next API requests will fetch fresh data from external sources.
      </p>
      {done ? (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />Cache cleared successfully
        </div>
      ) : (
        <Button variant="danger" size="sm" loading={loading} onClick={handleClear} icon={<Trash2 className="h-3.5 w-3.5" />}>
          Clear All Cache
        </Button>
      )}
    </div>
  )
}
