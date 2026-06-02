import { useState, useCallback } from 'react'
import type { Theme } from '@/types'

// This design uses a fixed dark palette (#3b444b background).
// Theme toggle is kept for user preference but the palette is always dark-slate.
export function useTheme() {
  const [theme] = useState<Theme>('dark')

  const setTheme = useCallback((_t: Theme) => {
    // palette is fixed — no-op
  }, [])

  const toggleTheme = useCallback(() => {
    // palette is fixed — no-op
  }, [])

  return { theme, setTheme, toggleTheme, isDark: true }
}
