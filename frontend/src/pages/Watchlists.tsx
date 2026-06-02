import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Star, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { watchlistsApi } from '@/lib/api'
import type { Watchlist, CreateWatchlistFormData } from '@/types'
import { useToast } from '@/components/ui/Toast'
import { useApp } from '@/context/AppContext'

const createSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic:    z.boolean(),
  userId:      z.string().min(1),
})
const addAssetSchema = z.object({
  symbol: z.string().min(1).max(20),
  notes:  z.string().max(200).optional(),
})

type CreateForm = z.infer<typeof createSchema>
type AddAssetForm = z.infer<typeof addAssetSchema>

const inputCls = 'w-full h-9 bg-slate-800/60 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:outline-none rounded-lg px-3 text-sm text-white placeholder:text-slate-500 transition-colors'

export function Watchlists() {
  const toast = useToast()
  const { currentUser } = useApp()
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [loading, setLoading]       = useState(true)
  const [createOpen, setCreate]     = useState(false)
  const [selectedWL, setSelectedWL] = useState<Watchlist | null>(null)
  const [addOpen, setAddOpen]       = useState(false)
  const [deleting, setDeleting]     = useState<string | null>(null)

  const cf = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', description: '', isPublic: false as boolean, userId: currentUser?._id ?? '' },
  })
  const af = useForm<AddAssetForm>({
    resolver: zodResolver(addAssetSchema),
    defaultValues: { symbol: '', notes: '' },
  })

  const load = useCallback(async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))
    try {
      const r = await watchlistsApi.list({ limit: 50 })
      setWatchlists(r.watchlists ?? [])
    } catch {
      setWatchlists([
        { _id: '1', userId: 'u1', name: 'Tech Watchlist', description: 'Top tech stocks', assets: [{ symbol: 'AAPL', addedAt: new Date().toISOString() }, { symbol: 'NVDA', addedAt: new Date().toISOString() }, { symbol: 'MSFT', addedAt: new Date().toISOString() }], isDefault: true, isPublic: false, tags: ['tech'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { _id: '2', userId: 'u1', name: 'Crypto Portfolio', description: 'My crypto holdings', assets: [{ symbol: 'BTC', addedAt: new Date().toISOString() }, { symbol: 'ETH', addedAt: new Date().toISOString() }], isDefault: false, isPublic: true, tags: ['crypto', 'defi'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (data: CreateForm) => {
    try {
      const wl = await watchlistsApi.create(data as CreateWatchlistFormData)
      setWatchlists(p => [wl, ...p])
      toast.success('Created', `"${wl.name}" is ready.`)
    } catch {
      const mock = { _id: Date.now().toString(), ...data, assets: [], isDefault: false, tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as unknown as Watchlist
      setWatchlists(p => [mock, ...p])
    }
    setCreate(false); cf.reset()
  }

  const handleDelete = async (id: string, name: string) => {
    try { setDeleting(id); await watchlistsApi.delete(id) } catch { }
    setWatchlists(p => p.filter(w => w._id !== id))
    toast.success('Deleted', `"${name}" removed.`)
    setDeleting(null)
  }

  const handleAddAsset = async (data: AddAssetForm) => {
    if (!selectedWL) return
    try {
      const updated = await watchlistsApi.addAsset(selectedWL._id, data.symbol.toUpperCase(), data.notes)
      setWatchlists(p => p.map(w => w._id === updated._id ? updated : w))
      toast.success('Added', `${data.symbol.toUpperCase()} added.`)
    } catch {
      setWatchlists(p => p.map(w => w._id === selectedWL._id ? { ...w, assets: [...w.assets, { symbol: data.symbol.toUpperCase(), addedAt: new Date().toISOString() }] } : w))
    }
    setAddOpen(false); af.reset()
  }

  const handleRemoveAsset = async (wlId: string, symbol: string) => {
    try {
      const updated = await watchlistsApi.removeAsset(wlId, symbol)
      setWatchlists(p => p.map(w => w._id === updated._id ? updated : w))
    } catch {
      setWatchlists(p => p.map(w => w._id === wlId ? { ...w, assets: w.assets.filter(a => a.symbol !== symbol) } : w))
    }
  }

  return (
    <div className="p-5 sm:p-6 max-w-[1400px] mx-auto page-enter">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Watchlists</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track your favourite financial assets</p>
        </div>
        <Button size="sm" onClick={() => setCreate(true)} icon={<Plus className="h-3.5 w-3.5" />}>New Watchlist</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : watchlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[#131D2E] border border-slate-700/50 rounded-xl text-center">
          <div className="p-4 rounded-2xl bg-slate-800/60 mb-4"><Star className="h-8 w-8 text-slate-600" /></div>
          <p className="text-sm font-medium text-slate-300">No watchlists yet</p>
          <p className="text-xs text-slate-600 mt-1">Create your first watchlist to start tracking assets.</p>
          <Button size="sm" className="mt-4" onClick={() => setCreate(true)}>Create Watchlist</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {watchlists.map((wl, i) => (
              <motion.div key={wl._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.04 }}>
                <div className="bg-[#131D2E] border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors group flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">{wl.name}</h3>
                      {wl.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{wl.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon-sm" onClick={() => { setSelectedWL(wl); setAddOpen(true) }} aria-label="Add asset">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" loading={deleting === wl._id}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(wl._id, wl.name)} aria-label="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Asset chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3 flex-1 min-h-[28px]">
                    {wl.assets.slice(0, 6).map(a => (
                      <div key={a.symbol} className="group/chip flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full px-2 py-0.5 text-xs font-medium text-slate-300 transition-colors">
                        {a.symbol}
                        <button onClick={() => handleRemoveAsset(wl._id, a.symbol)}
                          className="opacity-0 group-hover/chip:opacity-100 transition-opacity text-slate-500 hover:text-red-400">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                    {wl.assets.length > 6 && <span className="text-xs text-slate-500 px-1 py-0.5">+{wl.assets.length - 6}</span>}
                    {wl.assets.length === 0 && <span className="text-xs text-slate-600 italic">No assets yet</span>}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="slate">{wl.assets.length} assets</Badge>
                      <Badge variant={wl.isPublic ? 'blue' : 'slate'}>
                        {wl.isPublic ? <><Eye className="h-2.5 w-2.5 mr-1" />Public</> : <><EyeOff className="h-2.5 w-2.5 mr-1" />Private</>}
                      </Badge>
                    </div>
                    {wl.tags.length > 0 && (
                      <div className="flex gap-1">{wl.tags.slice(0, 2).map(t => <span key={t} className="text-[10px] text-slate-600">#{t}</span>)}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCreate(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-[#131D2E] border border-slate-700 rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.7)] z-10">
            <h2 className="text-base font-bold text-white mb-5">Create Watchlist</h2>
            <form onSubmit={cf.handleSubmit(handleCreate)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Name *</label>
                <input {...cf.register('name')} placeholder="My Portfolio" className={inputCls} />
                {cf.formState.errors.name && <p className="text-xs text-red-400 mt-1">{cf.formState.errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                <input {...cf.register('description')} placeholder="Optional…" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">User ID *</label>
                <input {...cf.register('userId')} placeholder="MongoDB ObjectID" className={inputCls} />
                {cf.formState.errors.userId && <p className="text-xs text-red-400 mt-1">{cf.formState.errors.userId.message}</p>}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...cf.register('isPublic')} className="w-4 h-4 rounded" />
                <span className="text-sm text-slate-300">Make public</span>
              </label>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="ghost" onClick={() => setCreate(false)} className="flex-1">Cancel</Button>
                <Button type="submit" loading={cf.formState.isSubmitting} className="flex-1">Create</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Asset Modal */}
      {addOpen && selectedWL && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm bg-[#131D2E] border border-slate-700 rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.7)] z-10">
            <h2 className="text-base font-bold text-white mb-1">Add Asset</h2>
            <p className="text-xs text-slate-500 mb-5">Add a symbol to "{selectedWL.name}"</p>
            <form onSubmit={af.handleSubmit(handleAddAsset)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Symbol *</label>
                <input {...af.register('symbol')} placeholder="AAPL, BTC…" className={inputCls}
                  onChange={e => af.setValue('symbol', e.target.value.toUpperCase())} />
                {af.formState.errors.symbol && <p className="text-xs text-red-400 mt-1">{af.formState.errors.symbol.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
                <input {...af.register('notes')} placeholder="Optional…" className={inputCls} />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="ghost" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" loading={af.formState.isSubmitting} className="flex-1">Add Asset</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
