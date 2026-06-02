import React from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { FinancialDataResponse } from '@/types'
import { Badge } from '@/components/ui/Badge'

function fmtUSD(v?: number) {
  if (!v) return '—'
  if (v > 1000) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(v)
}
function fmtCompact(v?: number) {
  if (!v) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
}

export function MarketResultsTable({ data }: { data: FinancialDataResponse }) {
  const stock = data.data?.stock
  const cryptos = data.data?.crypto ?? []
  const forex = data.data?.forex
  const meta = data.metadata

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={data.status === 'success' ? 'green' : data.status === 'partial' ? 'amber' : 'red'}>
          {data.status}
        </Badge>
        {meta?.totalDuration !== undefined && <Badge variant="slate">{meta.totalDuration}ms</Badge>}
        {meta?.apiCallsMade !== undefined && <Badge variant="slate">{meta.apiCallsMade} API calls</Badge>}
        {meta?.cacheHits !== undefined && <Badge variant="blue">{meta.cacheHits} cache hits</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stock */}
        {stock && (
          <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">{stock.symbol}</h3>
                {stock.name && <p className="text-xs text-slate-500">{stock.name}</p>}
              </div>
              {stock.exchange && <Badge variant="blue">{stock.exchange}</Badge>}
            </div>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl font-black text-white tabular-nums">{fmtUSD(stock.price)}</span>
              {stock.changePercent !== undefined && (
                <span className={`flex items-center gap-0.5 text-sm font-semibold mb-1 ${(stock.changePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(stock.changePercent ?? 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {stock.changePercent?.toFixed(2)}%
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Open',       v: fmtUSD(stock.open) },
                { label: 'High',       v: fmtUSD(stock.high) },
                { label: 'Low',        v: fmtUSD(stock.low) },
                { label: 'Prev Close', v: fmtUSD(stock.previousClose) },
                { label: 'Volume',     v: fmtCompact(stock.volume) },
                { label: 'P/E Ratio',  v: stock.pe?.toFixed(2) ?? '—' },
              ].map(s => (
                <div key={s.label} className="bg-slate-800/40 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{s.label}</p>
                  <p className="text-sm font-semibold text-white tabular-nums mt-0.5">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crypto table */}
        {cryptos.length > 0 && (
          <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-700/50">
              <h3 className="text-sm font-semibold text-white">Crypto Prices</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/40">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-500">Asset</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Price</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">24h</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-slate-500 hidden sm:table-cell">Mkt Cap</th>
                </tr>
              </thead>
              <tbody>
                {cryptos.map((c: any) => {
                  const pos = (c.price_change_percentage_24h ?? 0) >= 0
                  return (
                    <tr key={c.id ?? c.symbol} className="border-b border-slate-700/30 hover:bg-slate-800/20">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {c.image && <img src={c.image} alt={c.name} className="w-5 h-5 rounded-full" loading="lazy" />}
                          <div>
                            <p className="font-medium text-white">{c.name}</p>
                            <p className="text-xs text-slate-500 uppercase">{c.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-white tabular-nums">{fmtUSD(c.current_price)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(c.price_change_percentage_24h ?? 0).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-slate-400 text-xs hidden sm:table-cell tabular-nums">{fmtCompact(c.market_cap)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Forex */}
      {forex && (
        <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-white">Forex Rates</h3>
            <Badge variant="slate">Base: {forex.base}</Badge>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-2">
            {Object.entries(forex.rates ?? {}).slice(0, 20).map(([cur, rate]) => (
              <div key={cur} className="flex flex-col items-center p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
                <span className="text-xs font-bold text-white">{cur}</span>
                <span className="text-[10px] text-slate-500 tabular-nums mt-0.5">{Number(rate).toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
