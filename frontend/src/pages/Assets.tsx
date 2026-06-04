import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, BarChart3, Trash2, TrendingUp } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { assetsApi } from '@/lib/api'
import type { FinancialAsset } from '@/types'
import { MOCK_ASSETS } from '@/data/mockData'
import { useToast } from '@/components/ui/Toast'

const schema = z.object({
  symbol:   z.string().min(1).max(20),
  name:     z.string().min(1).max(100),
  type:     z.enum(['stock','crypto','forex','commodity','index']),
  currency: z.string(),
})
type Form = z.infer<typeof schema>

// Level 3 input, Level 2 card
const inputCls = 'w-full h-9 bg-slate-50 dark:bg-[var(--bg-input)] border border-slate-200 dark:border-[var(--border)] hover:border-slate-300 dark:hover:border-[var(--border-md)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-blue-500/30 rounded-lg px-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] transition-all duration-150'
const labelCls = 'block text-xs font-medium text-[var(--text-2)] mb-1.5 uppercase tracking-wider'
const cardCls  = 'bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl'

const typeColor: Record<string, string> = {
  stock: 'blue', crypto: 'amber', forex: 'purple', commodity: 'green', index: 'cyan',
}

function fmtUSD(v?: number) {
  if (!v) return '—'
  if (v > 100)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(v)
}

export function Assets() {
  const toast = useToast()
  const [assets, setAssets]         = useState<FinancialAsset[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [createOpen, setCreate]     = useState(false)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [fetchingLive, setFetching] = useState<string | null>(null)

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { symbol: '', name: '', type: 'stock', currency: 'USD' },
  })

  const load = useCallback(async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))
    try {
      const r = await assetsApi.list({ search: search || undefined, type: typeFilter !== 'all' ? typeFilter : undefined, limit: 50 })
      setAssets(r.assets ?? [])
    } catch {
      setAssets(MOCK_ASSETS as unknown as FinancialAsset[])
    } finally { setLoading(false) }
  }, [search, typeFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async (data: Form) => {
    try {
      const a = await assetsApi.create({ ...data, symbol: data.symbol.toUpperCase() })
      setAssets(p => [a, ...p]); reset(); setCreate(false)
      toast.success('Asset added', `${a.symbol} is now tracked.`)
    } catch {
      const mock = { _id: Date.now().toString(), symbol: data.symbol.toUpperCase(), name: data.name, type: data.type, currentPrice: 0, currency: data.currency, isActive: true, priceHistory: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as unknown as FinancialAsset
      setAssets(p => [mock, ...p]); reset(); setCreate(false)
      toast.success('Asset added', `${data.symbol.toUpperCase()} added (offline).`)
    }
  }

  const handleDelete = async (symbol: string) => {
    try { setDeleting(symbol); await assetsApi.delete(symbol) } catch {}
    setAssets(p => p.filter(a => a.symbol !== symbol))
    toast.success('Deleted', `${symbol} removed.`); setDeleting(null)
  }

  const handleLive = async (symbol: string) => {
    try {
      setFetching(symbol)
      const r = await assetsApi.getLive(symbol)
      if (r.assetInfo) setAssets(p => p.map(a => a.symbol === symbol ? { ...a, ...r.assetInfo } : a))
      toast.success('Updated', `${symbol} price refreshed.`)
    } catch { toast.warning('Offline', `Could not fetch live price for ${symbol}.`) }
    finally { setFetching(null) }
  }

  return (
    <div className="p-5 sm:p-6 max-w-[1200px] mx-auto page-enter animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-1)]">Financial Assets</h1>
          <p className="text-xs text-[var(--text-3)] mt-0.5">Manage tracked financial instruments</p>
        </div>
        <Button size="sm" onClick={() => setCreate(true)} icon={<Plus className="h-3.5 w-3.5" />}>Add Asset</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-3)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets…" className={inputCls + ' pl-9'} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={inputCls + ' w-auto cursor-pointer'}>
          <option value="all">All types</option>
          {['stock','crypto','forex','commodity','index'].map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Asset list — Level 2 card */}
      {loading ? (
        <div className={`${cardCls} px-5 py-2`}>
          {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : assets.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-16 ${cardCls} text-center`}>
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 mb-4">
            <BarChart3 className="h-8 w-8 text-slate-500 dark:text-[var(--text-3)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-1)]">No assets found</p>
          <p className="text-xs text-[var(--text-3)] mt-1">
            {search ? `No assets match "${search}"` : 'Add your first financial asset.'}
          </p>
          {!search && <Button size="sm" className="mt-4" onClick={() => setCreate(true)}>Add Asset</Button>}
        </div>
      ) : (
        <div className={`${cardCls} overflow-hidden`}>
          <AnimatePresence>
            {assets.map((a, i) => (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-lg shrink-0 border border-slate-200 dark:border-[var(--border)]">
                  {a.type === 'stock' ? '📈' : a.type === 'crypto' ? '₿' : a.type === 'forex' ? '💱' : a.type === 'commodity' ? '🏅' : '📊'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[var(--text-1)]">{a.symbol}</span>
                    <span className="text-sm text-[var(--text-2)] truncate">{a.name}</span>
                    <Badge variant={typeColor[a.type] as any}>{a.type}</Badge>
                    {!a.isActive && <Badge variant="slate">Inactive</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--text-3)]">
                    {a.currentPrice && (
                      <span className="text-[var(--text-1)] font-medium font-mono tabular-nums">{fmtUSD(a.currentPrice)}</span>
                    )}
                    {a.metadata?.exchange && <span>{a.metadata.exchange}</span>}
                    {a.metadata?.sector && <span>{a.metadata.sector}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon-sm" loading={fetchingLive === a.symbol} onClick={() => handleLive(a.symbol)} aria-label="Fetch live price">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" loading={deleting === a.symbol} className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(a.symbol)} aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create modal — Level 4 */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreate(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-[var(--border-md)] rounded-2xl p-6 shadow-2xl z-10"
          >
            <h2 className="text-base font-bold text-[var(--text-1)] mb-5">Add Financial Asset</h2>
            <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Symbol *</label>
                  <input {...register('symbol')} placeholder="AAPL" className={inputCls} onChange={e => setValue('symbol', e.target.value.toUpperCase())} />
                  {errors.symbol && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.symbol.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select {...register('type')} className={inputCls + ' cursor-pointer'}>
                    {['stock','crypto','forex','commodity','index'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Name *</label>
                <input {...register('name')} placeholder="Apple Inc." className={inputCls} />
                {errors.name && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <input {...register('currency')} placeholder="USD" className={inputCls} onChange={e => setValue('currency', e.target.value.toUpperCase())} />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="ghost" onClick={() => setCreate(false)} className="flex-1">Cancel</Button>
                <Button type="submit" loading={isSubmitting} className="flex-1">Add Asset</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
