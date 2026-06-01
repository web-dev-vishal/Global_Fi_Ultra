import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, BookMarked, Trash2, Eye, EyeOff, Tag, X, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { watchlistsApi } from '@/lib/api'
import type { Watchlist } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean(),
  userId: z.string().min(1, 'User ID is required'),
})

type CreateForm = z.infer<typeof createSchema>

const addAssetSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20).toUpperCase(),
  notes: z.string().max(200).optional(),
})
type AddAssetForm = z.infer<typeof addAssetSchema>

export function Watchlists() {
  const { toast, currentUser } = useApp()
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null)
  const [addAssetOpen, setAddAssetOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', description: '', isPublic: false as boolean, userId: currentUser?._id ?? '' },
  })

  const addAssetForm = useForm<AddAssetForm>({
    resolver: zodResolver(addAssetSchema),
    defaultValues: { symbol: '', notes: '' },
  })

  const fetchWatchlists = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await watchlistsApi.list({ limit: 50 })
      setWatchlists(result.watchlists ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load watchlists')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWatchlists() }, [fetchWatchlists])

  const handleCreate = async (data: CreateForm) => {
    try {
      const wl = await watchlistsApi.create(data as CreateWatchlistFormData)
      setWatchlists((prev: Watchlist[]) => [wl, ...prev])
      setCreateOpen(false)
      createForm.reset()
      toast.success('Watchlist created', `"${wl.name}" is ready.`)
    } catch (err) {
      toast.error('Failed to create', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      setDeletingId(id)
      await watchlistsApi.delete(id)
      setWatchlists((prev: Watchlist[]) => prev.filter((w: Watchlist) => w._id !== id))
      toast.success('Deleted', `"${name}" removed.`)
    } catch (err) {
      toast.error('Delete failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddAsset = async (data: AddAssetForm) => {
    if (!selectedWatchlist) return
    try {
      const updated = await watchlistsApi.addAsset(selectedWatchlist._id, data.symbol, data.notes)
      setWatchlists((prev: Watchlist[]) => prev.map((w: Watchlist) => w._id === updated._id ? updated : w))
      setSelectedWatchlist(updated)
      addAssetForm.reset()
      toast.success('Asset added', `${data.symbol} added to watchlist.`)
    } catch (err) {
      toast.error('Failed to add asset', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleRemoveAsset = async (watchlistId: string, symbol: string) => {
    try {
      const updated = await watchlistsApi.removeAsset(watchlistId, symbol)
      setWatchlists((prev: Watchlist[]) => prev.map((w: Watchlist) => w._id === updated._id ? updated : w))
      if (selectedWatchlist?._id === watchlistId) setSelectedWatchlist(updated)
      toast.success('Asset removed', `${symbol} removed.`)
    } catch (err) {
      toast.error('Failed to remove', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Watchlists"
        description="Track your favorite financial assets"
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)} aria-label="Create new watchlist">
            <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            New Watchlist
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={fetchWatchlists} className="mb-6" />}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : watchlists.length === 0 ? (
        <EmptyState
          icon={<BookMarked className="h-12 w-12" />}
          title="No watchlists yet"
          description="Create your first watchlist to start tracking assets."
          action={{ label: 'Create Watchlist', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {watchlists.map((wl, i) => (
              <motion.div
                key={wl._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="hover:border-primary/40 transition-colors group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{wl.name}</h3>
                        {wl.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{wl.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => { setSelectedWatchlist(wl); setAddAssetOpen(true) }}
                          aria-label={`Add asset to ${wl.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(wl._id, wl.name)}
                          loading={deletingId === wl._id}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          aria-label={`Delete ${wl.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>

                    {/* Assets */}
                    <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
                      {wl.assets.slice(0, 6).map((asset) => (
                        <div
                          key={asset.symbol}
                          className="group/asset flex items-center gap-1 bg-muted/60 hover:bg-muted rounded-full px-2 py-0.5 text-xs font-medium"
                        >
                          {asset.symbol}
                          <button
                            onClick={() => handleRemoveAsset(wl._id, asset.symbol)}
                            className="opacity-0 group-hover/asset:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                            aria-label={`Remove ${asset.symbol}`}
                          >
                            <X className="h-2.5 w-2.5" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                      {wl.assets.length > 6 && (
                        <span className="text-xs text-muted-foreground px-2 py-0.5">
                          +{wl.assets.length - 6} more
                        </span>
                      )}
                      {wl.assets.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">No assets yet</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="muted" className="text-[10px]">
                          {wl.assets.length} assets
                        </Badge>
                        {wl.isPublic ? (
                          <Badge variant="info" className="text-[10px]">
                            <Eye className="h-2.5 w-2.5 mr-1" aria-hidden="true" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="muted" className="text-[10px]">
                            <EyeOff className="h-2.5 w-2.5 mr-1" aria-hidden="true" />
                            Private
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(wl.updatedAt)}
                      </span>
                    </div>

                    {wl.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        <Tag className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                        {wl.tags.map((tag) => (
                          <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
                        ))}
                      </div>
                    )}
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
            <DialogTitle>Create Watchlist</DialogTitle>
            <DialogDescription>Add a new watchlist to track your assets.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="wl-name" className="text-sm font-medium">Name *</label>
              <Input
                id="wl-name"
                {...createForm.register('name')}
                placeholder="My Portfolio"
                error={!!createForm.formState.errors.name}
                aria-describedby={createForm.formState.errors.name ? 'wl-name-error' : undefined}
              />
              {createForm.formState.errors.name && (
                <p id="wl-name-error" className="text-xs text-destructive" role="alert">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="wl-desc" className="text-sm font-medium">Description</label>
              <Input
                id="wl-desc"
                {...createForm.register('description')}
                placeholder="Optional description..."
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="wl-userid" className="text-sm font-medium">User ID *</label>
              <Input
                id="wl-userid"
                {...createForm.register('userId')}
                placeholder="MongoDB ObjectID"
                error={!!createForm.formState.errors.userId}
              />
              {createForm.formState.errors.userId && (
                <p className="text-xs text-destructive" role="alert">
                  {createForm.formState.errors.userId.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="wl-public"
                {...createForm.register('isPublic')}
                className="rounded"
              />
              <label htmlFor="wl-public" className="text-sm">Make public</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createForm.formState.isSubmitting}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add asset dialog */}
      <Dialog open={addAssetOpen} onOpenChange={setAddAssetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Asset</DialogTitle>
            <DialogDescription>
              Add a symbol to "{selectedWatchlist?.name}"
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addAssetForm.handleSubmit(handleAddAsset)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="asset-symbol" className="text-sm font-medium">Symbol *</label>
              <Input
                id="asset-symbol"
                {...addAssetForm.register('symbol')}
                placeholder="AAPL, BTC, EUR..."
                error={!!addAssetForm.formState.errors.symbol}
                onChange={(e) => addAssetForm.setValue('symbol', e.target.value.toUpperCase())}
              />
              {addAssetForm.formState.errors.symbol && (
                <p className="text-xs text-destructive" role="alert">
                  {addAssetForm.formState.errors.symbol.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="asset-notes" className="text-sm font-medium">Notes</label>
              <Input
                id="asset-notes"
                {...addAssetForm.register('notes')}
                placeholder="Optional notes..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddAssetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={addAssetForm.formState.isSubmitting}>
                Add Asset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
