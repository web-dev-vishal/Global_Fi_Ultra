import React, { useState, useCallback } from 'react'
import { Loader2, TrendingUp } from 'lucide-react'
import { MarketQueryForm } from '@/components/markets/MarketQueryForm'
import { MarketResultsTable } from '@/components/markets/MarketResultsTable'
import { useMarketData } from '@/hooks/useMarketData'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function Markets() {
  const toast = useToast()
  const [symbol, setSymbol]   = useState('IBM')
  const [crypto, setCrypto]   = useState('bitcoin,ethereum,solana')
  const [currency, setCurrency] = useState('USD')
  const [fredSeries, setFred] = useState('GDP')
  const { data, loading, usingMock, reload } = useMarketData(false)

  const handleFetch = useCallback(async () => {
    await reload({ symbol, crypto })
    if (usingMock) toast.info('Using cached data', 'Backend offline — showing demo data.')
  }, [symbol, crypto, reload, usingMock, toast])

  return (
    <div className="p-5 sm:p-6 max-w-[1400px] mx-auto page-enter">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Live Markets</h1>
            {usingMock && <Badge variant="amber">Demo Data</Badge>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Fetch real-time data from all financial APIs</p>
        </div>
      </div>

      <div className="mb-5">
        <MarketQueryForm
          symbol={symbol} crypto={crypto} currency={currency} fredSeries={fredSeries}
          loading={loading}
          onSymbol={setSymbol} onCrypto={setCrypto} onCurrency={setCurrency} onFred={setFred}
          onFetch={handleFetch}
        />
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-sm text-slate-400">Fetching live market data…</p>
        </div>
      )}

      {!loading && data && (
        <MarketResultsTable data={data} />
      )}

      {!loading && !data && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-5 rounded-2xl bg-slate-800/60 mb-4">
            <TrendingUp className="h-10 w-10 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-300 mb-1">Ready to fetch live data</h3>
          <p className="text-sm text-slate-500 max-w-xs mb-5">Configure your query and click "Fetch Live Data" to get real-time market data.</p>
          <Button onClick={handleFetch}>Fetch Live Data</Button>
        </div>
      )}
    </div>
  )
}
