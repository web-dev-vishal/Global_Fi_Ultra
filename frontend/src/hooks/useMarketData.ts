import { useState, useEffect, useCallback } from 'react'
import { financialApi } from '@/lib/api'
import type { FinancialDataResponse } from '@/types'
import {
  MOCK_STOCK, MOCK_CRYPTOS, MOCK_FOREX, MOCK_NEWS, MOCK_ECONOMIC, MOCK_SPARKLINE,
} from '@/data/mockData'

const MOCK_RESPONSE: FinancialDataResponse = {
  requestId: 'mock-001',
  timestamp: new Date().toISOString(),
  status: 'success',
  data: {
    stock: { ...MOCK_STOCK, currency: 'USD', latestTradingDay: new Date().toISOString() },
    crypto: MOCK_CRYPTOS as any,
    forex: MOCK_FOREX,
    news: MOCK_NEWS as any,
    economic: MOCK_ECONOMIC as any,
  },
  metadata: { fromCache: true, totalDuration: 0, apiCallsMade: 0, cacheHits: 6 },
}

export function useMarketData(autoLoad = true) {
  const [data, setData]           = useState<FinancialDataResponse | null>(null)
  const [loading, setLoading]     = useState(false)
  const [usingMock, setUsingMock] = useState(false)
  const [lastUpdated, setUpdated] = useState<Date | null>(null)

  const load = useCallback(async (params?: { symbol?: string; crypto?: string }) => {
    setLoading(true)
    // Show skeleton for at least 300ms
    const minDelay = new Promise(r => setTimeout(r, 300))
    try {
      const [result] = await Promise.all([
        params
          ? financialApi.getLive({ symbol: params.symbol, crypto: params.crypto })
          : financialApi.getCached(),
        minDelay,
      ])
      setData(result)
      setUsingMock(false)
    } catch {
      await minDelay
      setData(MOCK_RESPONSE)
      setUsingMock(true)
    } finally {
      setLoading(false)
      setUpdated(new Date())
    }
  }, [])

  useEffect(() => {
    if (autoLoad) load()
  }, [autoLoad, load])

  return { data, loading, usingMock, lastUpdated, reload: load, sparkline: MOCK_SPARKLINE }
}
