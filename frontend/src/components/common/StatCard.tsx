import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency, formatPercent, getPriceChangeBg } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number | undefined
  change?: number
  changeLabel?: string
  prefix?: string
  suffix?: string
  icon?: React.ReactNode
  loading?: boolean
  isCurrency?: boolean
  className?: string
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  prefix,
  suffix,
  icon,
  loading = false,
  isCurrency = false,
  className,
  onClick,
}: StatCardProps) {
  const displayValue =
    value === undefined || value === null
      ? '—'
      : isCurrency && typeof value === 'number'
      ? formatCurrency(value)
      : `${prefix ?? ''}${value}${suffix ?? ''}`

  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.15 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden',
          onClick && 'cursor-pointer hover:border-primary/50 transition-colors',
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      >
        <CardContent className="p-5">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                {icon && (
                  <div className="text-muted-foreground/60" aria-hidden="true">
                    {icon}
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold tracking-tight tabular-nums" aria-label={`${title}: ${displayValue}`}>
                {displayValue}
              </p>
              {change !== undefined && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full',
                      getPriceChangeBg(change)
                    )}
                    aria-label={`Change: ${formatPercent(change)}`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" aria-hidden="true" />
                    ) : isNegative ? (
                      <TrendingDown className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <Minus className="h-3 w-3" aria-hidden="true" />
                    )}
                    {formatPercent(change)}
                  </span>
                  {changeLabel && (
                    <span className="text-xs text-muted-foreground">{changeLabel}</span>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
