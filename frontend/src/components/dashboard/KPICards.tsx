import React from 'react'
import { TrendingUp, TrendingDown, Activity, BarChart2, DollarSign } from 'lucide-react'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Sparkline } from '@/components/ui/Sparkline'
import { cn } from '@/lib/utils'
import type { StockData } from '@/types'
import { MOCK_SPARKLINE } from '@/data/mockData'

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

interface KPICardsProps { stock?: StockData; loading?: boolean }

/* ── Card accent configs ── */
const ACCENTS = [
  {
    label: 'Price',
    icon: DollarSign,
    accent: 'var(--accent)',
    accentSubtle: 'var(--accent-subtle)',
    accentBright: 'var(--accent-bright)',
    glow: '0 0 20px rgba(37,99,235,0.12)',
  },
  {
    label: 'Open',
    icon: BarChart2,
    accent: 'var(--text-3)',
    accentSubtle: 'var(--bg-4)',
    accentBright: 'var(--text-2)',
    glow: 'none',
  },
  {
    label: '52W High',
    icon: TrendingUp,
    accent: 'var(--success)',
    accentSubtle: 'var(--success-subtle)',
    accentBright: 'var(--success-bright)',
    glow: '0 0 20px rgba(5,150,105,0.10)',
  },
  {
    label: 'Volume',
    icon: Activity,
    accent: 'var(--warning)',
    accentSubtle: 'var(--warning-subtle)',
    accentBright: 'var(--warning-bright)',
    glow: 'none',
  },
  {
    label: 'P/E Ratio',
    icon: BarChart2,
    accent: 'var(--ai)',
    accentSubtle: 'var(--ai-subtle)',
    accentBright: 'var(--ai-bright)',
    glow: 'none',
  },
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
      label:   stock?.symbol ?? 'Stock',
      value:   fmtUSD(stock?.price),
      sub:     fmtPct(stock?.changePercent),
      subPos:  pos,
      isPrice: true,
      sparkline: true,
    },
    {
      label:   'Open',
      value:   fmtUSD(stock?.open),
      sub:     `Prev: ${fmtUSD(stock?.previousClose)}`,
      subPos:  null,
      isPrice: false,
      sparkline: false,
    },
    {
      label:   '52W High',
      value:   fmtUSD(stock?.week52High),
      sub:     `Low: ${fmtUSD(stock?.week52Low)}`,
      subPos:  null,
      isPrice: false,
      sparkline: false,
    },
    {
      label:   'Volume',
      value:   fmtCompact(stock?.volume),
      sub:     'Today',
      subPos:  null,
      isPrice: false,
      sparkline: false,
    },
    {
      label:   'P/E Ratio',
      value:   stock?.pe ? fmt(stock.pe) : '—',
      sub:     `EPS: ${stock?.eps ? fmt(stock.eps) : '—'}`,
      subPos:  null,
      isPrice: false,
      sparkline: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c, i) => {
        const acc = ACCENTS[i]
        const Icon = acc.icon

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
            <p className={cn(
              'num text-[19px] font-bold text-[var(--text-0)] tracking-tight leading-none mb-2',
            )}>
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
                  ? <TrendingUp  className="h-2.5 w-2.5" />
                  : <TrendingDown className="h-2.5 w-2.5" />
                }
                {c.sub}
              </span>
            ) : (
              <p className="text-[11px] text-[var(--text-3)] leading-none">{c.sub}</p>
            )}

            {/* Sparkline */}
            {c.sparkline && (
              <div className="mt-3 -mx-0.5">
                <Sparkline data={MOCK_SPARKLINE} positive={sparkPos} height={32} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
