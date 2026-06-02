import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, CheckCircle2, Trash2, Clock } from 'lucide-react'
import type { Alert } from '@/types'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

function fmtUSD(v?: number) {
  if (!v && v !== 0) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: v > 100 ? 2 : 4 }).format(v)
}
function relTime(s: string) {
  const diff = Date.now() - new Date(s).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const condColor = { above: 'text-emerald-400', below: 'text-red-400', equals: 'text-blue-400' } as const

interface AlertListProps {
  alerts: Alert[]
  loading?: boolean
  onDelete: (id: string) => void
  onToggle: (a: Alert) => void
  deletingId?: string | null
}

export function AlertList({ alerts, loading, onDelete, onToggle, deletingId }: AlertListProps) {
  if (loading) return (
    <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl px-5 py-2">
      {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
    </div>
  )

  if (alerts.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-[#131D2E] border border-slate-700/50 rounded-xl">
      <div className="p-4 rounded-2xl bg-slate-800/60 mb-4">
        <Bell className="h-8 w-8 text-slate-600" />
      </div>
      <p className="text-sm font-medium text-slate-300">No alerts here</p>
      <p className="text-xs text-slate-600 mt-1">Create an alert to get notified on price moves.</p>
    </div>
  )

  return (
    <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl overflow-hidden">
      <AnimatePresence>
        {alerts.map((a, i) => (
          <motion.div
            key={a._id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10, height: 0 }}
            transition={{ delay: i * 0.025, duration: 0.2 }}
            className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-700/40 last:border-0 hover:bg-slate-800/20 transition-colors group"
          >
            {/* Icon */}
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
              a.isTriggered ? 'bg-blue-500/10' : a.isActive ? 'bg-emerald-500/10' : 'bg-slate-700/40'
            }`}>
              {a.isTriggered
                ? <CheckCircle2 className="h-4 w-4 text-blue-400" />
                : a.isActive
                ? <Bell className="h-4 w-4 text-emerald-400" />
                : <BellOff className="h-4 w-4 text-slate-500" />
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white">{a.symbol}</span>
                <span className="text-xs text-slate-500 capitalize bg-slate-800 px-1.5 py-0.5 rounded">{a.assetType}</span>
                <span className={`text-xs font-medium ${condColor[a.condition]}`}>
                  {a.condition} {fmtUSD(a.targetPrice)}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-slate-500">
                {a.currentPrice && <span>Current: <span className="text-slate-400">{fmtUSD(a.currentPrice)}</span></span>}
                {a.isTriggered && a.triggeredAt && (
                  <span className="text-blue-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Triggered {relTime(a.triggeredAt)} @ {fmtUSD(a.triggeredPrice)}
                  </span>
                )}
                {a.notes && <span className="truncate max-w-[160px]">{a.notes}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {!a.isTriggered && (
                <Button variant="ghost" size="icon-sm" onClick={() => onToggle(a)}
                  aria-label={a.isActive ? 'Deactivate' : 'Activate'}>
                  {a.isActive ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                </Button>
              )}
              <Button variant="ghost" size="icon-sm"
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                loading={deletingId === a._id}
                onClick={() => onDelete(a._id)}
                aria-label="Delete alert">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
