import React from 'react'
import { TrendingUp, TrendingDown, Activity, BarChart2, DollarSign } from 'lucide-react'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Sparkline } from '@/components/ui/Sparkline'
import { cn } from '@/lib/utils'
import type { StockData } from '@/types'
import {
  MOCK_SPARKLINE,
  MOCK_SPARKLINE_OPEN,
  MOCK_SPARKLINE_52W,
  MOCK_SPARKLINE_VOLUME,
  MOCK_SPARKLINE_PE,
} from '@/data/mockData'

/* ── Formatters ── */
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

/* Return true when the last point > first point */
function isPositive(data: { t: number; v: number }[]) {
  return (data[data.length - 1]?.v ?? 0) > (data[0]?.v ?? 0)
}

interface KPICardsProps { stock?: StockData; loading?: boolean }

/* ── Per-card accent + sparkline config ── */
const ACCENTS = [
  {
    icon: DollarSign,
    accent: 'var(--accent)',
    accentSubtle: 'var(--accent-subtle)',
    accentBright: 'var(--accent-bright)',
  },
  {
    icon: BarChart2,
    accent: 'var(--text-3)',
    accentSubtle: 'var(--bg-4)',
    accentBright: 'var(--text-2)',
  },
  {
    icon: TrendingUp,
    accent: 'var(--success)',
    accentSubtle: 'var(--success-subtle)',
    accentBright: 'var(--success-bright)',
  },
  {
    icon: Activity,
    accent: 'var(--warning)',
    accentSubtle: 'var(--warning-subtle)',
    accentBright: 'var(--warning-bright)',
  },
  {
    icon: BarChart2,
    accent: 'var(--ai)',
    accentSubtle: 'var(--ai-subtle)',
    accentBright: 'var(--ai-bright)',
  },
]

/* One sparkline dataset per card — deterministic, no random on re-render */
const SPARKLINES = [
  MOCK_SPARKLINE,
  MOCK_SPARKLINE_OPEN,
  MOCK_SPARKLINE_52W,
  MOCK_SPARKLINE_VOLUME,
  MOCK_SPARKLINE_PE,
]

export function KPICards({ stock, loading }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const pos = (stock?.changePercent ?? 0) >= 0

  const cards = [
    {
      label:  stock?.symbol ?? 'Stock',
      value:  fmtUSD(stock?.price),
      sub:    fmtPct(stock?.changePercent),
      isPrice: true,
      subPos: pos,
    },
    {
      label:  'Open',
      value:  fmtUSD(stock?.open),
      sub:    `Prev: ${fmtUSD(stock?.previousClose)}`,
      isPrice: false,
      subPos: null,
    },
    {
      label:  '52W High',
      value:  fmtUSD(stock?.week52High),
      sub:    `Low: ${fmtUSD(stock?.week52Low)}`,
      isPrice: false,
      subPos: null,
    },
    {
      label:  'Volume',
      value:  fmtCompact(stock?.volume),
      sub:    'Today',
      isPrice: false,
      subPos: null,
    },
    {
      label:  'P/E Ratio',
      value:  stock?.pe ? fmt(stock.pe) : '—',
      sub:    `EPS: ${stock?.eps ? fmt(stock.eps) : '—'}`,
      isPrice: false,
      subPos: null,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c, i) => {
        const acc        = ACCENTS[i]
        const Icon       = acc.icon
        const sparkData  = SPARKLINES[i]
        const sparkPos   = isPositive(sparkData)

        return (
          <div
            key={i}
            className={cn(
              'group relative rounded-xl p-4 overflow-hidden',
              'bg-[var(--bg-2)] border border-[var(--border-2)]',
              'hover:border-[var(--border-3)] hover:bg-[var(--bg-3)]',
              'transition-all duration-150',
            )}
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {/* Top accent stripe */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
              style={{ background: acc.accent, opacity: 0.7 }}
            />

            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-medium text-[var(--text-3)] tracking-wide uppercase leading-none">
                {c.label}
              </p>
              <div
                className="flex items-center justify-center w-6 h-6 rounded-lg"
                style={{ background: acc.accentSubtle }}
              >
                <Icon
                  className="h-3.5 w-3.5"
                  style={{ color: acc.accentBright }}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Primary value */}
            <p className="num text-[19px] font-bold text-[var(--text-0)] tracking-tight leading-none mb-2">
              {c.value}
            </p>

            {/* Sub-value / delta badge */}
            {c.isPrice && c.subPos !== null ? (
              <span className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold leading-none',
                c.subPos
                  ? 'bg-[var(--success-subtle)] text-[var(--success-bright)]'
                  : 'bg-[var(--danger-subtle)]  text-[var(--danger-bright)]'
              )}>
                {c.subPos
                  ? <TrendingUp   className="h-2.5 w-2.5" />
                  : <TrendingDown className="h-2.5 w-2.5" />
                }
                {c.sub}
              </span>
            ) : (
              <p className="text-[11px] text-[var(--text-3)] leading-none">{c.sub}</p>
            )}

            {/* Sparkline — every card gets one */}
            <div className="mt-3 -mx-0.5">
              <Sparkline data={sparkData} positive={sparkPos} height={32} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
