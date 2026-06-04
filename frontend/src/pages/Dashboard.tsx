import React from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KPICards } from '@/components/dashboard/KPICards'
import { CryptoWidget } from '@/components/dashboard/CryptoWidget'
import { NewsWidget } from '@/components/dashboard/NewsWidget'
import { PortfolioChart } from '@/components/dashboard/PortfolioChart'
import { StockTable } from '@/components/dashboard/StockTable'
import { useMarketData } from '@/hooks/useMarketData'
import { useToast } from '@/components/ui/Toast'

/* ═══════════════════════════════════════════════════════════════════════════
   Dashboard — Premium layout with breathing room and clear hierarchy
═══════════════════════════════════════════════════════════════════════════ */

export function Dashboard() {
  const toast = useToast()
  const { data, loading, usingMock, lastUpdated, reload } = useMarketData(true)

  const handleRefresh = async () => {
    await reload()
    if (usingMock) toast.info('Using cached data', 'Backend offline — showing demo data.')
    else toast.success('Refreshed', 'Market data updated.')
  }

  const stock   = data?.data?.stock
  const cryptos = (data?.data?.crypto ?? []) as any[]
  const news    = (data?.data?.news   ?? []) as any[]

  return (
    <div className="min-h-full page-enter animate-fade-in">
      {/* ── Page content ── */}
      <div className="p-6 sm:p-7 max-w-[1760px] mx-auto space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-[20px] font-semibold text-[var(--text-1)] tracking-[-0.025em] leading-none">
                Dashboard
              </h1>
              {usingMock && (
                <Badge variant="amber" dot>Demo Data</Badge>
              )}
            </div>
            <p className="text-[12px] text-[var(--text-3)]">
              {lastUpdated
                ? `Updated at ${new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(lastUpdated)}`
                : 'Loading market data…'
              }
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={loading}
            icon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
        </div>

        {/* ── KPI cards ── */}
        <KPICards stock={stock} loading={loading} />

        {/* ── Portfolio chart ── */}
        <PortfolioChart loading={loading} />

        {/* ── Crypto + News ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <CryptoWidget cryptos={cryptos} loading={loading} />
          </div>
          <div>
            <NewsWidget articles={news} loading={loading} />
          </div>
        </div>

        {/* ── Stock table ── */}
        <StockTable loading={loading} />
      </div>
    </div>
  )
}
