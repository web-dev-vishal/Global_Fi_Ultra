import React from 'react'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { CryptoData } from '@/types'

function fmtUSD(v: number) {
  if (v >= 1000)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(v)
}

// Per-coin accent colours (Step 6 — Crypto Coin Rows)
const COIN_STYLES: Record<string, { bg: string; text: string }> = {
  BTC:  { bg: 'bg-amber-500/20',  text: 'text-amber-400'  },
  ETH:  { bg: 'bg-blue-500/20',   text: 'text-blue-400'   },
  SOL:  { bg: 'bg-violet-500/20', text: 'text-violet-400' },
  BNB:  { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  XRP:  { bg: 'bg-cyan-500/20',   text: 'text-cyan-400'   },
  ADA:  { bg: 'bg-teal-500/20',   text: 'text-teal-400'   },
  DOGE: { bg: 'bg-amber-500/20',  text: 'text-amber-300'  },
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
    /* Level 2 card */
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-1)]">Crypto Markets</h3>
        <span className="text-xs text-[var(--text-3)] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">24h</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {loading ? (
          <div className="px-5 py-1">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : cryptos.slice(0, 6).map(c => {
          const pos = c.price_change_percentage_24h >= 0
          const sym = c.symbol.toUpperCase()
          const coinStyle = COIN_STYLES[sym] ?? { bg: 'bg-slate-500/20', text: 'text-slate-400' }

          return (
            <div
              key={c.id}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Coin dot with per-symbol colour */}
                <span className={cn('w-2 h-2 rounded-full shrink-0', coinStyle.bg, coinStyle.text.replace('text-', 'bg-').replace('/20', '/80'))} aria-hidden="true" />
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-7 h-7 rounded-full" loading="lazy" />
                ) : (
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold', coinStyle.bg, coinStyle.text)}>
                    {c.symbol[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--text-1)]">{c.name}</p>
                  <p className={cn('text-xs uppercase font-semibold', coinStyle.text)}>{c.symbol}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MiniSparkline positive={pos} />
                <div className="text-right min-w-[80px]">
                  <p className="font-mono text-sm font-semibold text-[var(--text-1)] tabular-nums">
                    {fmtUSD(c.current_price)}
                  </p>
                  <span className={cn(
                    'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
                    pos
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
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
