import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertStats } from '@/components/alerts/AlertStats'
import { AlertList } from '@/components/alerts/AlertList'
import { CreateAlertModal } from '@/components/alerts/CreateAlertModal'
import { useAlerts } from '@/hooks/useAlerts'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AlertInlineAction } from '@/components/ui/AlertInlineAction'
import { useApp } from '@/context/AppContext'

export function Alerts() {
  const toast = useToast()
  const { currentUser } = useApp()
  const { alerts, loading, usingMock, deleteAlert, toggleAlert, addAlert } = useAlerts()
  const [tab, setTab]             = useState('active')
  const [createOpen, setCreate]   = useState(false)
  const [deletingId, setDel]      = useState<string | null>(null)
  const [bannerDismissed, setBanner] = useState(false)

  const byTab = tab === 'active'
    ? alerts.filter(a => a.isActive && !a.isTriggered)
    : tab === 'triggered'
    ? alerts.filter(a => a.isTriggered)
    : alerts.filter(a => !a.isActive && !a.isTriggered)

  /* Show the banner when there are triggered alerts the user hasn't seen yet */
  const triggeredCount = alerts.filter(a => a.isTriggered).length
  const showBanner = !loading && !bannerDismissed && triggeredCount > 0

  const handleDelete = async (id: string) => {
    setDel(id); await deleteAlert(id); setDel(null)
    toast.success('Alert deleted')
  }

  return (
    <div className="p-5 sm:p-6 max-w-[1200px] mx-auto page-enter animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold text-[var(--text-1)] tracking-[-0.02em]">
              Price Alerts
            </h1>
            {usingMock && <Badge variant="amber" dot>Demo</Badge>}
          </div>
          <p className="text-[12px] text-[var(--text-3)] mt-0.5">
            Get notified when assets hit your target prices
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setCreate(true)}
          icon={<Plus className="h-3.5 w-3.5" />}
        >
          New Alert
        </Button>
      </div>

      {/* ── Inline action banner (Alert4 pattern) ── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-5"
          >
            <AlertInlineAction
              variant="teal"
              message={
                triggeredCount === 1
                  ? 'One of your price alerts has been triggered!'
                  : `${triggeredCount} price alerts have been triggered!`
              }
              actionLabel="View"
              onAction={() => {
                setTab('triggered')
                setBanner(true)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats tabs ── */}
      <AlertStats alerts={alerts} activeTab={tab} onTab={setTab} loading={loading} />

      {/* ── Alert list ── */}
      <AlertList
        alerts={byTab}
        loading={loading}
        onDelete={handleDelete}
        onToggle={toggleAlert}
        deletingId={deletingId}
      />

      {/* ── Create modal ── */}
      <AnimatePresence>
        {createOpen && (
          <CreateAlertModal
            onClose={() => setCreate(false)}
            onCreated={a => {
              addAlert(a)
              toast.success('Alert created', `${a.symbol} alert is active.`)
            }}
            currentUserId={currentUser?._id}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
