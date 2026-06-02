import React from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { SkeletonRow } from '@/components/ui/Skeleton'
import type { CryptoData } from '@/types'

function fmtUSD(v: number) {
  if (v >= 1000) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(v)
}
function fmtCompact(v: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
}

interface CryptoWidgetProps {
  cryptos?: CryptoData[]
  loading?: boolean
}

export function CryptoWidget({ cryptos = [], loading }: CryptoWidgetProps) {
  return (
    <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-white">Crypto Markets</h3>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">24h</span>
      </div>
      <div className="divide-y divide-slate-700/40">
        {loading ? (
          <div className="px-5 py-1">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : cryptos.slice(0, 6).map(c => {
          const pos = c.price_change_percentage_24h >= 0
          return (
            <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-3">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-7 h-7 rounded-full" loading="lazy" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {c.symbol[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs text-slate-500 uppercase">{c.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white tabular-nums">{fmtUSD(c.current_price)}</p>
                <div className={`flex items-center justify-end gap-0.5 text-xs font-medium tabular-nums ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(c.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
