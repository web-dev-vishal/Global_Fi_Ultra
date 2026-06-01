import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type {
  User,
  Watchlist,
  Alert,
  FinancialAsset,
  FinancialDataResponse,
  HealthStatus,
  ReadinessStatus,
  CircuitBreakerStatus,
  SentimentResult,
  AssetAnalysis,
  InvestmentRecommendation,
  PortfolioAnalysis,
  PricePrediction,
  PaginatedResponse,
  CreateAlertFormData,
  CreateWatchlistFormData,
} from '@/types'

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gfu_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => api.get<HealthStatus>('/health/health').then((r) => r.data),
  readiness: () => api.get<ReadinessStatus>('/health/readiness').then((r) => r.data),
}

// ─── Financial ────────────────────────────────────────────────────────────────

export interface LiveDataParams {
  symbol?: string
  crypto?: string
  currency?: string
  newsQuery?: string
  fredSeries?: string
}

export const financialApi = {
  getLive: (params?: LiveDataParams) =>
    api.get<FinancialDataResponse>('/financial/live', { params }).then((r) => r.data),
  getCached: () =>
    api.get<FinancialDataResponse>('/financial/cached').then((r) => r.data),
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface ListUsersParams {
  page?: number
  limit?: number
  isActive?: boolean
  sort?: string
}

export interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  password?: string
  preferences?: Partial<User['preferences']>
}

export interface LoginData {
  email: string
  password: string
}

export const usersApi = {
  list: (params?: ListUsersParams) =>
    api.get<{ users: User[]; pagination: PaginatedResponse<User>['pagination'] }>('/users', { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<{ user: User }>(`/users/${id}`).then((r) => r.data.user),
  create: (data: CreateUserData) =>
    api.post<{ user: User }>('/users', data).then((r) => r.data.user),
  login: (data: LoginData) =>
    api.post<{ token: string; user: User }>('/users/login', data).then((r) => r.data),
  update: (id: string, data: Partial<CreateUserData>) =>
    api.put<{ user: User }>(`/users/${id}`, data).then((r) => r.data.user),
  patch: (id: string, data: Partial<CreateUserData>) =>
    api.patch<{ user: User }>(`/users/${id}`, data).then((r) => r.data.user),
  delete: (id: string) =>
    api.delete<{ message: string }>(`/users/${id}`).then((r) => r.data),
}

// ─── Watchlists ───────────────────────────────────────────────────────────────

export interface ListWatchlistsParams {
  userId?: string
  page?: number
  limit?: number
  isPublic?: boolean
  sort?: string
}

export const watchlistsApi = {
  list: (params?: ListWatchlistsParams) =>
    api.get<{ watchlists: Watchlist[]; pagination: PaginatedResponse<Watchlist>['pagination'] }>('/watchlists', { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<{ watchlist: Watchlist }>(`/watchlists/${id}`).then((r) => r.data.watchlist),
  create: (data: CreateWatchlistFormData) =>
    api.post<{ watchlist: Watchlist }>('/watchlists', data).then((r) => r.data.watchlist),
  update: (id: string, data: Partial<CreateWatchlistFormData>) =>
    api.put<{ watchlist: Watchlist }>(`/watchlists/${id}`, data).then((r) => r.data.watchlist),
  delete: (id: string) =>
    api.delete<{ message: string }>(`/watchlists/${id}`).then((r) => r.data),
  addAsset: (id: string, symbol: string, notes?: string) =>
    api.post<{ watchlist: Watchlist }>(`/watchlists/${id}/assets`, { symbol, notes }).then((r) => r.data.watchlist),
  removeAsset: (id: string, symbol: string) =>
    api.delete<{ watchlist: Watchlist }>(`/watchlists/${id}/assets/${symbol}`).then((r) => r.data.watchlist),
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export interface ListAlertsParams {
  userId?: string
  symbol?: string
  isActive?: boolean
  isTriggered?: boolean
  page?: number
  limit?: number
  sort?: string
}

export const alertsApi = {
  list: (params?: ListAlertsParams) =>
    api.get<{ alerts: Alert[]; pagination: PaginatedResponse<Alert>['pagination'] }>('/alerts', { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<{ alert: Alert }>(`/alerts/${id}`).then((r) => r.data.alert),
  create: (data: CreateAlertFormData) =>
    api.post<{ alert: Alert }>('/alerts', data).then((r) => r.data.alert),
  update: (id: string, data: Partial<CreateAlertFormData>) =>
    api.put<{ alert: Alert }>(`/alerts/${id}`, data).then((r) => r.data.alert),
  delete: (id: string) =>
    api.delete<{ message: string }>(`/alerts/${id}`).then((r) => r.data),
  activate: (id: string) =>
    api.patch<{ alert: Alert }>(`/alerts/${id}/activate`).then((r) => r.data.alert),
  deactivate: (id: string) =>
    api.patch<{ alert: Alert }>(`/alerts/${id}/deactivate`).then((r) => r.data.alert),
}

// ─── Assets ───────────────────────────────────────────────────────────────────

export interface ListAssetsParams {
  type?: string
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
  sort?: string
}

export const assetsApi = {
  list: (params?: ListAssetsParams) =>
    api.get<{ assets: FinancialAsset[]; pagination: PaginatedResponse<FinancialAsset>['pagination'] }>('/assets', { params }).then((r) => r.data),
  get: (symbol: string) =>
    api.get<{ asset: FinancialAsset }>(`/assets/${symbol}`).then((r) => r.data.asset),
  getLive: (symbol: string) =>
    api.get<{ symbol: string; assetInfo: FinancialAsset; liveData: unknown }>(`/assets/${symbol}/live`).then((r) => r.data),
  create: (data: Partial<FinancialAsset>) =>
    api.post<{ asset: FinancialAsset }>('/assets', data).then((r) => r.data.asset),
  update: (symbol: string, data: Partial<FinancialAsset>) =>
    api.put<{ asset: FinancialAsset }>(`/assets/${symbol}`, data).then((r) => r.data.asset),
  delete: (symbol: string) =>
    api.delete<{ message: string }>(`/assets/${symbol}`).then((r) => r.data),
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export const aiApi = {
  analyzeSentiment: (text: string, type?: string) =>
    api.post<{ success: boolean; data: SentimentResult }>('/ai/sentiment', { text, type }).then((r) => r.data),
  analyzeAsset: (symbol: string, priceData: unknown) =>
    api.post<{ success: boolean; data: AssetAnalysis }>('/ai/analyze', { symbol, priceData }).then((r) => r.data),
  compareAssets: (assets: unknown[]) =>
    api.post<{ success: boolean; data: unknown }>('/ai/compare', { assets }).then((r) => r.data),
  generateRecommendation: (userProfile: unknown, marketData: unknown) =>
    api.post<{ success: boolean; data: InvestmentRecommendation; disclaimer: string }>('/ai/recommend', { userProfile, marketData }).then((r) => r.data),
  analyzePortfolio: (holdings: unknown[], marketConditions?: unknown) =>
    api.post<{ success: boolean; data: PortfolioAnalysis }>('/ai/portfolio', { holdings, marketConditions }).then((r) => r.data),
  predictPrice: (symbol: string, historicalData: unknown, daysAhead?: number) =>
    api.post<{ success: boolean; data: PricePrediction; disclaimer: string }>('/ai/predict', { symbol, historicalData, daysAhead }).then((r) => r.data),
  explainMovement: (symbol: string, changePercent: number, recentNews?: unknown[]) =>
    api.post<{ success: boolean; data: { explanation: string } }>('/ai/explain', { symbol, changePercent, recentNews }).then((r) => r.data),
  analyzeNewsImpact: (newsArticles: unknown[]) =>
    api.post<{ success: boolean; data: unknown }>('/ai/news/impact', { newsArticles }).then((r) => r.data),
  generateNewsSummary: (newsArticles: unknown[], maxLength?: number) =>
    api.post<{ success: boolean; data: { summary: string } }>('/ai/news/summary', { newsArticles, maxLength }).then((r) => r.data),
  getQueueStats: () =>
    api.get<{ success: boolean; data: { pending: number; processing: number; completed: number } }>('/ai/jobs/stats').then((r) => r.data),
}

// ─── Status ───────────────────────────────────────────────────────────────────

export const statusApi = {
  circuitBreakers: () =>
    api.get<{ circuitBreakers: CircuitBreakerStatus[] }>('/status/circuit-breakers').then((r) => r.data),
  rateLimits: () =>
    api.get<{ rateLimits: Record<string, unknown> }>('/status/rate-limits').then((r) => r.data),
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  clearCache: () =>
    api.post<{ success: boolean; message: string }>('/admin/cache/clear').then((r) => r.data),
  getMetrics: (hours?: number) =>
    api.get<{ period: string; metrics: unknown }>('/admin/metrics', { params: { hours } }).then((r) => r.data),
  getLogs: (limit?: number) =>
    api.get<{ count: number; logs: unknown[] }>('/admin/logs', { params: { limit } }).then((r) => r.data),
}

export default api
export type { AxiosRequestConfig }
