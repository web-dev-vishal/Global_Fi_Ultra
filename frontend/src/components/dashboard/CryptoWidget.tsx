import React from 'react'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { CryptoData } from '@/types'

function fmtUSD(v: number) {
  if (v >= 1000)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(v)
}

const COIN_DOTS: Record<string, string> = {
  BTC:  'bg-amber-400',
  ETH:  'bg-blue-400',
  SOL:  'bg-purple-400',
  BNB:  'bg-amber-400',
  XRP:  'bg-blue-400',
  ADA:  'bg-teal-400',
  DOGE: 'bg-amber-300',
}

function MiniSparkline({ positive }: { positive: boolean }) {
  const pts = Array.from({ length: 8 }, (_, i) => ({
    x: (i / 7) * 38 + 1,
    y: 8 + Math.sin(i * (positive ? 0.9 : -0.9) + (positive ? 0 : Math.PI)) * 5,
  }))
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const color = positive ? '#34d399' : '#f87171'
  return (
    <svg width="40" height="16" viewBox="0 0 40 16" fill="none" aria-hidden="true">
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface CryptoWidgetProps {
  cryptos?: CryptoData[]
  loading?: boolean
}

export function CryptoWidget({ cryptos = [], loading }: CryptoWidgetProps) {
  return (
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Crypto Markets</h3>
        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">24h</span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
        {loading ? (
          <div className="px-5 py-1">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : cryptos.slice(0, 6).map(c => {
          const pos = c.price_change_percentage_24h >= 0
          const dotClass = COIN_DOTS[c.symbol.toUpperCase()] ?? 'bg-slate-400'
          return (
            <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className={cn('w-2 h-2 rounded-full shrink-0', dotClass)} aria-hidden="true" />
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-7 h-7 rounded-full" loading="lazy" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                    {c.symbol[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-slate-500 uppercase">{c.symbol}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MiniSparkline positive={pos} />
                <div className="text-right min-w-[80px]">
                  <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                    {fmtUSD(c.current_price)}
                  </p>
                  <span className={cn(
                    'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
                    pos ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  )}>
                    {pos ? '+' : ''}{c.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
