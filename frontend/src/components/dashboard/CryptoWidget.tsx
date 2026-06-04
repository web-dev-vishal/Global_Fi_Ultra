import React from 'react'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { CryptoData } from '@/types'

/* ═══════════════════════════════════════════════════════════════════════════
   CryptoWidget — Premium coin price list
   Clean rows, per-coin color accents, inline sparklines
═══════════════════════════════════════════════════════════════════════════ */

function fmtUSD(v: number) {
  if (v >= 1000)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(v)
}

/* Per-coin accent styles */
const COIN_COLORS: Record<string, { avatar: string; text: string }> = {
  BTC:  { avatar: 'bg-[rgba(251,191,36,0.15)] text-[#FBBF24]',  text: 'text-[#FBBF24]' },
  ETH:  { avatar: 'bg-[rgba(96,165,250,0.15)] text-[#60A5FA]',  text: 'text-[#60A5FA]' },
  SOL:  { avatar: 'bg-[rgba(167,139,250,0.15)] text-[#A78BFA]', text: 'text-[#A78BFA]' },
  BNB:  { avatar: 'bg-[rgba(253,224,71,0.15)] text-[#FDE047]',  text: 'text-[#FDE047]' },
  XRP:  { avatar: 'bg-[rgba(34,211,238,0.15)] text-[#22D3EE]',  text: 'text-[#22D3EE]' },
  ADA:  { avatar: 'bg-[rgba(52,211,153,0.15)] text-[#34D399]',  text: 'text-[#34D399]' },
  DOGE: { avatar: 'bg-[rgba(251,146,60,0.15)] text-[#FB923C]',  text: 'text-[#FB923C]' },
  AVAX: { avatar: 'bg-[rgba(248,113,113,0.15)] text-[#F87171]', text: 'text-[#F87171]' },
  DOT:  { avatar: 'bg-[rgba(232,121,249,0.15)] text-[#E879F9]', text: 'text-[#E879F9]' },
}

/* Mini SVG sparkline */
function MiniSparkline({ positive }: { positive: boolean }) {
  const pts = Array.from({ length: 9 }, (_, i) => ({
    x: 1 + (i / 8) * 44,
    y: 8 + Math.sin(i * (positive ? 0.85 : -0.85) + (positive ? 0.2 : Math.PI)) * 5,
  }))
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const color = positive ? 'var(--success-bright)' : 'var(--danger-bright)'

  return (
    <svg width="46" height="18" viewBox="0 0 46 18" fill="none" aria-hidden="true" className="shrink-0">
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  )
}

interface CryptoWidgetProps { cryptos?: CryptoData[]; loading?: boolean }

export function CryptoWidget({ cryptos = [], loading }: CryptoWidgetProps) {
  return (
    <div
      className="rounded-xl bg-[var(--bg-2)] border border-[var(--border-2)] overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-1)]">
        <p className="text-[13px] font-semibold text-[var(--text-1)]">Crypto Markets</p>
        <span className="text-[10px] font-medium text-[var(--text-3)] bg-[var(--bg-3)] border border-[var(--border-2)] px-2 py-1 rounded-full">
          24h
        </span>
      </div>

      {/* Coin list */}
      <div>
        {loading ? (
          <div className="px-5 py-1">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : (
          cryptos.slice(0, 6).map((c, idx) => {
            const pos     = c.price_change_percentage_24h >= 0
            const sym     = c.symbol.toUpperCase()
            const colors  = COIN_COLORS[sym] ?? { avatar: 'bg-[var(--bg-4)] text-[var(--text-2)]', text: 'text-[var(--text-2)]' }
            const isLast  = idx === Math.min(cryptos.length, 6) - 1

            return (
              <div
                key={c.id}
                className={cn(
                  'flex items-center justify-between px-5 py-3',
                  'hover:bg-[var(--bg-3)] transition-colors duration-100 cursor-pointer',
                  !isLast && 'border-b border-[var(--border-1)]'
                )}
              >
                {/* Left — avatar + name */}
                <div className="flex items-center gap-3 min-w-0">
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="w-7 h-7 rounded-full shrink-0" loading="lazy" />
                  ) : (
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
                      colors.avatar
                    )}>
                      {sym[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text-1)] leading-tight truncate">{c.name}</p>
                    <p className={cn('text-[10px] font-semibold uppercase leading-tight', colors.text)}>{sym}</p>
                  </div>
                </div>

                {/* Right — sparkline + price + % */}
                <div className="flex items-center gap-3 shrink-0">
                  <MiniSparkline positive={pos} />
                  <div className="text-right min-w-[88px]">
                    <p className="num text-[13px] font-semibold text-[var(--text-1)] leading-tight">
                      {fmtUSD(c.current_price)}
                    </p>
                    <span className={cn(
                      'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold num leading-none mt-0.5',
                      pos
                        ? 'bg-[var(--success-subtle)] text-[var(--success-bright)]'
                        : 'bg-[var(--danger-subtle)]  text-[var(--danger-bright)]'
                    )}>
                      {pos ? '+' : ''}{c.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
