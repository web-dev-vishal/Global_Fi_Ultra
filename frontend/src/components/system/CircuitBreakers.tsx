import React from 'react'
import { motion } from 'framer-motion'
import type { CircuitBreakerStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'

type CBState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'
const cbBadge = (s: string): 'green' | 'red' | 'amber' =>
  s === 'CLOSED' ? 'green' : s === 'OPEN' ? 'red' : 'amber'
const cbDot = (s: string) =>
  s === 'CLOSED' ? 'bg-emerald-500' : s === 'OPEN' ? 'bg-red-500' : 'bg-amber-500'

export function CircuitBreakers({ cbs, loading }: { cbs: CircuitBreakerStatus[]; loading?: boolean }) {
  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {[...Array(6)].map((_, i) => <SkeletonCard key={i} rows={2} />)}
    </div>
  )
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cbs.map((cb, i) => (
        <motion.div key={cb.service} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-[#131D2E] border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${cbDot(cb.state)}`} />
              <span className="text-xs font-semibold text-white capitalize">{cb.service.replace(/_/g, ' ')}</span>
            </div>
            <Badge variant={cbBadge(cb.state)}>{cb.state}</Badge>
          </div>
          {cb.failures > 0 && (
            <p className="text-xs text-slate-500">{cb.failures} failure{cb.failures !== 1 ? 's' : ''}</p>
          )}
        </motion.div>
      ))}
    </div>
  )
}
