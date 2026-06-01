import { useEffect, useRef, useState, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { FinancialDataResponse, AIMessage } from '@/types'
import { generateId } from '@/lib/utils'

interface UseWebSocketOptions {
  autoConnect?: boolean
  joinLiveStream?: boolean
}

interface WebSocketHookReturn {
  socket: Socket | null
  connected: boolean
  socketId: string | undefined
  financialData: FinancialDataResponse | null
  systemWarnings: SystemWarning[]
  circuitBreakerChanges: CircuitBreakerChange[]
  aiMessages: AIMessage[]
  isAIStreaming: boolean
  joinLiveStream: () => void
  leaveLiveStream: () => void
  sendAIChat: (message: string, sessionId?: string) => void
  stopAIStream: () => void
  clearAIMessages: () => void
  clearWarnings: () => void
}

interface SystemWarning {
  id: string
  service: string
  message: string
  severity: string
  timestamp: string
}

interface CircuitBreakerChange {
  id: string
  service: string
  state: string
  timestamp: string
}

export function useWebSocket(options: UseWebSocketOptions = {}): WebSocketHookReturn {
  const { autoConnect = true, joinLiveStream: autoJoin = false } = options

  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [socketId, setSocketId] = useState<string | undefined>()
  const [financialData, setFinancialData] = useState<FinancialDataResponse | null>(null)
  const [systemWarnings, setSystemWarnings] = useState<SystemWarning[]>([])
  const [circuitBreakerChanges, setCircuitBreakerChanges] = useState<CircuitBreakerChange[]>([])
  const [aiMessages, setAIMessages] = useState<AIMessage[]>([])
  const [isAIStreaming, setIsAIStreaming] = useState(false)
  const currentSessionRef = useRef<string | null>(null)

  useEffect(() => {
    if (!autoConnect) return

    const socket = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      setSocketId(socket.id)
      if (autoJoin) {
        socket.emit('join-live-stream', {})
      }
    })

    socket.on('disconnect', () => {
      setConnected(false)
      setSocketId(undefined)
    })

    socket.on('connection-acknowledged', (data: { socketId: string; timestamp: string }) => {
      setSocketId(data.socketId)
    })

    // Financial data events
    socket.on('financial-data-update', (data: FinancialDataResponse) => {
      setFinancialData(data)
    })

    socket.on('system-warning', (warning: Omit<SystemWarning, 'id'>) => {
      setSystemWarnings((prev) => [
        { ...warning, id: generateId() },
        ...prev.slice(0, 9),
      ])
    })

    socket.on('circuit-breaker-state-change', (change: Omit<CircuitBreakerChange, 'id'>) => {
      setCircuitBreakerChanges((prev) => [
        { ...change, id: generateId() },
        ...prev.slice(0, 9),
      ])
    })

    // AI streaming events
    socket.on('ai:stream:start', ({ sessionId }: { sessionId: string }) => {
      currentSessionRef.current = sessionId
      setIsAIStreaming(true)
      setAIMessages((prev) => [
        ...prev,
        {
          id: sessionId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          isStreaming: true,
        },
      ])
    })

    socket.on('ai:stream:chunk', ({ sessionId, chunk }: { sessionId: string; chunk: string }) => {
      setAIMessages((prev) =>
        prev.map((msg) =>
          msg.id === sessionId
            ? { ...msg, content: msg.content + chunk }
            : msg
        )
      )
    })

    socket.on('ai:stream:complete', ({ sessionId, fullResponse }: { sessionId: string; fullResponse: string }) => {
      setIsAIStreaming(false)
      currentSessionRef.current = null
      setAIMessages((prev) =>
        prev.map((msg) =>
          msg.id === sessionId
            ? { ...msg, content: fullResponse, isStreaming: false }
            : msg
        )
      )
    })

    socket.on('ai:stream:stopped', () => {
      setIsAIStreaming(false)
      currentSessionRef.current = null
      setAIMessages((prev) =>
        prev.map((msg) =>
          msg.isStreaming ? { ...msg, isStreaming: false } : msg
        )
      )
    })

    socket.on('ai:error', ({ error, sessionId }: { error: string; sessionId?: string }) => {
      setIsAIStreaming(false)
      if (sessionId) {
        setAIMessages((prev) =>
          prev.map((msg) =>
            msg.id === sessionId
              ? { ...msg, content: `Error: ${error}`, isStreaming: false }
              : msg
          )
        )
      }
    })

    socket.on('ai:insight', (data: { insight: unknown; timestamp: number }) => {
      console.log('AI insight received:', data)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [autoConnect, autoJoin])

  const joinLiveStream = useCallback(() => {
    socketRef.current?.emit('join-live-stream', {})
  }, [])

  const leaveLiveStream = useCallback(() => {
    socketRef.current?.emit('leave-live-stream', {})
  }, [])

  const sendAIChat = useCallback((message: string, sessionId?: string) => {
    if (!socketRef.current?.connected) return
    const sid = sessionId ?? generateId()
    // Add user message
    setAIMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
      },
    ])
    socketRef.current.emit('ai:chat', { message, sessionId: sid })
  }, [])

  const stopAIStream = useCallback(() => {
    socketRef.current?.emit('ai:stream:stop')
  }, [])

  const clearAIMessages = useCallback(() => {
    setAIMessages([])
  }, [])

  const clearWarnings = useCallback(() => {
    setSystemWarnings([])
    setCircuitBreakerChanges([])
  }, [])

  return {
    socket: socketRef.current,
    connected,
    socketId,
    financialData,
    systemWarnings,
    circuitBreakerChanges,
    aiMessages,
    isAIStreaming,
    joinLiveStream,
    leaveLiveStream,
    sendAIChat,
    stopAIStream,
    clearAIMessages,
    clearWarnings,
  }
}
