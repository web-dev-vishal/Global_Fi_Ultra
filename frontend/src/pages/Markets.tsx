import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, RefreshCw, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { financialApi } from '@/lib/api'
import type { FinancialDataResponse } from '@/types'
import { formatCurrency, formatPercent, getPriceChangeBg, formatCompact } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const FRED_SERIES = [
  { value: 'GDP', label: 'GDP' },
  { value: 'UNRATE', label: 'Unemployment Rate' },
  { value: 'CPIAUCSL', label: 'CPI (Inflation)' },
  { value: 'FEDFUNDS', label: 'Fed Funds Rate' },
  { value: 'DGS10', label: '10-Year Treasury' },
]

export function Markets() {
  const { toast } = useApp()
  const [symbol, setSymbol] = useState('IBM')
  const [crypto, setCrypto] = useState('bitcoin,ethereum,solana')
  const [currency, setCurrency] = useState('USD')
  const [fredSeries, setFredSeries] = useState('GDP')
  const [data, setData] = useState<FinancialDataResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLive = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await financialApi.getLive({ symbol, crypto, currency, fredSeries })
      setData(result)
      toast.success('Live data fetched', `${symbol} and market data loaded.`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch live data'
      setError(msg)
      toast.error('Fetch failed', msg)
    } finally {
      setLoading(false)
    }
  }, [symbol, crypto, currency, fredSeries, toast])

  const stock = data?.data?.stock
  const cryptos = data?.data?.crypto ?? []

  // Build area chart data from crypto history (mock with current + change)
  const areaData = cryptos.slice(0, 3).map((c) => ({
    name: c.symbol.toUpperCase(),
    price: c.current_price,
    high: c.high_24h,
    low: c.low_24h,
    volume: c.total_volume,
  }))

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Live Markets"
        description="Fetch real-time data from all financial APIs"
        actions={
          <Button onClick={fetchLive} loading={loading} aria-label="Fetch live market data">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Fetch Live
          </Button>
        }
      />

      {/* Query controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="stock-symbol" className="text-xs font-medium text-muted-foreground">
                Stock Symbol
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="stock-symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="IBM, AAPL, TSLA..."
                  className="pl-8"
                  aria-label="Stock symbol"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="crypto-ids" className="text-xs font-medium text-muted-foreground">
                Crypto IDs
              </label>
              <Input
                id="crypto-ids"
                value={crypto}
                onChange={(e) => setCrypto(e.target.value)}
                placeholder="bitcoin,ethereum..."
                aria-label="Crypto IDs (comma-separated)"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="base-currency" className="text-xs font-medium text-muted-foreground">
                Base Currency
              </label>
              <Input
                id="base-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
                aria-label="Base currency"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="fred-series" className="text-xs font-medium text-muted-foreground">
                FRED Series
              </label>
              <Select value={fredSeries} onValueChange={setFredSeries}>
                <SelectTrigger id="fred-series" aria-label="FRED economic series">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRED_SERIES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <ErrorState message={error} onRetry={fetchLive} className="mb-6" />}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Fetching live market data...</p>
          </div>
        </div>
      )}

      {!loading && data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Status bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={data.status === 'success' ? 'success' : data.status === 'partial' ? 'warning' : 'destructive'}>
              {data.status}
            </Badge>
            {data.metadata?.totalDuration && (
              <Badge variant="muted">{data.metadata.totalDuration}ms</Badge>
            )}
            {data.metadata?.apiCallsMade !== undefined && (
              <Badge variant="muted">{data.metadata.apiCallsMade} API calls</Badge>
            )}
            {data.metadata?.cacheHits !== undefined && (
              <Badge variant="info">{data.metadata.cacheHits} cache hits</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Stock card */}
            {stock && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" aria-hidden="true" />
                      {stock.symbol}
                      {stock.name && <span className="text-muted-foreground font-normal text-sm">· {stock.name}</span>}
                    </CardTitle>
                    {stock.exchange && <Badge variant="muted">{stock.exchange}</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-4xl font-bold tabular-nums">
                      {formatCurrency(stock.price, stock.currency ?? 'USD')}
                    </span>
                    {stock.changePercent !== undefined && (
                      <span className={`text-sm font-semibold mb-1 px-2 py-0.5 rounded-full ${getPriceChangeBg(stock.changePercent)}`}>
                        {formatPercent(stock.changePercent)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Open', value: formatCurrency(stock.open) },
                      { label: 'High', value: formatCurrency(stock.high) },
                      { label: 'Low', value: formatCurrency(stock.low) },
                      { label: 'Prev Close', value: formatCurrency(stock.previousClose) },
                      { label: 'Volume', value: stock.volume ? formatCompact(stock.volume) : '—' },
                      { label: 'P/E', value: stock.pe?.toFixed(2) ?? '—' },
                    ].map((item) => (
                      <div key={item.label} className="bg-muted/50 rounded-lg p-2.5">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-semibold tabular-nums mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Crypto table */}
            {cryptos.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Crypto Prices</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" aria-label="Cryptocurrency prices">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Asset</th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Price</th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">24h</th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Market Cap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cryptos.map((c) => (
                          <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {c.image && (
                                  <img src={c.image} alt={c.name} className="w-5 h-5 rounded-full" loading="lazy" />
                                )}
                                <div>
                                  <p className="font-medium">{c.name}</p>
                                  <p className="text-xs text-muted-foreground uppercase">{c.symbol}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums font-medium">
                              {formatCurrency(c.current_price)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getPriceChangeBg(c.price_change_percentage_24h)}`}>
                                {formatPercent(c.price_change_percentage_24h)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell tabular-nums">
                              {formatCompact(c.market_cap)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      )}

      {!loading && !data && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <TrendingUp className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold mb-1">Ready to fetch live data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure your query parameters and click "Fetch Live" to get real-time market data.
          </p>
          <Button onClick={fetchLive}>
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Fetch Live Data
          </Button>
        </div>
      )}
    </div>
  )
}
