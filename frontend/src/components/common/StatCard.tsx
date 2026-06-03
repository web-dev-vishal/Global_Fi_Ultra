import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'

interface StatCardProps {
  title: string
  value?: string | number
  change?: number
  changeLabel?: string
  prefix?: string
  suffix?: string
  icon?: React.ReactNode
  loading?: boolean
  isCurrency?: boolean
  className?: string
  onClick?: () => void
  accent?: 'default' | 'green' | 'red' | 'purple'
}

export function StatCard({
  title, value, change, changeLabel, prefix, suffix,
  icon, loading = false, isCurrency = false, className, onClick, accent = 'default',
}: StatCardProps) {
  const displayValue =
    value === undefined || value === null ? '—'
    : isCurrency && typeof value === 'number' ? formatCurrency(value)
    : `${prefix ?? ''}${value}${suffix ?? ''}`

  const isPos = change !== undefined && change > 0
  const isNeg = change !== undefined && change < 0

  return (
    <motion.div
      whileHover={onClick ? { y: -1 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.15 }}
    >
      {/* Level 2 card */}
      <div
        className={cn(
          'relative rounded-xl border bg-white dark:bg-[#131D2E] overflow-hidden',
          accent === 'green'  ? 'border-emerald-500/20' :
          accent === 'red'    ? 'border-red-500/20' :
          accent === 'purple' ? 'border-purple-500/20' :
          'border-slate-200/80 dark:border-[var(--border)]',
          onClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-[var(--bg-raised)] transition-colors',
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      >
        <div className="p-4">
          {loading ? (
            <div className="space-y-2.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-2.5">
                <p className="text-xs font-medium text-[var(--text-2)] uppercase tracking-wider">{title}</p>
                {icon && (
                  <div className="text-[var(--text-3)] -mt-0.5 opacity-50" aria-hidden="true">{icon}</div>
                )}
              </div>

              {/* Price/number — font-mono per spec */}
              <p className="text-2xl font-bold font-mono tracking-tight tabular-nums text-[var(--text-1)]"
                aria-label={`${title}: ${displayValue}`}>
                {displayValue}
              </p>

              {change !== undefined && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                    isPos && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                    isNeg && 'bg-red-500/10 text-red-700 dark:text-red-400',
                    !isPos && !isNeg && 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  )}>
                    {isPos
                      ? <TrendingUp  className="h-3 w-3" />
                      : isNeg
                      ? <TrendingDown className="h-3 w-3" />
                      : <Minus className="h-3 w-3" />
                    }
                    {formatPercent(change)}
                  </span>
                  {changeLabel && <span className="text-xs text-[var(--text-3)]">{changeLabel}</span>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
