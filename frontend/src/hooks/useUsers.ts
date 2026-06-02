import { useState, useEffect, useCallback } from 'react'
import { usersApi } from '@/lib/api'
import type { User } from '@/types'
import { MOCK_USERS } from '@/data/mockData'

export function useUsers() {
  const [users, setUsers]         = useState<User[]>([])
  const [loading, setLoading]     = useState(true)
  const [usingMock, setUsingMock] = useState(false)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotal]    = useState(1)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))
    try {
      const r = await usersApi.list({ page: p, limit: 20 })
      setUsers(r.users ?? [])
      setTotal(r.pagination?.totalPages ?? 1)
      setUsingMock(false)
    } catch {
      setUsers(MOCK_USERS as unknown as User[])
      setTotal(1)
      setUsingMock(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const deleteUser = useCallback(async (id: string) => {
    try { await usersApi.delete(id) } catch { /* optimistic */ }
    setUsers(p => p.filter(u => u._id !== id))
  }, [])

  const addUser = useCallback((user: User) => setUsers(p => [user, ...p]), [])

  return { users, loading, usingMock, page, totalPages, setPage, reload: load, deleteUser, addUser }
}
