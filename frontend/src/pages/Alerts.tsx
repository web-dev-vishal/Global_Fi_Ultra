import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { AlertStats } from '@/components/alerts/AlertStats'
import { AlertList } from '@/components/alerts/AlertList'
import { CreateAlertModal } from '@/components/alerts/CreateAlertModal'
import { useAlerts } from '@/hooks/useAlerts'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useApp } from '@/context/AppContext'

export function Alerts() {
  const toast = useToast()
  const { currentUser } = useApp()
  const { alerts, loading, usingMock, deleteAlert, toggleAlert, addAlert } = useAlerts()
  const [tab, setTab]           = useState('active')
  const [createOpen, setCreate] = useState(false)
  const [deletingId, setDel]    = useState<string | null>(null)

  const byTab = tab === 'active'
    ? alerts.filter(a => a.isActive && !a.isTriggered)
    : tab === 'triggered'
    ? alerts.filter(a => a.isTriggered)
    : alerts.filter(a => !a.isActive && !a.isTriggered)

  const handleDelete = async (id: string) => {
    setDel(id)
    await deleteAlert(id)
    setDel(null)
    toast.success('Alert deleted')
  }

  return (
    <div className="p-5 sm:p-6 max-w-[1200px] mx-auto page-enter">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Price Alerts</h1>
            {usingMock && <Badge variant="amber">Demo</Badge>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Get notified when assets hit your target prices</p>
        </div>
        <Button size="sm" onClick={() => setCreate(true)} icon={<Plus className="h-3.5 w-3.5" />}>
          New Alert
        </Button>
      </div>

      <AlertStats alerts={alerts} activeTab={tab} onTab={setTab} loading={loading} />
      <AlertList alerts={byTab} loading={loading} onDelete={handleDelete} onToggle={toggleAlert} deletingId={deletingId} />

      <AnimatePresence>
        {createOpen && (
          <CreateAlertModal
            onClose={() => setCreate(false)}
            onCreated={a => { addAlert(a); toast.success('Alert created', `${a.symbol} alert is active.`) }}
            currentUserId={currentUser?._id}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
