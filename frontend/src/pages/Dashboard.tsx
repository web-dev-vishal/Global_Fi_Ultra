import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, RefreshCw, Wifi, Activity,
  DollarSign, Bitcoin, Globe, Newspaper, BarChart2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/common/StatCard'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PageHeader } from '@/components/common/PageHeader'
import { financialApi } from '@/lib/api'
import type { FinancialDataResponse, StockData, CryptoData, NewsArticle } from '@/types'
import {
  formatCurrency, formatPercent, formatRelativeTime,
  getPriceChangeColor, getPriceChangeBg, truncate
} from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { useApp } from '@/context/AppContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function Dashboard() {
  const { toast } = useApp()
  const [data, setData] = useState<FinancialDataResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      // Try cached first for speed, then live
      let result: FinancialDataResponse
      try {
        result = await financialApi.getCached()
      } catch {
        result = await financialApi.getLive()
      }

      setData(result)
      setLastUpdated(new Date())
      if (isRefresh) toast.success('Data refreshed', 'Market data updated successfully.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load market data'
      setError(msg)
      if (isRefresh) toast.error('Refresh failed', msg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  const stock = data?.data?.stock
  const cryptos = data?.data?.crypto ?? []
  const news = data?.data?.news ?? []
  const economic = data?.data?.economic

  // Build mini chart data from crypto price changes
  const cryptoChartData = cryptos.slice(0, 6).map((c) => ({
    name: c.symbol.toUpperCase(),
    price: c.current_price,
    change: c.price_change_percentage_24h,
  }))

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Dashboard"
        description={lastUpdated ? `Last updated ${formatRelativeTime(lastUpdated.toISOString())}` : 'Real-time financial overview'}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            loading={refreshing}
            aria-label="Refresh market data"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      {error && !loading && (
        <ErrorState
          message={error}
          onRetry={() => fetchData()}
          className="mb-6"
        />
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Stock Stats Row */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard
              title={stock?.symbol ?? 'Stock'}
              value={stock?.price}
              change={stock?.changePercent}
              changeLabel="today"
              isCurrency
              loading={loading}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatCard
              title="Open"
              value={stock?.open}
              isCurrency
              loading={loading}
              icon={<BarChart2 className="h-4 w-4" />}
            />
            <StatCard
              title="52W High"
              value={stock?.week52High}
              isCurrency
              loading={loading}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatCard
              title="52W Low"
              value={stock?.week52Low}
              isCurrency
              loading={loading}
              icon={<TrendingDown className="h-4 w-4" />}
            />
            <StatCard
              title="Volume"
              value={stock?.volume ? new Intl.NumberFormat('en-US', { notation: 'compact' }).format(stock.volume) : undefined}
              loading={loading}
              icon={<Activity className="h-4 w-4" />}
            />
          </div>
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Crypto + Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
            {/* Crypto prices */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bitcoin className="h-4 w-4 text-orange-500" aria-hidden="true" />
                    Crypto Markets
                  </CardTitle>
                  <Badge variant="muted" className="text-xs">24h</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="px-6 pb-4 space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-14" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cryptos.length === 0 ? (
                  <EmptyState
                    icon={<Bitcoin className="h-10 w-10" />}
                    title="No crypto data"
                    description="Crypto prices unavailable right now."
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {cryptos.slice(0, 6).map((crypto) => (
                      <CryptoRow key={crypto.id} crypto={crypto} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar chart */}
            {!loading && cryptoChartData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>24h Price Change (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48" aria-label="Crypto 24h price change chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cryptoChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(v: number) => `${v.toFixed(2)}%`}
                          contentStyle={{
                            background: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Bar
                          dataKey="change"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Right column: News + Economic */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Economic indicator */}
            {(loading || economic) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" aria-hidden="true" />
                    Economic Indicator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ) : economic ? (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {economic.seriesId}
                      </p>
                      <p className="text-3xl font-bold tabular-nums">
                        {economic.value !== undefined
                          ? `${economic.value}${economic.unit ? ` ${economic.unit}` : ''}`
                          : '—'}
                      </p>
                      {economic.date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          As of {economic.date}
                        </p>
                      )}
                      {economic.name && (
                        <p className="text-sm text-muted-foreground mt-2">{economic.name}</p>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* News feed */}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-purple-500" aria-hidden="true" />
                  Market News
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="px-6 pb-4 space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    ))}
                  </div>
                ) : news.length === 0 ? (
                  <EmptyState
                    icon={<Newspaper className="h-8 w-8" />}
                    title="No news available"
                    description="Check back later for market news."
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {news.slice(0, 6).map((article, i) => (
                      <NewsItem key={i} article={article} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Forex rates */}
        {(loading || data?.data?.forex) && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" aria-hidden="true" />
                  Forex Rates
                  {data?.data?.forex?.base && (
                    <Badge variant="muted" className="text-xs">Base: {data.data.forex.base}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="h-14 rounded-lg" />
                    ))}
                  </div>
                ) : data?.data?.forex?.rates ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">
                    {Object.entries(data.data.forex.rates)
                      .slice(0, 16)
                      .map(([currency, rate]) => (
                        <div
                          key={currency}
                          className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <span className="text-xs font-bold text-foreground">{currency}</span>
                          <span className="text-xs text-muted-foreground tabular-nums mt-0.5">
                            {typeof rate === 'number' ? rate.toFixed(4) : rate}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CryptoRow({ crypto }: { crypto: CryptoData }) {
  const isPositive = crypto.price_change_percentage_24h > 0
  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        {crypto.image ? (
          <img
            src={crypto.image}
            alt={crypto.name}
            className="w-7 h-7 rounded-full"
            loading="lazy"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-600">
            {crypto.symbol[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold">{crypto.name}</p>
          <p className="text-xs text-muted-foreground uppercase">{crypto.symbol}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums">
          {formatCurrency(crypto.current_price)}
        </p>
        <span
          className={`text-xs font-medium tabular-nums ${getPriceChangeColor(crypto.price_change_percentage_24h)}`}
          aria-label={`24h change: ${formatPercent(crypto.price_change_percentage_24h)}`}
        >
          {formatPercent(crypto.price_change_percentage_24h)}
        </span>
      </div>
    </div>
  )
}

function NewsItem({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-6 py-3 hover:bg-muted/30 transition-colors group"
      aria-label={article.title}
    >
      <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
        {article.title}
      </p>
      <div className="flex items-center gap-2 mt-1">
        {article.source && (
          <span className="text-xs text-muted-foreground">{article.source}</span>
        )}
        {article.publishedAt && (
          <span className="text-xs text-muted-foreground">
            · {formatRelativeTime(article.publishedAt)}
          </span>
        )}
      </div>
    </a>
  )
}
