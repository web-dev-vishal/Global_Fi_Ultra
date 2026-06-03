import React from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { MOCK_ASSETS } from '@/data/mockData'

function fmtUSD(v: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    maximumFractionDigits: v > 100 ? 2 : 4,
  }).format(v)
}

export function StockTable({ loading }: { loading?: boolean }) {
  if (loading) return (
    /* Level 2 card skeleton */
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl p-5">
      <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonCard key={i} rows={2} />)}</div>
    </div>
  )

  return (
    /* Level 2 card */
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-1)]">Tracked Assets</h3>
        <span className="text-xs text-[var(--text-3)]">{MOCK_ASSETS.length} instruments</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Tracked assets">
          {/* Table header — Level 3 */}
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800/60">
              {['Asset', 'Type', 'Price', 'Exchange'].map((h, i) => (
                <th
                  key={h}
                  className={`py-2.5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wider
                    ${i === 0 ? 'text-left px-5' : i === 3 ? 'text-right px-5 hidden sm:table-cell' : 'text-right px-4'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_ASSETS.map(a => {
              const mockChange = ((Math.random() - 0.48) * 5)
              const pos = mockChange >= 0
              return (
                <tr
                  key={a._id}
                  className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-semibold text-[var(--text-1)]">{a.symbol}</p>
                      <p className="text-xs text-[var(--text-3)] truncate max-w-[120px]">{a.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border
                      ${a.type === 'stock'
                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                        : a.type === 'crypto'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                        : 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'}`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-semibold text-[var(--text-1)] font-mono tabular-nums">{fmtUSD(a.currentPrice)}</p>
                    <div className={`flex items-center justify-end gap-0.5 text-xs ${pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {pos
                        ? <ArrowUpRight className="h-3 w-3" />
                        : <ArrowDownRight className="h-3 w-3" />
                      }
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pos ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                        {Math.abs(mockChange).toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right hidden sm:table-cell">
                    <span className="text-xs text-[var(--text-3)]">{a.metadata?.exchange ?? '—'}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
