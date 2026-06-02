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

const accentMap = {
  default: 'from-primary/5 to-transparent border-primary/10',
  green:   'from-emerald-500/5 to-transparent border-emerald-500/10',
  red:     'from-red-500/5 to-transparent border-red-500/10',
  purple:  'from-purple-500/5 to-transparent border-purple-500/10',
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
      <div
        className={cn(
          'relative rounded-xl border border-border/60 bg-card overflow-hidden',
          'bg-gradient-to-br', accentMap[accent],
          onClick && 'cursor-pointer hover:border-border transition-colors',
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
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
                {icon && (
                  <div className="text-muted-foreground/40 -mt-0.5" aria-hidden="true">{icon}</div>
                )}
              </div>

              <p
                className="text-2xl font-bold tracking-tight tabular-nums text-foreground"
                aria-label={`${title}: ${displayValue}`}
              >
                {displayValue}
              </p>

              {change !== undefined && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md',
                      isPos && 'bg-emerald-500/10 text-emerald-400',
                      isNeg && 'bg-red-500/10 text-red-400',
                      !isPos && !isNeg && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isPos ? <TrendingUp className="h-3 w-3" /> : isNeg ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    {formatPercent(change)}
                  </span>
                  {changeLabel && (
                    <span className="text-xs text-muted-foreground">{changeLabel}</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
