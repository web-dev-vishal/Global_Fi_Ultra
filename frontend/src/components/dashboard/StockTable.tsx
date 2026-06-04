import React from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { MOCK_ASSETS } from '@/data/mockData'

/* ═══════════════════════════════════════════════════════════════════════════
   StockTable — Premium data table
   Clean rows, precise typography, clear hierarchy
═══════════════════════════════════════════════════════════════════════════ */

function fmtUSD(v: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: v > 100 ? 2 : 4,
  }).format(v)
}

const TYPE_BADGE: Record<string, string> = {
  stock:     'bg-[var(--accent-subtle)] text-[var(--accent-bright)] border-[rgba(37,99,235,0.2)]',
  crypto:    'bg-[var(--warning-subtle)] text-[var(--warning-bright)] border-[var(--warning-border)]',
  forex:     'bg-[var(--ai-subtle)] text-[var(--ai-bright)] border-[var(--ai-border)]',
  commodity: 'bg-[var(--gold-subtle)] text-[var(--gold-bright)] border-[rgba(180,83,9,0.2)]',
  index:     'bg-[var(--success-subtle)] text-[var(--success-bright)] border-[var(--success-border)]',
}

export function StockTable({ loading }: { loading?: boolean }) {
  if (loading) {
    return (
      <div
        className="rounded-xl bg-[var(--bg-2)] border border-[var(--border-2)]"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="px-5 py-4 border-b border-[var(--border-1)]">
          <div className="shimmer h-3.5 w-28 rounded-md" />
        </div>
        <div className="px-5 py-1">
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl bg-[var(--bg-2)] border border-[var(--border-2)] overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-1)]">
        <p className="text-[13px] font-semibold text-[var(--text-1)]">Tracked Assets</p>
        <span className="text-[11px] text-[var(--text-3)]">{MOCK_ASSETS.length} instruments</span>
      </div>

      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full" aria-label="Tracked assets">
          {/* Table header */}
          <thead>
            <tr className="border-b border-[var(--border-1)]">
              {[
                { label: 'Asset',    align: 'text-left  pl-5' },
                { label: 'Type',     align: 'text-right px-4' },
                { label: 'Price',    align: 'text-right px-4' },
                { label: 'Exchange', align: 'text-right pr-5 hidden sm:table-cell' },
              ].map(h => (
                <th
                  key={h.label}
                  className={cn(
                    'py-2.5 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest',
                    'bg-[var(--bg-1)]',
                    h.align
                  )}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {MOCK_ASSETS.map((a, idx) => {
              /* Seeded change so it doesn't re-randomize on re-render */
              const seed      = a._id.charCodeAt(0) + a._id.charCodeAt(1)
              const mockChange = ((seed % 100) / 10 - 4.8)
              const pos        = mockChange >= 0
              const isLast     = idx === MOCK_ASSETS.length - 1
              const typeBadge  = TYPE_BADGE[a.type] ?? TYPE_BADGE.stock

              return (
                <tr
                  key={a._id}
                  className={cn(
                    'hover:bg-[var(--bg-3)] transition-colors duration-100',
                    !isLast && 'border-b border-[var(--border-1)]'
                  )}
                >
                  {/* Asset name */}
                  <td className="pl-5 pr-4 py-3">
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--text-1)] leading-tight">{a.symbol}</p>
                      <p className="text-[11px] text-[var(--text-3)] truncate max-w-[140px] mt-0.5">{a.name}</p>
                    </div>
                  </td>

                  {/* Type badge */}
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      'inline-flex items-center rounded px-1.5 py-0.5',
                      'text-[10px] font-semibold border capitalize',
                      typeBadge
                    )}>
                      {a.type}
                    </span>
                  </td>

                  {/* Price + change */}
                  <td className="px-4 py-3 text-right">
                    <p className="num text-[13px] font-semibold text-[var(--text-1)] leading-tight">
                      {fmtUSD(a.currentPrice)}
                    </p>
                    <div className={cn(
                      'inline-flex items-center gap-0.5 mt-0.5',
                      'text-[10px] font-semibold num rounded px-1.5 py-0.5',
                      pos
                        ? 'bg-[var(--success-subtle)] text-[var(--success-bright)]'
                        : 'bg-[var(--danger-subtle)]  text-[var(--danger-bright)]'
                    )}>
                      {pos
                        ? <ArrowUpRight   className="h-2.5 w-2.5" />
                        : <ArrowDownRight className="h-2.5 w-2.5" />
                      }
                      {Math.abs(mockChange).toFixed(2)}%
                    </div>
                  </td>

                  {/* Exchange */}
                  <td className="pr-5 pl-4 py-3 text-right hidden sm:table-cell">
                    <span className="text-[11px] text-[var(--text-3)]">{a.metadata?.exchange ?? '—'}</span>
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
