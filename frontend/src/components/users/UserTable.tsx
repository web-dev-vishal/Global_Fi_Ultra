import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, UserX } from 'lucide-react'
import type { User } from '@/types'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

function fmtDate(s: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(s))
}

interface UserTableProps {
  users: User[]; loading?: boolean; deletingId?: string | null
  onDelete: (id: string, name: string) => void
}

export function UserTable({ users, loading, deletingId, onDelete }: UserTableProps) {
  if (loading) return (
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl px-5 py-2">
      {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
    </div>
  )

  if (users.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl">
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 mb-4">
        <UserX className="h-8 w-8 text-slate-500 dark:text-[var(--text-3)]" />
      </div>
      <p className="text-sm font-medium text-[var(--text-1)]">No users found</p>
    </div>
  )

  return (
    <div className="bg-white dark:bg-[#131D2E] border border-slate-200/80 dark:border-[var(--border)] rounded-xl overflow-hidden">
      <table className="w-full text-sm" aria-label="User list">
        {/* Table header — Level 3 */}
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800/60">
            {['User', 'Email', 'Currency', 'Status', 'Joined', ''].map((h, i) => (
              <th
                key={i}
                className={`py-3 text-xs font-medium text-[var(--text-3)] uppercase tracking-wider
                  ${i === 0 ? 'text-left px-5' : i === 5 ? 'px-5 w-10' : 'text-left px-4'}
                  ${i === 2 || i === 4 ? 'hidden sm:table-cell' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {users.map((u, idx) => (
              <motion.tr
                key={u._id}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }} transition={{ delay: idx * 0.025 }}
                className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold text-xs shrink-0">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <span className="font-semibold text-[var(--text-1)]">{u.firstName} {u.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--text-2)] text-xs truncate max-w-[160px]">{u.email}</td>
                <td className="px-4 py-3 text-[var(--text-2)] text-xs hidden sm:table-cell">
                  {u.preferences?.defaultCurrency ?? 'USD'}
                </td>
                <td className="px-4 py-3">
                  {/* Status badge per spec */}
                  <Badge variant={u.isActive ? 'green' : 'red'} dot>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[var(--text-3)] text-xs hidden sm:table-cell">
                  {fmtDate(u.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <Button
                    variant="ghost" size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10 transition-all"
                    loading={deletingId === u._id}
                    onClick={() => onDelete(u._id, `${u.firstName} ${u.lastName}`)}
                    aria-label={`Delete ${u.firstName}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}
