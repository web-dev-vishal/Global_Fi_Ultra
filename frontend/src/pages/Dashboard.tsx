import React from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { KPICards } from '@/components/dashboard/KPICards'
import { CryptoWidget } from '@/components/dashboard/CryptoWidget'
import { NewsWidget } from '@/components/dashboard/NewsWidget'
import { PortfolioChart } from '@/components/dashboard/PortfolioChart'
import { StockTable } from '@/components/dashboard/StockTable'
import { useMarketData } from '@/hooks/useMarketData'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'

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
  const news    = (data?.data?.news ?? []) as any[]

  return (
    /* Page wrapper */
    <div className="p-5 sm:p-6 max-w-[1700px] mx-auto page-enter animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[var(--text-1)] tracking-tight">Dashboard</h1>
            {usingMock && <Badge variant="blue">Demo Data</Badge>}
          </div>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            {lastUpdated
              ? `Updated ${new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(lastUpdated)}`
              : 'Loading market data…'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} loading={loading} icon={<RefreshCw className="h-3.5 w-3.5" />}>
          Refresh
        </Button>
      </div>

      <div className="mb-5"><KPICards stock={stock} loading={loading} /></div>
      <div className="mb-5"><PortfolioChart loading={loading} /></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2"><CryptoWidget cryptos={cryptos} loading={loading} /></div>
        <div><NewsWidget articles={news} loading={loading} /></div>
      </div>

      <StockTable loading={loading} />
    </div>
  )
}
