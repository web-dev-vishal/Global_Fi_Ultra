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
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200 dark:border-slate-700/50 rounded-xl p-5">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )

  const data = MOCK_PORTFOLIO_CHART
  const latest = data[data.length - 1]?.value ?? 0
  const first  = data[0]?.value ?? 0
  const gain = latest - first
  const gainPct = ((gain / first) * 100).toFixed(2)

  return (
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200 dark:border-slate-700/50 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Portfolio Value</h3>
          <p className="text-xs text-slate-500 mt-0.5">Last 30 days</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              ${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(latest)}
            </p>
            <p className={cn('text-xs font-medium', gain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
              {gain >= 0 ? '+' : ''}{gainPct}% this month
            </p>
          </div>

          {/* Time-range pill group */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg p-0.5">
            {TIME_RANGES.map(r => (
              <button
                key={r}
                onClick={() => setActiveRange(r)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-md transition-colors',
                  r === activeRange
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false}
              interval={6} tickFormatter={(v) => v.replace('Day ', '')} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#131D2E', border: '1px solid rgba(100,116,139,0.3)', borderRadius: '10px', fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(v) => [`$${new Intl.NumberFormat('en-US').format(Math.round(Number(v)))}`, 'Value']}
              cursor={{ stroke: 'rgba(59,130,246,0.4)', strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#portfolioGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
