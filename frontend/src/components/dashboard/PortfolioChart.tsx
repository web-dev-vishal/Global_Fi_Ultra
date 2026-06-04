import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  MOCK_PORTFOLIO_CHART_1D,
  MOCK_PORTFOLIO_CHART_1W,
  MOCK_PORTFOLIO_CHART_1M,
  MOCK_PORTFOLIO_CHART_3M,
  MOCK_PORTFOLIO_CHART_1Y,
} from '@/data/mockData'
import { SkeletonChart } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════════════
   Portfolio Chart — Premium recharts card
   Stripe-quality tooltip, clean axis, elegant area gradient
═══════════════════════════════════════════════════════════════════════════ */

interface PortfolioChartProps { loading?: boolean }

const TIME_RANGES = ['1D', '1W', '1M', '3M', '1Y'] as const
type TimeRange = typeof TIME_RANGES[number]

const RANGE_DATA: Record<TimeRange, { label: string; value: number }[]> = {
  '1D': MOCK_PORTFOLIO_CHART_1D,
  '1W': MOCK_PORTFOLIO_CHART_1W,
  '1M': MOCK_PORTFOLIO_CHART_1M,
  '3M': MOCK_PORTFOLIO_CHART_3M,
  '1Y': MOCK_PORTFOLIO_CHART_1Y,
}

const RANGE_LABEL: Record<TimeRange, string> = {
  '1D': 'Today (hourly)',
  '1W': 'Last 7 days',
  '1M': 'Last 30 days',
  '3M': 'Last 3 months',
  '1Y': 'Last 12 months',
}

/* ── Custom Tooltip ── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div className="bg-[var(--bg-3)] border border-[var(--border-3)] rounded-xl px-3 py-2.5 shadow-[var(--shadow-float)]">
      <p className="text-[11px] text-[var(--text-3)] mb-1">{label}</p>
      <p className="num text-[14px] font-semibold text-[var(--text-0)]">
        ${new Intl.NumberFormat('en-US').format(Math.round(val))}
      </p>
    </div>
  )
}

export function PortfolioChart({ loading }: PortfolioChartProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>('1M')

  if (loading) {
    return (
      <div className="rounded-xl p-5 bg-[var(--bg-2)] border border-[var(--border-2)]" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1.5">
            <div className="shimmer h-3.5 w-28 rounded-md" />
            <div className="shimmer h-3 w-20 rounded-md" />
          </div>
          <div className="shimmer h-7 w-40 rounded-lg" />
        </div>
        <SkeletonChart height="h-48" />
      </div>
    )
  }

  const data    = RANGE_DATA[activeRange]
  const latest  = data[data.length - 1]?.value ?? 0
  const first   = data[0]?.value ?? 0
  const gain    = latest - first
  const gainPct = ((gain / (first || 1)) * 100).toFixed(2)
  const isPos   = gain >= 0

  return (
    <div
      className="rounded-xl bg-[var(--bg-2)] border border-[var(--border-2)]"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--border-1)]">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text-1)]">Portfolio Value</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{RANGE_LABEL[activeRange]}</p>
        </div>

        <div className="flex flex-col items-end gap-2.5">
          {/* Value + delta */}
          <div className="text-right">
            <p className="num text-[19px] font-bold text-[var(--text-0)] tracking-tight leading-none">
              ${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(latest)}
            </p>
            <p className={cn(
              'text-[12px] font-semibold mt-0.5',
              isPos ? 'text-[var(--success-bright)]' : 'text-[var(--danger-bright)]'
            )}>
              {isPos ? '+' : ''}{gainPct}% this period
            </p>
          </div>

          {/* Time range pill group */}
          <div className="flex items-center gap-0.5 bg-[var(--bg-3)] border border-[var(--border-2)] rounded-lg p-0.5">
            {TIME_RANGES.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRange(r)}
                className={cn(
                  'text-[11px] font-medium px-2.5 py-1 rounded-md transition-all duration-100 cursor-pointer',
                  r === activeRange
                    ? 'bg-[var(--bg-5)] text-[var(--text-1)] shadow-sm'
                    : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52 px-2 pt-4 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={isPos ? '#2563EB' : '#DC2626'} stopOpacity={0.18} />
                <stop offset="100%" stopColor={isPos ? '#2563EB' : '#DC2626'} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="0"
              stroke="var(--chart-grid)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--chart-text)', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--chart-text)', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--border-3)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPos ? 'var(--accent)' : 'var(--danger)'}
              strokeWidth={1.5}
              fill="url(#portfolioGrad)"
              dot={false}
              activeDot={{
                r: 3,
                fill: isPos ? 'var(--accent-bright)' : 'var(--danger-bright)',
                stroke: 'var(--bg-2)',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
