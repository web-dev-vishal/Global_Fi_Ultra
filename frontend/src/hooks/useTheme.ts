import { useState, useEffect, useCallback } from 'react'
import type { Theme } from '@/types'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('gfu_theme') as Theme | null
    return stored ?? 'dark'
  })

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement
    const isDark =
      t === 'dark' ||
      (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.classList.toggle('dark', isDark)
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, applyTheme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem('gfu_theme', t)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return { theme, setTheme, toggleTheme, isDark }
}
