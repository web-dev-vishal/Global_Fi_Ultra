import React from 'react'
import { Zap, Globe, Shield, Bell } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'
import { useNavigate } from 'react-router-dom'

export function Settings() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()

  return (
    <div className="p-5 sm:p-6 max-w-[800px] mx-auto page-enter">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Preferences & configuration</p>
      </div>

      <div className="space-y-4">
        {/* Account */}
        <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Account</h3>
          </div>
          {currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 font-bold text-lg shrink-0">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{currentUser.firstName} {currentUser.lastName}</p>
                  <p className="text-sm text-slate-400 truncate">{currentUser.email}</p>
                </div>
                <Badge variant={currentUser.isActive ? 'green' : 'red'} dot>{currentUser.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Default Currency', value: currentUser.preferences?.defaultCurrency ?? 'USD' },
                  { label: 'Default Stock',    value: currentUser.preferences?.defaultStockSymbol ?? 'IBM' },
                ].map(r => (
                  <div key={r.label} className="p-3 rounded-xl bg-slate-800/40">
                    <p className="text-xs text-slate-500">{r.label}</p>
                    <p className="font-medium text-white mt-0.5">{r.value}</p>
                  </div>
                ))}
              </div>
              <Button variant="danger" size="sm" onClick={logout}>Sign out</Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400 mb-4">Sign in to manage your account.</p>
              <div className="flex items-center justify-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => navigate('/register')}>Create Account</Button>
                <Button size="sm" onClick={() => navigate('/login')}>Sign In</Button>
              </div>
            </div>
          )}
        </div>

        {/* API Config */}
        <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">API Configuration</h3>
          </div>
          <div className="space-y-1">
            {[
              { label: 'API Base URL',     value: '/api/v1' },
              { label: 'WebSocket',        value: 'ws://localhost:4000' },
              { label: 'API Version',      value: '1.0.0' },
              { label: 'Global Limit',     value: '100 req / 15 min' },
              { label: 'AI Limit',         value: '10 req / 1 min' },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-slate-700/40 last:border-0">
                <span className="text-sm text-slate-400">{r.label}</span>
                <code className="text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg font-mono text-slate-300">{r.value}</code>
              </div>
            ))}
          </div>
        </div>

        {/* External APIs */}
        <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">External Data Sources</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { name: 'Alpha Vantage', type: 'Stocks',      v: 'blue' },
              { name: 'CoinGecko',    type: 'Crypto',      v: 'amber' },
              { name: 'ExchangeRate', type: 'Forex',       v: 'purple' },
              { name: 'NewsAPI',      type: 'News',        v: 'cyan' },
              { name: 'FRED',         type: 'Economic',    v: 'green' },
              { name: 'Finnhub',      type: 'Market News', v: 'blue' },
            ].map(a => (
              <div key={a.name} className="flex flex-col gap-1.5 p-3 rounded-xl border border-slate-700/60 bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
                <span className="text-xs font-semibold text-white">{a.name}</span>
                <Badge variant={a.v as any} className="w-fit">{a.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
