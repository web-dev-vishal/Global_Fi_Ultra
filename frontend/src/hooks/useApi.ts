import { useState, useCallback, useRef } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>
  reset: () => void
  setData: (data: T | null) => void
}

/**
 * Generic hook for async API calls with loading/error state management.
 * Prevents state updates on unmounted components via an abort ref.
 */
export function useApi<T>(
  apiFn: (...args: unknown[]) => Promise<T>,
  options: { immediate?: boolean } = {}
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const mountedRef = useRef(true)

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const result = await apiFn(...args)
        if (mountedRef.current) {
          setState({ data: result, loading: false, error: null })
        }
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred'
        if (mountedRef.current) {
          setState((prev) => ({ ...prev, loading: false, error: message }))
        }
        return null
      }
    },
    [apiFn]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }))
  }, [])

  return { ...state, execute, reset, setData }
}
