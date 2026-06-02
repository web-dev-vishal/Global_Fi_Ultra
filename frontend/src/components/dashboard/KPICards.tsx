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

export function KPICards({ stock, loading }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const pos = (stock?.changePercent ?? 0) >= 0
  const sparkPos = (MOCK_SPARKLINE[MOCK_SPARKLINE.length - 1]?.v ?? 0) > (MOCK_SPARKLINE[0]?.v ?? 0)

  const cards = [
    {
      label: stock?.symbol ?? 'Stock',
      value: fmtUSD(stock?.price),
      sub: fmtPct(stock?.changePercent),
      subColor: pos ? 'text-emerald-400' : 'text-red-400',
      icon: pos ? TrendingUp : TrendingDown,
      iconColor: pos ? 'text-emerald-400' : 'text-red-400',
      sparkline: true,
    },
    { label: 'Open',      value: fmtUSD(stock?.open),       sub: `Prev: ${fmtUSD(stock?.previousClose)}`, subColor: 'text-slate-500', icon: BarChart2, iconColor: 'text-blue-400' },
    { label: '52W High',  value: fmtUSD(stock?.week52High), sub: `Low: ${fmtUSD(stock?.week52Low)}`,      subColor: 'text-slate-500', icon: TrendingUp, iconColor: 'text-emerald-400' },
    { label: 'Volume',    value: fmtCompact(stock?.volume), sub: 'Today',                                  subColor: 'text-slate-500', icon: Activity,  iconColor: 'text-purple-400' },
    { label: 'P/E Ratio', value: stock?.pe ? fmt(stock.pe) : '—', sub: `EPS: ${stock?.eps ? fmt(stock.eps) : '—'}`, subColor: 'text-slate-500', icon: BarChart2, iconColor: 'text-amber-400' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon
        return (
          <div key={i} className="bg-[#131D2E] border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-slate-500 font-medium">{c.label}</p>
              <Icon className={cn('h-4 w-4 shrink-0', c.iconColor)} aria-hidden="true" />
            </div>
            <p className="text-xl font-bold text-white tabular-nums mb-1">{c.value}</p>
            <p className={cn('text-xs', c.subColor)}>{c.sub}</p>
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
