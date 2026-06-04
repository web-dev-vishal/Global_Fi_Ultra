// ─── Mock Data — used when backend is unreachable ───────────────────────────

export interface MockStock {
  symbol: string; name: string; price: number; change: number; changePercent: number;
  open: number; high: number; low: number; volume: number; previousClose: number;
  pe?: number; week52High?: number; week52Low?: number;
}

export interface MockCrypto {
  id: string; symbol: string; name: string; current_price: number;
  price_change_percentage_24h: number; market_cap: number; total_volume: number;
  high_24h: number; low_24h: number; image: string; market_cap_rank: number;
}

export interface MockNewsArticle {
  title: string; description: string; url: string;
  source: string; publishedAt: string;
}

export interface MockAlert {
  _id: string; userId: string; symbol: string; assetType: string;
  condition: 'above' | 'below' | 'equals'; targetPrice: number;
  currentPrice: number; isActive: boolean; isTriggered: boolean;
  triggeredAt?: string; triggeredPrice?: number; notes?: string;
  createdAt: string; updatedAt: string;
}

export interface MockUser {
  _id: string; email: string; firstName: string; lastName: string;
  isActive: boolean; preferences: {
    defaultCurrency: string; defaultStockSymbol: string;
    notifications: { email: boolean; websocket: boolean };
  };
  createdAt: string; updatedAt: string;
}

export interface MockCircuitBreaker {
  service: string; state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; failures: number;
}

export interface MockHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'; timestamp: string;
  features: { ai: boolean };
}

export interface MockAsset {
  _id: string; symbol: string; name: string; type: string;
  currentPrice: number; currency: string; lastUpdated: string;
  isActive: boolean; metadata?: { exchange?: string; sector?: string; };
}

// ─── Stock ──────────────────────────────────────────────────────────────────
export const MOCK_STOCK: MockStock = {
  symbol: 'AAPL', name: 'Apple Inc.', price: 189.30, change: 2.45,
  changePercent: 1.31, open: 187.20, high: 190.15, low: 186.80,
  volume: 54_320_000, previousClose: 186.85, pe: 31.2,
  week52High: 199.62, week52Low: 143.90,
}

// ─── Cryptos ────────────────────────────────────────────────────────────────
export const MOCK_CRYPTOS: MockCrypto[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 67_842, price_change_percentage_24h: 2.14, market_cap: 1_332_000_000_000, total_volume: 28_400_000_000, high_24h: 68_500, low_24h: 66_200, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', market_cap_rank: 1 },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 3_521, price_change_percentage_24h: -0.87, market_cap: 423_000_000_000, total_volume: 14_200_000_000, high_24h: 3_590, low_24h: 3_460, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', market_cap_rank: 2 },
  { id: 'solana', symbol: 'SOL', name: 'Solana', current_price: 172.4, price_change_percentage_24h: 3.62, market_cap: 79_800_000_000, total_volume: 3_900_000_000, high_24h: 176, low_24h: 168, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', market_cap_rank: 5 },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', current_price: 0.484, price_change_percentage_24h: 1.25, market_cap: 17_000_000_000, total_volume: 420_000_000, high_24h: 0.492, low_24h: 0.476, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png', market_cap_rank: 9 },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', current_price: 0.612, price_change_percentage_24h: -1.45, market_cap: 34_500_000_000, total_volume: 1_200_000_000, high_24h: 0.624, low_24h: 0.601, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', market_cap_rank: 7 },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', current_price: 0.162, price_change_percentage_24h: 5.3, market_cap: 23_200_000_000, total_volume: 1_800_000_000, high_24h: 0.168, low_24h: 0.154, image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', market_cap_rank: 8 },
]

// ─── Forex ──────────────────────────────────────────────────────────────────
export const MOCK_FOREX = {
  base: 'USD',
  rates: { EUR: 0.9248, GBP: 0.7921, JPY: 154.32, CAD: 1.3641, AUD: 1.5387, CHF: 0.8971, CNY: 7.2451, INR: 83.42, BRL: 4.9812, MXN: 17.06 },
}

// ─── News ────────────────────────────────────────────────────────────────────
export const MOCK_NEWS: MockNewsArticle[] = [
  { title: 'Federal Reserve Holds Rates Steady Amid Inflation Concerns', description: 'The Fed maintained its benchmark rate in the 5.25–5.5% range as officials await further evidence of cooling inflation.', url: '#', source: 'Reuters', publishedAt: new Date(Date.now() - 3_600_000).toISOString() },
  { title: 'Bitcoin Surges Past $67,000 Amid ETF Inflow Optimism', description: 'Bitcoin climbed 2.1% after spot ETFs reported their strongest single-day inflow of the month.', url: '#', source: 'CoinDesk', publishedAt: new Date(Date.now() - 7_200_000).toISOString() },
  { title: 'Apple Reports Record Q3 Revenue on Services Growth', description: 'Apple beat Wall Street estimates with $97.8B in revenue, driven by a 33% jump in services.', url: '#', source: 'Bloomberg', publishedAt: new Date(Date.now() - 10_800_000).toISOString() },
  { title: 'S&P 500 Closes at All-Time High as Tech Stocks Rally', description: 'The benchmark index ended the session at a record 5,412, led by semiconductors and cloud infrastructure names.', url: '#', source: 'MarketWatch', publishedAt: new Date(Date.now() - 18_000_000).toISOString() },
  { title: 'NVIDIA Q2 Earnings: Revenue Triples on AI Chip Demand', description: "NVIDIA posted $30B in quarterly revenue, up 122% year-over-year, as demand for AI accelerators remains insatiable.", url: '#', source: 'TechCrunch', publishedAt: new Date(Date.now() - 28_800_000).toISOString() },
]

// ─── Economic ────────────────────────────────────────────────────────────────
export const MOCK_ECONOMIC = { seriesId: 'GDP', name: 'Gross Domestic Product', value: 27.36, unit: 'Trillion USD', date: '2024-Q1' }

// ─── Alerts ──────────────────────────────────────────────────────────────────
export const MOCK_ALERTS: MockAlert[] = [
  { _id: '1', userId: 'u1', symbol: 'AAPL', assetType: 'stock', condition: 'above', targetPrice: 195, currentPrice: 189.30, isActive: true, isTriggered: false, notes: 'Breakout target', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() },
  { _id: '2', userId: 'u1', symbol: 'BTC', assetType: 'crypto', condition: 'below', targetPrice: 60000, currentPrice: 67842, isActive: true, isTriggered: false, notes: 'Dip buy zone', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString() },
  { _id: '3', userId: 'u1', symbol: 'ETH', assetType: 'crypto', condition: 'above', targetPrice: 3400, currentPrice: 3521, isActive: false, isTriggered: true, triggeredAt: new Date(Date.now() - 3600000).toISOString(), triggeredPrice: 3405, createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date().toISOString() },
  { _id: '4', userId: 'u1', symbol: 'TSLA', assetType: 'stock', condition: 'below', targetPrice: 200, currentPrice: 218.5, isActive: true, isTriggered: false, createdAt: new Date(Date.now() - 432000000).toISOString(), updatedAt: new Date().toISOString() },
  { _id: '5', userId: 'u1', symbol: 'SOL', assetType: 'crypto', condition: 'above', targetPrice: 180, currentPrice: 172.4, isActive: false, isTriggered: false, createdAt: new Date(Date.now() - 518400000).toISOString(), updatedAt: new Date().toISOString() },
]

// ─── Users ───────────────────────────────────────────────────────────────────
export const MOCK_USERS: MockUser[] = [
  { _id: 'u1', email: 'alice@globalfi.com', firstName: 'Alice', lastName: 'Johnson', isActive: true, preferences: { defaultCurrency: 'USD', defaultStockSymbol: 'AAPL', notifications: { email: true, websocket: true } }, createdAt: new Date(Date.now() - 7776000000).toISOString(), updatedAt: new Date().toISOString() },
  { _id: 'u2', email: 'bob@globalfi.com', firstName: 'Bob', lastName: 'Martinez', isActive: true, preferences: { defaultCurrency: 'USD', defaultStockSymbol: 'TSLA', notifications: { email: true, websocket: false } }, createdAt: new Date(Date.now() - 5184000000).toISOString(), updatedAt: new Date().toISOString() },
  { _id: 'u3', email: 'carol@example.com', firstName: 'Carol', lastName: 'Wang', isActive: false, preferences: { defaultCurrency: 'EUR', defaultStockSymbol: 'IBM', notifications: { email: false, websocket: false } }, createdAt: new Date(Date.now() - 2592000000).toISOString(), updatedAt: new Date().toISOString() },
  { _id: 'u4', email: 'david@example.com', firstName: 'David', lastName: 'Patel', isActive: true, preferences: { defaultCurrency: 'GBP', defaultStockSymbol: 'NVDA', notifications: { email: true, websocket: true } }, createdAt: new Date(Date.now() - 1296000000).toISOString(), updatedAt: new Date().toISOString() },
]

// ─── Assets ──────────────────────────────────────────────────────────────────
export const MOCK_ASSETS: MockAsset[] = [
  { _id: 'a1', symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', currentPrice: 189.30, currency: 'USD', lastUpdated: new Date().toISOString(), isActive: true, metadata: { exchange: 'NASDAQ', sector: 'Technology' } },
  { _id: 'a2', symbol: 'NVDA', name: 'NVIDIA Corp', type: 'stock', currentPrice: 1208.88, currency: 'USD', lastUpdated: new Date().toISOString(), isActive: true, metadata: { exchange: 'NASDAQ', sector: 'Semiconductors' } },
  { _id: 'a3', symbol: 'BTC', name: 'Bitcoin', type: 'crypto', currentPrice: 67842, currency: 'USD', lastUpdated: new Date().toISOString(), isActive: true },
  { _id: 'a4', symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', currentPrice: 218.50, currency: 'USD', lastUpdated: new Date().toISOString(), isActive: true, metadata: { exchange: 'NASDAQ', sector: 'EV / Auto' } },
  { _id: 'a5', symbol: 'ETH', name: 'Ethereum', type: 'crypto', currentPrice: 3521, currency: 'USD', lastUpdated: new Date().toISOString(), isActive: true },
  { _id: 'a6', symbol: 'MSFT', name: 'Microsoft Corp', type: 'stock', currentPrice: 429.12, currency: 'USD', lastUpdated: new Date().toISOString(), isActive: true, metadata: { exchange: 'NASDAQ', sector: 'Technology' } },
]

// ─── Circuit breakers ────────────────────────────────────────────────────────
export const MOCK_CIRCUIT_BREAKERS: MockCircuitBreaker[] = [
  { service: 'alpha_vantage', state: 'CLOSED', failures: 0 },
  { service: 'coingecko', state: 'CLOSED', failures: 0 },
  { service: 'exchangerate_api', state: 'CLOSED', failures: 1 },
  { service: 'newsapi', state: 'HALF_OPEN', failures: 2 },
  { service: 'fred', state: 'CLOSED', failures: 0 },
  { service: 'finnhub', state: 'OPEN', failures: 3 },
]

// ─── Health ──────────────────────────────────────────────────────────────────
export const MOCK_HEALTH: MockHealthStatus = {
  status: 'healthy', timestamp: new Date().toISOString(), features: { ai: true },
}

// ─── Chart sparkline data ─────────────────────────────────────────────────────

// Card 0 — Stock price (upward trend)
export const MOCK_SPARKLINE = Array.from({ length: 24 }, (_, i) => ({
  t: i,
  v: 67000 + Math.sin(i * 0.4) * 1500 + i * 60,
}))

// Card 1 — Open / Prev close (steady with slight dip)
export const MOCK_SPARKLINE_OPEN = Array.from({ length: 24 }, (_, i) => ({
  t: i,
  v: 187 + Math.sin(i * 0.6 + 1) * 1.2 - i * 0.04,
}))

// Card 2 — 52W High (strong upward, bullish)
export const MOCK_SPARKLINE_52W = Array.from({ length: 24 }, (_, i) => ({
  t: i,
  v: 155 + i * 2.1 + Math.sin(i * 0.3) * 3,
}))

// Card 3 — Volume (spiky bar-like pattern)
export const MOCK_SPARKLINE_VOLUME = Array.from({ length: 24 }, (_, i) => ({
  t: i,
  v: 40_000_000 + Math.abs(Math.sin(i * 0.9)) * 20_000_000 + (i % 4 === 0 ? 15_000_000 : 0),
}))

// Card 4 — P/E Ratio (gradually declining — cheaper over time)
export const MOCK_SPARKLINE_PE = Array.from({ length: 24 }, (_, i) => ({
  t: i,
  v: 34 - i * 0.12 + Math.sin(i * 0.5) * 0.8,
}))

export const MOCK_PORTFOLIO_CHART = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  value: 100000 + i * 800 + Math.sin(i * 0.3) * 4000 + (Math.random() - 0.4) * 3000,
}))

// Per-range portfolio data sets
export const MOCK_PORTFOLIO_CHART_1D = Array.from({ length: 24 }, (_, i) => ({
  label: `${i}:00`,
  value: 124000 + Math.sin(i * 0.5) * 1200 + (Math.random() - 0.45) * 800,
}))

export const MOCK_PORTFOLIO_CHART_1W = Array.from({ length: 7 }, (_, i) => ({
  label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  value: 120000 + i * 600 + Math.sin(i * 0.8) * 2000 + (Math.random() - 0.4) * 1500,
}))

export const MOCK_PORTFOLIO_CHART_1M = Array.from({ length: 30 }, (_, i) => ({
  label: `Day ${i + 1}`,
  value: 100000 + i * 800 + Math.sin(i * 0.3) * 4000 + (Math.random() - 0.4) * 3000,
}))

export const MOCK_PORTFOLIO_CHART_3M = Array.from({ length: 12 }, (_, i) => ({
  label: `Wk ${i + 1}`,
  value: 95000 + i * 2200 + Math.sin(i * 0.4) * 5000 + (Math.random() - 0.38) * 3500,
}))

export const MOCK_PORTFOLIO_CHART_1Y = Array.from({ length: 12 }, (_, i) => ({
  label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  value: 82000 + i * 3800 + Math.sin(i * 0.5) * 7000 + (Math.random() - 0.36) * 4500,
}))
