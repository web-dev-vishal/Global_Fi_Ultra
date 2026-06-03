import React from 'react'
import { TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Sparkline } from '@/components/ui/Sparkline'
import { cn } from '@/lib/utils'
import type { StockData } from '@/types'
import { MOCK_SPARKLINE } from '@/data/mockData'

function fmt(v?: number, dec = 2) {
  if (v === undefined || v === null || isNaN(v)) return '—'
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v)
}
function fmtUSD(v?: number) {
  if (!v) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
}
function fmtPct(v?: number) {
  if (v === undefined || v === null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}
function fmtCompact(v?: number) {
  if (!v) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
}

interface KPICardsProps {
  stock?: StockData
  loading?: boolean
}

// Per-card: top border accent + icon colour
const ACCENTS = [
  { topBorder: 'border-t-blue-500',    iconColor: 'text-blue-600 dark:text-blue-400'      },
  { topBorder: 'border-t-slate-500',   iconColor: 'text-slate-600 dark:text-slate-400'    },
  { topBorder: 'border-t-emerald-500', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { topBorder: 'border-t-violet-500',  iconColor: 'text-violet-600 dark:text-violet-400'  },
  { topBorder: 'border-t-amber-500',   iconColor: 'text-amber-600 dark:text-amber-400'    },
]

export function KPICards({ stock, loading }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const pos      = (stock?.changePercent ?? 0) >= 0
  const sparkPos = (MOCK_SPARKLINE[MOCK_SPARKLINE.length - 1]?.v ?? 0) > (MOCK_SPARKLINE[0]?.v ?? 0)

  const cards = [
    {
      label: stock?.symbol ?? 'Stock',
      value: fmtUSD(stock?.price),
      sub: fmtPct(stock?.changePercent),
      subColor: pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      icon: pos ? TrendingUp : TrendingDown,
      sparkline: true,
      showDelta: true,
      deltaPos: pos,
    },
    { label: 'Open',      value: fmtUSD(stock?.open),       sub: `Prev: ${fmtUSD(stock?.previousClose)}`, subColor: 'text-[var(--text-3)]', icon: BarChart2,  sparkline: false, showDelta: false, deltaPos: false },
    { label: '52W High',  value: fmtUSD(stock?.week52High), sub: `Low: ${fmtUSD(stock?.week52Low)}`,      subColor: 'text-[var(--text-3)]', icon: TrendingUp, sparkline: false, showDelta: false, deltaPos: false },
    { label: 'Volume',    value: fmtCompact(stock?.volume), sub: 'Today',                                  subColor: 'text-[var(--text-3)]', icon: Activity,   sparkline: false, showDelta: false, deltaPos: false },
    { label: 'P/E Ratio', value: stock?.pe ? fmt(stock.pe) : '—', sub: `EPS: ${stock?.eps ? fmt(stock.eps) : '—'}`, subColor: 'text-[var(--text-3)]', icon: BarChart2, sparkline: false, showDelta: false, deltaPos: false },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c, i) => {
        const Icon   = c.icon
        const accent = ACCENTS[i]
        return (
          /* Level 2 card with top accent border */
          <div
            key={i}
            className={cn(
              'bg-white dark:bg-[#131D2E]',
              'border border-slate-200/80 dark:border-[var(--border)]',
              'border-t-2', accent.topBorder,
              'rounded-xl p-4',
              'hover:bg-slate-50 dark:hover:bg-[var(--bg-raised)] transition-colors'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-[var(--text-2)] font-medium">{c.label}</p>
              <Icon className={cn('h-4 w-4 shrink-0 opacity-50', accent.iconColor)} aria-hidden="true" />
            </div>

            <p className="text-xl font-bold text-[var(--text-1)] font-mono tabular-nums mb-1">
              {c.value}
            </p>

            {c.showDelta ? (
              <span className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
                c.deltaPos
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-700 dark:text-red-400'
              )}>
                {c.deltaPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {c.sub}
              </span>
            ) : (
              <p className={cn('text-xs', c.subColor)}>{c.sub}</p>
            )}

            {c.sparkline && (
              <div className="mt-2 -mx-1">
                <Sparkline data={MOCK_SPARKLINE} positive={sparkPos} height={36} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
