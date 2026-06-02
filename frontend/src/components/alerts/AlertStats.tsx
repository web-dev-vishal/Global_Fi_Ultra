import React from 'react'
import { Bell, CheckCircle2, BellOff } from 'lucide-react'
import type { Alert } from '@/types'

interface AlertStatsProps {
  alerts: Alert[]
  activeTab: string
  onTab: (t: string) => void
  loading?: boolean
}

export function AlertStats({ alerts, activeTab, onTab, loading }: AlertStatsProps) {
  const active    = alerts.filter(a => a.isActive && !a.isTriggered).length
  const triggered = alerts.filter(a => a.isTriggered).length
  const inactive  = alerts.filter(a => !a.isActive && !a.isTriggered).length

  const stats = [
    { key: 'active',    label: 'Active',    count: active,    icon: Bell,         color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { key: 'triggered', label: 'Triggered', count: triggered, icon: CheckCircle2, color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
    { key: 'inactive',  label: 'Inactive',  count: inactive,  icon: BellOff,      color: 'text-slate-400',   bg: 'bg-slate-700/40 border-slate-700' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {stats.map(s => (
        <button
          key={s.key}
          onClick={() => onTab(s.key)}
          className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
            activeTab === s.key ? s.bg : 'bg-[#131D2E] border-slate-700/50 hover:border-slate-600'
          }`}
        >
          <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
          <div className="text-left">
            <p className="text-xl font-bold text-white">{loading ? '—' : s.count}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
