import React from 'react'
import { ShieldAlert } from 'lucide-react'

export function SecurityWarning() {
  return (
    /* Warning banner per spec */
    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
      <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
      <p className="text-sm text-amber-700 dark:text-amber-300">
        Admin endpoints are not yet protected by authentication. Do not expose in production.
      </p>
    </div>
  )
}
