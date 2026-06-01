import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, BarChart3, Trash2, TrendingUp, RefreshCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { assetsApi } from '@/lib/api'
import type { FinancialAsset, AssetType } from '@/types'
import { formatCurrency, formatRelativeTime, getAssetTypeBadgeColor, getAssetTypeIcon } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

const createSchema = z.object({
  symbol: z.string().min(1, 'Required').max(20),
  name: z.string().min(1, 'Required').max(100),
  type: z.enum(['stock', 'crypto', 'forex', 'commodity', 'index']),
  currency: z.string(),
})
type CreateForm = z.infer<typeof createSchema>

export function Assets() {
  const { toast } = useApp()
  const [assets, setAssets] = useState<FinancialAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [deletingSymbol, setDeletingSymbol] = useState<string | null>(null)
  const [fetchingLive, setFetchingLive] = useState<string | null>(null)

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { symbol: '', name: '', type: 'stock', currency: 'USD' },
  })

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await assetsApi.list({
        search: search || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        limit: 50,
      })
      setAssets(result.assets ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets')
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => { fetchAssets() }, [fetchAssets])

  const handleCreate = async (data: CreateForm) => {
    try {
      const asset = await assetsApi.create({
        ...data,
        symbol: data.symbol.toUpperCase(),
      })
      setAssets((prev) => [asset, ...prev])
      setCreateOpen(false)
      form.reset()
      toast.success('Asset created', `${asset.symbol} added.`)
    } catch (err) {
      toast.error('Failed to create asset', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleDelete = async (symbol: string) => {
    try {
      setDeletingSymbol(symbol)
      await assetsApi.delete(symbol)
      setAssets((prev) => prev.filter((a) => a.symbol !== symbol))
      toast.success('Asset deleted', `${symbol} removed.`)
    } catch (err) {
      toast.error('Delete failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setDeletingSymbol(null)
    }
  }

  const handleFetchLive = async (symbol: string) => {
    try {
      setFetchingLive(symbol)
      const result = await assetsApi.getLive(symbol)
      toast.success('Live data fetched', `${symbol} price updated.`)
      // Update asset in list if we have price data
      if (result.assetInfo) {
        setAssets((prev) => prev.map((a) => a.symbol === symbol ? { ...a, ...result.assetInfo } : a))
      }
    } catch (err) {
      toast.error('Failed to fetch live data', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setFetchingLive(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Financial Assets"
        description="Manage tracked financial instruments"
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)} aria-label="Add new asset">
            <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Add Asset
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="pl-9"
            aria-label="Search assets"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]" aria-label="Filter by asset type">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="stock">Stocks</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="forex">Forex</SelectItem>
            <SelectItem value="commodity">Commodities</SelectItem>
            <SelectItem value="index">Indices</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <ErrorState message={error} onRetry={fetchAssets} className="mb-6" />}

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="No assets found"
          description={search ? `No assets match "${search}"` : 'Add your first financial asset to track.'}
          action={!search ? { label: 'Add Asset', onClick: () => setCreateOpen(true) } : undefined}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {assets.map((asset, i) => (
              <motion.div
                key={asset._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:border-border/80 transition-colors group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-lg shrink-0" aria-hidden="true">
                        {getAssetTypeIcon(asset.type)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">{asset.symbol}</span>
                          <span className="text-sm text-muted-foreground truncate">{asset.name}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getAssetTypeBadgeColor(asset.type)}`}>
                            {asset.type}
                          </span>
                          {!asset.isActive && (
                            <Badge variant="muted" className="text-[10px]">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {asset.currentPrice && (
                            <span className="text-sm font-semibold tabular-nums">
                              {formatCurrency(asset.currentPrice, asset.currency)}
                            </span>
                          )}
                          {asset.metadata?.exchange && (
                            <span className="text-xs text-muted-foreground">{asset.metadata.exchange}</span>
                          )}
                          {asset.metadata?.sector && (
                            <span className="text-xs text-muted-foreground">{asset.metadata.sector}</span>
                          )}
                          {asset.lastUpdated && (
                            <span className="text-xs text-muted-foreground">
                              Updated {formatRelativeTime(asset.lastUpdated)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleFetchLive(asset.symbol)}
                          loading={fetchingLive === asset.symbol}
                          aria-label={`Fetch live price for ${asset.symbol}`}
                        >
                          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(asset.symbol)}
                          loading={deletingSymbol === asset.symbol}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          aria-label={`Delete ${asset.symbol}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Financial Asset</DialogTitle>
            <DialogDescription>Track a new financial instrument.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="asset-sym" className="text-sm font-medium">Symbol *</label>
                <Input
                  id="asset-sym"
                  {...form.register('symbol')}
                  placeholder="AAPL"
                  onChange={(e) => form.setValue('symbol', e.target.value.toUpperCase())}
                  error={!!form.formState.errors.symbol}
                />
                {form.formState.errors.symbol && (
                  <p className="text-xs text-destructive" role="alert">{form.formState.errors.symbol.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="asset-type-sel" className="text-sm font-medium">Type</label>
                <Select
                  value={form.watch('type')}
                  onValueChange={(v) => form.setValue('type', v as AssetType)}
                >
                  <SelectTrigger id="asset-type-sel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['stock', 'crypto', 'forex', 'commodity', 'index'].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="asset-name" className="text-sm font-medium">Name *</label>
              <Input
                id="asset-name"
                {...form.register('name')}
                placeholder="Apple Inc."
                error={!!form.formState.errors.name}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive" role="alert">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="asset-currency" className="text-sm font-medium">Currency</label>
              <Input
                id="asset-currency"
                {...form.register('currency')}
                placeholder="USD"
                onChange={(e) => form.setValue('currency', e.target.value.toUpperCase())}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" loading={form.formState.isSubmitting}>Add Asset</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
