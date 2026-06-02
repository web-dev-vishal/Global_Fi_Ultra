import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MOCK_PORTFOLIO_CHART } from '@/data/mockData'
import { Skeleton } from '@/components/ui/Skeleton'

interface PortfolioChartProps { loading?: boolean }

export function PortfolioChart({ loading }: PortfolioChartProps) {
  if (loading) return (
    <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl p-5">
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
    <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Portfolio Value</h3>
          <p className="text-xs text-slate-500 mt-0.5">Last 30 days</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white tabular-nums">
            ${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(latest)}
          </p>
          <p className={`text-xs font-medium ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {gain >= 0 ? '+' : ''}{gainPct}% this month
          </p>
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
              formatter={(v: number) => [`$${new Intl.NumberFormat('en-US').format(Math.round(v))}`, 'Value']}
              cursor={{ stroke: 'rgba(59,130,246,0.4)', strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#portfolioGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
