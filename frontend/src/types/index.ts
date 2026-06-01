// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  fullName?: string
  isActive: boolean
  preferences: UserPreferences
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  defaultCurrency: string
  defaultStockSymbol: string
  defaultCryptoIds: string
  notifications: {
    email: boolean
    websocket: boolean
  }
}

export interface Watchlist {
  _id: string
  userId: string
  name: string
  description?: string
  assets: WatchlistAsset[]
  isDefault: boolean
  isPublic: boolean
  tags: string[]
  assetCount?: number
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface WatchlistAsset {
  symbol: string
  addedAt: string
  notes?: string
}

export interface Alert {
  _id: string
  userId: string
  symbol: string
  assetType: AssetType
  condition: AlertCondition
  targetPrice: number
  currentPrice?: number
  isActive: boolean
  isTriggered: boolean
  triggeredAt?: string
  triggeredPrice?: number
  notificationMethod: {
    email: boolean
    websocket: boolean
  }
  expiresAt?: string
  notes?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface FinancialAsset {
  _id: string
  symbol: string
  name: string
  type: AssetType
  currentPrice?: number
  currency: string
  lastUpdated?: string
  metadata?: AssetMetadata
  priceHistory: PriceHistoryEntry[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AssetMetadata {
  exchange?: string
  sector?: string
  industry?: string
  marketCap?: number
  description?: string
  website?: string
  logo?: string
}

export interface PriceHistoryEntry {
  price: number
  timestamp: string
  source: string
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type AssetType = 'stock' | 'crypto' | 'forex' | 'commodity' | 'index'
export type AlertCondition = 'above' | 'below' | 'equals'
export type SentimentType = 'bullish' | 'bearish' | 'neutral' | 'positive' | 'negative'

// ─── Financial Data Types ─────────────────────────────────────────────────────

export interface FinancialDataResponse {
  requestId: string
  timestamp: string
  status: 'success' | 'partial' | 'error' | 'cached'
  data: FinancialData
  metadata?: {
    fromCache?: boolean
    totalDuration?: number
    apiCallsMade?: number
    cacheHits?: number
  }
}

export interface FinancialData {
  stock?: StockData
  crypto?: CryptoData[]
  forex?: ForexData
  news?: NewsArticle[]
  economic?: EconomicData
}

export interface StockData {
  symbol: string
  price?: number
  change?: number
  changePercent?: number
  open?: number
  high?: number
  low?: number
  volume?: number
  marketCap?: number
  pe?: number
  eps?: number
  week52High?: number
  week52Low?: number
  name?: string
  exchange?: string
  currency?: string
  latestTradingDay?: string
  previousClose?: number
}

export interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  high_24h: number
  low_24h: number
  image?: string
  market_cap_rank?: number
  circulating_supply?: number
}

export interface ForexData {
  base: string
  rates: Record<string, number>
  timestamp?: number
}

export interface NewsArticle {
  title: string
  description?: string
  url: string
  source?: string
  publishedAt?: string
  urlToImage?: string
  author?: string
  content?: string
  sentiment?: SentimentType
}

export interface EconomicData {
  seriesId: string
  name?: string
  value?: number
  date?: string
  unit?: string
  observations?: Array<{ date: string; value: string }>
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success?: boolean
  data?: T
  error?: string | ApiError
  message?: string
  requestId?: string
  timestamp?: string
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ─── AI Types ─────────────────────────────────────────────────────────────────

export interface SentimentResult {
  sentiment: SentimentType
  confidence: number
  reasoning?: string
  keywords?: string[]
}

export interface AssetAnalysis {
  symbol: string
  trend: 'bullish' | 'bearish' | 'neutral'
  strength: number
  support?: number
  resistance?: number
  recommendation: 'buy' | 'sell' | 'hold'
  reasoning: string
  riskLevel: 'low' | 'medium' | 'high'
  timeframe?: string
}

export interface InvestmentRecommendation {
  recommendations: Array<{
    symbol: string
    action: 'buy' | 'sell' | 'hold'
    allocation?: number
    reasoning: string
    riskLevel: 'low' | 'medium' | 'high'
  }>
  summary: string
  riskProfile: string
  disclaimer?: string
}

export interface PortfolioAnalysis {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor'
  diversificationScore: number
  riskScore: number
  suggestions: string[]
  sectorBreakdown?: Record<string, number>
  summary: string
}

export interface PricePrediction {
  symbol: string
  currentPrice: number
  predictions: Array<{
    day: number
    price: number
    confidence: number
  }>
  trend: 'up' | 'down' | 'sideways'
  summary: string
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isStreaming?: boolean
}

// ─── Circuit Breaker Types ────────────────────────────────────────────────────

export interface CircuitBreakerStatus {
  service: string
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failures: number
  lastFailure?: string
  nextAttempt?: string
}

// ─── Health Types ─────────────────────────────────────────────────────────────

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  requestId?: string
  features?: {
    ai: boolean
  }
}

export interface ReadinessStatus {
  status: 'ready' | 'not_ready'
  checks: {
    database: 'connected' | 'disconnected' | 'error'
    redis: 'connected' | 'disconnected' | 'error'
    ai?: {
      enabled: boolean
      websocket: boolean
      jobQueue: boolean
    }
  }
  timestamp: string
}

// ─── WebSocket Types ──────────────────────────────────────────────────────────

export interface WebSocketState {
  connected: boolean
  socketId?: string
  inLiveStream: boolean
}

// ─── UI State Types ───────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
}

export interface LoadingState {
  isLoading: boolean
  error?: string | null
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

export interface CreateAlertFormData {
  userId: string
  symbol: string
  assetType: AssetType
  condition: AlertCondition
  targetPrice: number
  notes?: string
  expiresAt?: string
  notificationMethod: {
    email: boolean
    websocket: boolean
  }
}

export interface CreateWatchlistFormData {
  userId: string
  name: string
  description?: string
  isPublic: boolean
  tags?: string[]
}
