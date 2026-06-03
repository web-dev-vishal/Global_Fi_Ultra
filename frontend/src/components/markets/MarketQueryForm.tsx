import React from 'react'
import { Search, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const FRED_SERIES = [
  { value: 'GDP',      label: 'GDP' },
  { value: 'UNRATE',   label: 'Unemployment' },
  { value: 'CPIAUCSL', label: 'CPI / Inflation' },
  { value: 'FEDFUNDS', label: 'Fed Funds Rate' },
  { value: 'DGS10',    label: '10-Year Treasury' },
]

interface MarketQueryFormProps {
  symbol: string; crypto: string; currency: string; fredSeries: string; loading: boolean
  onSymbol: (v: string) => void; onCrypto: (v: string) => void
  onCurrency: (v: string) => void; onFred: (v: string) => void; onFetch: () => void
}

const inputCls = 'w-full h-9 bg-slate-50 dark:bg-[var(--bg-input)] border border-slate-200 dark:border-[var(--border)] hover:border-slate-300 dark:hover:border-[var(--border-md)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-blue-500/30 rounded-lg px-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] transition-all duration-150'
const labelCls = 'block text-xs font-medium text-[var(--text-2)] mb-1.5 uppercase tracking-wider'

export function MarketQueryForm({
  symbol, crypto, currency, fredSeries, loading,
  onSymbol, onCrypto, onCurrency, onFred, onFetch,
}: MarketQueryFormProps) {
  return (
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className={labelCls}>Stock Symbol</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-3)]" />
            <input
              value={symbol}
              onChange={e => onSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL, TSLA…"
              className={inputCls + ' pl-8'}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Crypto IDs</label>
          <input value={crypto} onChange={e => onCrypto(e.target.value)} placeholder="bitcoin,ethereum…" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Base Currency</label>
          <input value={currency} onChange={e => onCurrency(e.target.value.toUpperCase())} placeholder="USD" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>FRED Series</label>
          <select value={fredSeries} onChange={e => onFred(e.target.value)} className={inputCls + ' cursor-pointer'}>
            {FRED_SERIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <Button onClick={onFetch} loading={loading} icon={<Zap className="h-3.5 w-3.5" />}>
        Fetch Live Data
      </Button>
    </div>
  )
}
