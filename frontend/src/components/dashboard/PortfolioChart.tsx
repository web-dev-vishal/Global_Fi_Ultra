import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MOCK_PORTFOLIO_CHART } from '@/data/mockData'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface PortfolioChartProps { loading?: boolean }

const TIME_RANGES = ['1D', '1W', '1M', '3M', '1Y'] as const
type TimeRange = typeof TIME_RANGES[number]

export function PortfolioChart({ loading }: PortfolioChartProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>('1M')

  if (loading) return (
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl p-5">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )

  const data   = MOCK_PORTFOLIO_CHART
  const latest = data[data.length - 1]?.value ?? 0
  const first  = data[0]?.value ?? 0
  const gain   = latest - first
  const gainPct = ((gain / first) * 100).toFixed(2)

  return (
    /* Level 2 card */
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-1)]">Portfolio Value</h3>
          <p className="text-xs text-[var(--text-3)] mt-0.5">Last 30 days</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-lg font-bold text-[var(--text-1)] font-mono tabular-nums">
              ${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(latest)}
            </p>
            <p className={cn('text-xs font-medium', gain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
              {gain >= 0 ? '+' : ''}{gainPct}% this month
            </p>
          </div>

          {/* Time-range pill group — Level 3 bg */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg p-0.5">
            {TIME_RANGES.map(r => (
              <button
                key={r}
                onClick={() => setActiveRange(r)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-md transition-colors',
                  r === activeRange
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-[var(--text-1)] font-medium shadow-sm'
                    : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart — blue line + fill per spec */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                {/* Fill area: rgba(59,130,246,0.10) */}
                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.20} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Grid lines: dark #1e293b / light #e2e8f0 */}
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} className="dark:[stroke:#1e293b] [stroke:#e2e8f0]" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: 'var(--text-3)' }}
              axisLine={false} tickLine={false}
              interval={6}
              tickFormatter={(v) => v.replace('Day ', '')}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text-3)' }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            {/* Tooltip — Level 4 */}
            <Tooltip
              contentStyle={{
                background: '#0F172A',
                border: '1px solid rgba(100,116,139,0.35)',
                borderRadius: '10px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(v) => [`$${new Intl.NumberFormat('en-US').format(Math.round(Number(v)))}`, 'Value']}
              cursor={{ stroke: 'rgba(59,130,246,0.4)', strokeWidth: 1 }}
            />
            {/* Line stroke: #3B82F6 */}
            <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#portfolioGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
