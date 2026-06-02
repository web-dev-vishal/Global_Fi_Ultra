import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}
      role="status"
    >
      {icon && (
        <div className="mb-4 p-4 rounded-2xl bg-slate-800/60 text-slate-500" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-slate-200 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">{description}</p>
      )}
      {action && (
        <Button size="sm" onClick={action.onClick}>{action.label}</Button>
      )}
    </motion.div>
  )
}
