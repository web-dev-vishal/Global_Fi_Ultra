import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users as UsersIcon, Trash2, Edit, Search, UserCheck, UserX } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent } from '@/components/ui/card'
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
import { usersApi } from '@/lib/api'
import type { User } from '@/types'
import { formatRelativeTime, formatDate } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

const createSchema = z.object({
  email: z.string().email('Invalid email'),
  firstName: z.string().min(1, 'Required').max(50),
  lastName: z.string().min(1, 'Required').max(50),
  password: z.string().min(6, 'Min 6 characters').optional().or(z.literal('')),
})
type CreateForm = z.infer<typeof createSchema>

export function Users() {
  const { toast } = useApp()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { email: '', firstName: '', lastName: '', password: '' },
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await usersApi.list({ page, limit: 20 })
      setUsers(result.users ?? [])
      if (result.pagination) {
        setTotalPages(result.pagination.totalPages ?? 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleCreate = async (data: CreateForm) => {
    try {
      const user = await usersApi.create({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password || undefined,
      })
      setUsers((prev) => [user, ...prev])
      setCreateOpen(false)
      form.reset()
      toast.success('User created', `${user.firstName} ${user.lastName} added.`)
    } catch (err) {
      toast.error('Failed to create user', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      setDeletingId(id)
      await usersApi.delete(id)
      setUsers((prev) => prev.filter((u) => u._id !== id))
      toast.success('User deleted', `${name} has been removed.`)
    } catch (err) {
      toast.error('Delete failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredUsers = users.filter((u) =>
    search === '' ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Users"
        description="Manage user accounts"
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)} aria-label="Create new user">
            <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            New User
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-9"
          aria-label="Search users"
        />
      </div>

      {error && <ErrorState message={error} onRetry={fetchUsers} className="mb-6" />}

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-12 w-12" />}
          title={search ? 'No users found' : 'No users yet'}
          description={search ? `No users match "${search}"` : 'Create the first user account.'}
          action={!search ? { label: 'Create User', onClick: () => setCreateOpen(true) } : undefined}
        />
      ) : (
        <>
          <div className="space-y-2">
            <AnimatePresence>
              {filteredUsers.map((user, i) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="hover:border-border/80 transition-colors group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0"
                          aria-hidden="true"
                        >
                          {user.firstName[0]}{user.lastName[0]}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">
                              {user.firstName} {user.lastName}
                            </span>
                            <Badge
                              variant={user.isActive ? 'success' : 'destructive'}
                              className="text-[10px]"
                            >
                              {user.isActive ? (
                                <><UserCheck className="h-2.5 w-2.5 mr-1" aria-hidden="true" />Active</>
                              ) : (
                                <><UserX className="h-2.5 w-2.5 mr-1" aria-hidden="true" />Inactive</>
                              )}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-[10px] text-muted-foreground">
                              Currency: {user.preferences?.defaultCurrency ?? 'USD'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Joined {formatDate(user.createdAt)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Updated {formatRelativeTime(user.updatedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${user.firstName}`}
                          >
                            <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`)}
                            loading={deletingId === user._id}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            aria-label={`Delete ${user.firstName}`}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Add a new user account to the system.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="user-first" className="text-sm font-medium">First Name *</label>
                <Input
                  id="user-first"
                  {...form.register('firstName')}
                  placeholder="John"
                  error={!!form.formState.errors.firstName}
                />
                {form.formState.errors.firstName && (
                  <p className="text-xs text-destructive" role="alert">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="user-last" className="text-sm font-medium">Last Name *</label>
                <Input
                  id="user-last"
                  {...form.register('lastName')}
                  placeholder="Doe"
                  error={!!form.formState.errors.lastName}
                />
                {form.formState.errors.lastName && (
                  <p className="text-xs text-destructive" role="alert">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="user-email" className="text-sm font-medium">Email *</label>
              <Input
                id="user-email"
                type="email"
                {...form.register('email')}
                placeholder="john@example.com"
                error={!!form.formState.errors.email}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive" role="alert">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="user-password" className="text-sm font-medium">Password</label>
              <Input
                id="user-password"
                type="password"
                {...form.register('password')}
                placeholder="Optional password..."
                error={!!form.formState.errors.password}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive" role="alert">{form.formState.errors.password.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" loading={form.formState.isSubmitting}>Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
