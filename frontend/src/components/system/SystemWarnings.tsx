import React from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useSharedWebSocket } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'

export function SystemWarnings() {
  const { systemWarnings, clearWarnings } = useSharedWebSocket()

  return (
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[var(--border)]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          <h3 className="text-sm font-semibold text-[var(--text-1)]">System Warnings</h3>
          {systemWarnings.length > 0 && (
            <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-medium">
              {systemWarnings.length}
            </span>
          )}
        </div>
        {systemWarnings.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearWarnings}>Clear all</Button>
        )}
      </div>

      <div className="p-4">
        {systemWarnings.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 py-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>No active warnings — system running cleanly</span>
          </div>
        ) : (
          <div className="space-y-2">
            {systemWarnings.map(w => (
              /* Warning banner per spec */
              <div key={w.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{w.service}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">{w.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
