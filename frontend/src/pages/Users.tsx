import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { UserSearch } from '@/components/users/UserSearch'
import { UserTable } from '@/components/users/UserTable'
import { CreateUserModal } from '@/components/users/CreateUserModal'
import { useUsers } from '@/hooks/useUsers'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function Users() {
  const toast = useToast()
  const { users, loading, usingMock, page, totalPages, setPage, deleteUser, addUser } = useUsers()
  const [search, setSearch]     = useState('')
  const [createOpen, setCreate] = useState(false)
  const [deletingId, setDel]    = useState<string | null>(null)

  const filtered = users.filter(u =>
    !search ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    setDel(id)
    await deleteUser(id)
    setDel(null)
    toast.success('User deleted', `${name} has been removed.`)
  }

  return (
    <div className="p-5 sm:p-6 max-w-[1200px] mx-auto page-enter">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Users</h1>
            {usingMock && <Badge variant="amber">Demo</Badge>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Manage user accounts</p>
        </div>
        <Button size="sm" onClick={() => setCreate(true)} icon={<Plus className="h-3.5 w-3.5" />}>
          New User
        </Button>
      </div>

      <div className="mb-4">
        <UserSearch value={search} onChange={setSearch} />
      </div>

      <UserTable users={filtered} loading={loading} deletingId={deletingId} onDelete={handleDelete} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
          <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}

      <AnimatePresence>
        {createOpen && (
          <CreateUserModal
            onClose={() => setCreate(false)}
            onCreated={u => { addUser(u); toast.success('User created', `${u.firstName} ${u.lastName} added.`) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
