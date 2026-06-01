import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User, ToastMessage } from '@/types'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'
import { generateId } from '@/lib/utils'

interface AppContextValue {
  // Auth
  currentUser: User | null
  token: string | null
  setCurrentUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void

  // Theme
  isDark: boolean
  toggleTheme: () => void

  // Toast
  toasts: ToastMessage[]
  toast: {
    success: (title: string, description?: string) => string
    error: (title: string, description?: string) => string
    warning: (title: string, description?: string) => string
    info: (title: string, description?: string) => string
  }
  removeToast: (id: string) => void

  // Global loading
  isGlobalLoading: boolean
  setGlobalLoading: (loading: boolean) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { isDark, toggleTheme } = useTheme()
  const { toasts, toast, removeToast } = useToast()

  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('gfu_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem('gfu_token')
  )

  const [isGlobalLoading, setGlobalLoading] = useState(false)

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user)
    if (user) {
      localStorage.setItem('gfu_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('gfu_user')
    }
  }, [])

  const setToken = useCallback((t: string | null) => {
    setTokenState(t)
    if (t) {
      localStorage.setItem('gfu_token', t)
    } else {
      localStorage.removeItem('gfu_token')
    }
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setToken(null)
    toast.info('Signed out', 'You have been signed out successfully.')
  }, [setCurrentUser, setToken, toast])

  return (
    <AppContext.Provider
      value={{
        currentUser,
        token,
        setCurrentUser,
        setToken,
        logout,
        isDark,
        toggleTheme,
        toasts,
        toast,
        removeToast,
        isGlobalLoading,
        setGlobalLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// Re-export generateId for convenience
export { generateId }
