import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Bell, BellOff, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { alertsApi } from '@/lib/api'
import type { Alert, AssetType, AlertCondition } from '@/types'
import { formatCurrency, formatRelativeTime, formatDate } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

const createSchema = z.object({
  userId: z.string().min(1, 'User ID required'),
  symbol: z.string().min(1, 'Symbol required').max(20),
  assetType: z.enum(['stock', 'crypto', 'forex', 'commodity', 'index']),
  condition: z.enum(['above', 'below', 'equals']),
  targetPrice: z.number().positive('Must be positive'),
  notes: z.string().max(500).optional(),
})
type CreateForm = z.infer<typeof createSchema>

const conditionColors: Record<AlertCondition, string> = {
  above: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  below: 'bg-red-500/10 text-red-600 dark:text-red-400',
  equals: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

export function Alerts() {
  const { toast, currentUser } = useApp()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [tab, setTab] = useState('active')

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      userId: currentUser?._id ?? '',
      symbol: '',
      assetType: 'stock',
      condition: 'above',
      targetPrice: 0,
      notes: '',
    },
  })

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await alertsApi.list({ limit: 100 })
      setAlerts(result.alerts ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  const handleCreate = async (data: CreateForm) => {
    try {
      const alert = await alertsApi.create({
        ...data,
        notificationMethod: { email: true, websocket: true },
      } as CreateAlertFormData)
      setAlerts((prev) => [alert, ...prev])
      setCreateOpen(false)
      form.reset()
      toast.success('Alert created', `Alert for ${data.symbol} set at ${formatCurrency(data.targetPrice)}.`)
    } catch (err) {
      toast.error('Failed to create alert', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await alertsApi.delete(id)
      setAlerts((prev) => prev.filter((a) => a._id !== id))
      toast.success('Alert deleted')
    } catch (err) {
      toast.error('Delete failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggle = async (alert: Alert) => {
    try {
      const updated = alert.isActive
        ? await alertsApi.deactivate(alert._id)
        : await alertsApi.activate(alert._id)
      setAlerts((prev) => prev.map((a) => a._id === updated._id ? updated : a))
      toast.success(updated.isActive ? 'Alert activated' : 'Alert deactivated')
    } catch (err) {
      toast.error('Failed to update alert', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const activeAlerts = alerts.filter((a) => a.isActive && !a.isTriggered)
  const triggeredAlerts = alerts.filter((a) => a.isTriggered)
  const inactiveAlerts = alerts.filter((a) => !a.isActive && !a.isTriggered)

  const displayAlerts = tab === 'active' ? activeAlerts : tab === 'triggered' ? triggeredAlerts : inactiveAlerts

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Price Alerts"
        description="Get notified when assets hit your target prices"
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)} aria-label="Create new alert">
            <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            New Alert
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Active', count: activeAlerts.length, icon: Bell, color: 'text-emerald-500' },
          { label: 'Triggered', count: triggeredAlerts.length, icon: CheckCircle2, color: 'text-blue-500' },
          { label: 'Inactive', count: inactiveAlerts.length, icon: BellOff, color: 'text-muted-foreground' },
        ].map((stat) => (
          <Card key={stat.label} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setTab(stat.label.toLowerCase())}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} aria-hidden="true" />
              <div>
                <p className="text-2xl font-bold">{loading ? '—' : stat.count}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && <ErrorState message={error} onRetry={fetchAlerts} className="mb-6" />}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active ({activeAlerts.length})</TabsTrigger>
          <TabsTrigger value="triggered">Triggered ({triggeredAlerts.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveAlerts.length})</TabsTrigger>
        </TabsList>

        {['active', 'triggered', 'inactive'].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayAlerts.length === 0 ? (
              <EmptyState
                icon={<Bell className="h-10 w-10" />}
                title={`No ${tabValue} alerts`}
                description={tabValue === 'active' ? 'Create an alert to get notified when prices move.' : `No ${tabValue} alerts found.`}
                action={tabValue === 'active' ? { label: 'Create Alert', onClick: () => setCreateOpen(true) } : undefined}
              />
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {displayAlerts.map((alert, i) => (
                    <motion.div
                      key={alert._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card className="hover:border-border/80 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`p-2 rounded-lg ${alert.isTriggered ? 'bg-blue-500/10' : alert.isActive ? 'bg-emerald-500/10' : 'bg-muted'}`}>
                                {alert.isTriggered ? (
                                  <CheckCircle2 className="h-4 w-4 text-blue-500" aria-hidden="true" />
                                ) : alert.isActive ? (
                                  <Bell className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                                ) : (
                                  <BellOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm">{alert.symbol}</span>
                                  <Badge variant="muted" className="text-[10px]">{alert.assetType}</Badge>
                                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${conditionColors[alert.condition]}`}>
                                    {alert.condition} {formatCurrency(alert.targetPrice)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  {alert.currentPrice && (
                                    <span className="text-xs text-muted-foreground">
                                      Current: {formatCurrency(alert.currentPrice)}
                                    </span>
                                  )}
                                  {alert.isTriggered && alert.triggeredAt && (
                                    <span className="text-xs text-blue-500">
                                      Triggered {formatRelativeTime(alert.triggeredAt)} at {formatCurrency(alert.triggeredPrice)}
                                    </span>
                                  )}
                                  {alert.expiresAt && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" aria-hidden="true" />
                                      Expires {formatDate(alert.expiresAt)}
                                    </span>
                                  )}
                                  {alert.notes && (
                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {alert.notes}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {!alert.isTriggered && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleToggle(alert)}
                                  aria-label={alert.isActive ? 'Deactivate alert' : 'Activate alert'}
                                >
                                  {alert.isActive ? (
                                    <BellOff className="h-3.5 w-3.5" aria-hidden="true" />
                                  ) : (
                                    <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(alert._id)}
                                loading={deletingId === alert._id}
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                aria-label={`Delete alert for ${alert.symbol}`}
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
          </TabsContent>
        ))}
      </Tabs>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Price Alert</DialogTitle>
            <DialogDescription>Get notified when an asset hits your target price.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="alert-symbol" className="text-sm font-medium">Symbol *</label>
                <Input
                  id="alert-symbol"
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
                <label htmlFor="alert-type" className="text-sm font-medium">Asset Type</label>
                <Select
                  value={form.watch('assetType')}
                  onValueChange={(v) => form.setValue('assetType', v as AssetType)}
                >
                  <SelectTrigger id="alert-type">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="alert-condition" className="text-sm font-medium">Condition</label>
                <Select
                  value={form.watch('condition')}
                  onValueChange={(v) => form.setValue('condition', v as AlertCondition)}
                >
                  <SelectTrigger id="alert-condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Price above</SelectItem>
                    <SelectItem value="below">Price below</SelectItem>
                    <SelectItem value="equals">Price equals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="alert-price" className="text-sm font-medium">Target Price *</label>
                <Input
                  id="alert-price"
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  error={!!form.formState.errors.targetPrice}
                  {...form.register('targetPrice', { valueAsNumber: true })}
                />
                {form.formState.errors.targetPrice && (
                  <p className="text-xs text-destructive" role="alert">{form.formState.errors.targetPrice.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="alert-userid" className="text-sm font-medium">User ID *</label>
              <Input
                id="alert-userid"
                {...form.register('userId')}
                placeholder="MongoDB ObjectID"
                error={!!form.formState.errors.userId}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="alert-notes" className="text-sm font-medium">Notes</label>
              <Input id="alert-notes" {...form.register('notes')} placeholder="Optional notes..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" loading={form.formState.isSubmitting}>Create Alert</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
