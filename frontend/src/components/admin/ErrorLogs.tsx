import React, { useState, useEffect } from 'react'
import { FileText, CheckCircle2, Clock } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'

function relTime(s: string) {
  const diff = Date.now() - new Date(s).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function ErrorLogs() {
  const [logs, setLogs]       = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await adminApi.getLogs(20)
        setLogs((r.logs ?? []) as Record<string, unknown>[])
      } catch { setLogs([]) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[var(--border)]">
        <div className="flex items-center gap-2">
          {/* Purple for AI/special features per spec */}
          <FileText className="h-4 w-4 text-purple-700 dark:text-purple-400" />
          <h3 className="text-sm font-semibold text-[var(--text-1)]">Recent Error Logs</h3>
        </div>
        {!loading && <Badge variant="slate">{logs.length} entries</Badge>}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 py-4">
            <CheckCircle2 className="h-4 w-4" />No error logs — system is running cleanly
          </div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {logs.map((log, i) => {
              const ts  = log.timestamp as string | undefined
              const msg = log.message   as string | undefined
              const rid = log.requestId as string | undefined
              return (
                /* Error log entry — red border per spec */
                <div key={i} className="p-3 rounded-xl border border-red-500/15 bg-red-500/5 font-mono text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="red">ERROR</Badge>
                    {ts && (
                      <span className="flex items-center gap-1 text-[var(--text-3)]">
                        <Clock className="h-2.5 w-2.5" />{relTime(ts)}
                      </span>
                    )}
                  </div>
                  {msg && <p className="text-[var(--text-2)] break-all leading-relaxed">{msg}</p>}
                  {rid && <p className="text-[var(--text-3)] mt-1">ID: {rid}</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
