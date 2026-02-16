/**
 * Global-Fi Ultra - Environment Configuration
 * 
 * Centralized, Zod-validated environment variable loading. This module is
 * the single source of truth for all configuration values in the application.
 * 
 * How it works:
 * 1. `dotenv/config` loads `.env` file into `process.env`
 * 2. Zod schema validates every variable with type coercion and defaults
 * 3. If validation fails, the process exits immediately with error details
 * 4. On success, exports a structured `config` object for type-safe access
 * 
 * Adding New Variables:
 * 1. Add the variable to the `envSchema` Zod object below
 * 2. Add it to the appropriate section in the `config` object
 * 3. Add it to `.env.example` with a description
 * 
 * Environment Variable Groups:
 * ──────────────────────────────────────────────────────────────────────
 * | Group            | Prefix/Key               | Required?            |
 * |------------------|--------------------------|----------------------|
 * | Server           | NODE_ENV, PORT, HOST     | Defaults provided    |
 * | MongoDB          | MONGODB_*                | URI required         |
 * | Redis            | REDIS_*                  | Defaults provided    |
 * | API Keys         | *_API_KEY                | Defaults provided    |
 * | Security         | CORS_*, RATE_LIMIT_*     | Defaults provided    |
 * | Circuit Breaker  | CIRCUIT_BREAKER_*        | Defaults provided    |
 * | Logging          | LOG_*                    | Defaults provided    |
 * | Socket.io        | SOCKET_IO_*              | Defaults provided    |
 * | Features         | ENABLE_*                 | Defaults provided    |
 * | RabbitMQ         | RABBITMQ_*               | Defaults provided    |
 * | Groq AI          | GROQ_*                   | Optional             |
 * ──────────────────────────────────────────────────────────────────────
 * 
 * @module config/environment
 */

import 'dotenv/config';
import { z } from 'zod';

/**
 * Zod schema defining all environment variables, their types, validation
 * rules, and default values.
 * 
 * All numeric values are defined as strings with `.transform(Number)` because
 * `process.env` values are always strings — Zod handles the type coercion.
 * 
 * @type {z.ZodObject}
 */
const envSchema = z.object({
  // ─── Server Configuration ────────────────────────────────────────
  /** Application environment: development | production | test */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  /** HTTP server port number */
  PORT: z.string().transform(Number).default('3000'),
  /** HTTP server bind address (0.0.0.0 for all interfaces) */
  HOST: z.string().default('0.0.0.0'),

  // ─── MongoDB Configuration ──────────────────────────────────────
  /** MongoDB connection URI (required for app to function) */
  MONGODB_URI: z.string().default('mongodb://localhost:27017/globalfi'),
  /** Maximum concurrent connections in the Mongoose connection pool */
  MONGODB_POOL_SIZE: z.string().transform(Number).default('10'),

  // ─── Redis Configuration ────────────────────────────────────────
  /** Redis connection URL (optional — falls back to in-memory) */
  REDIS_URL: z.string().default('redis://localhost:6379'),
  /** Redis authentication password (empty string if no auth required) */
  REDIS_PASSWORD: z.string().optional().default(''),
  /** Default cache TTL in seconds for Redis entries */
  REDIS_TTL_DEFAULT: z.string().transform(Number).default('300'),

  // ─── External API Keys ──────────────────────────────────────────
  /** Alpha Vantage API key for stock market data ('demo' for limited testing) */
  ALPHA_VANTAGE_API_KEY: z.string().default('demo'),
  /** CoinGecko API key for cryptocurrency data (optional) */
  COINGECKO_API_KEY: z.string().optional().default(''),
  /** NewsAPI key for financial news headlines */
  NEWS_API_KEY: z.string().default(''),
  /** FRED API key for economic data from Federal Reserve */
  FRED_API_KEY: z.string().default(''),
  /** Finnhub API key for real-time stock quotes */
  FINNHUB_API_KEY: z.string().default(''),

  // ─── Security Configuration ─────────────────────────────────────
  /** Comma-separated list of allowed CORS origins */
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173'),
  /** Global rate limit window duration in milliseconds (default: 15 minutes) */
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  /** Maximum requests per window for the global rate limiter */
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // ─── Circuit Breaker Configuration ──────────────────────────────
  /** Number of consecutive failures before circuit breaker opens */
  CIRCUIT_BREAKER_THRESHOLD: z.string().transform(Number).default('3'),
  /** Timeout in milliseconds for individual API requests */
  CIRCUIT_BREAKER_TIMEOUT: z.string().transform(Number).default('30000'),
  /** Time in milliseconds before an open circuit breaker tries half-open */
  CIRCUIT_BREAKER_RESET_TIMEOUT: z.string().transform(Number).default('30000'),

  // ─── Logging Configuration ──────────────────────────────────────
  /** Winston log level: error | warn | info | http | debug */
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  /** File path for persistent log storage */
  LOG_FILE_PATH: z.string().default('./logs/app.log'),

  // ─── Socket.io Configuration ────────────────────────────────────
  /** Comma-separated list of allowed WebSocket CORS origins */
  SOCKET_IO_CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173'),

  // ─── Feature Flags ──────────────────────────────────────────────
  /** Enable proactive cache warming on startup */
  ENABLE_CACHE_WARMING: z.string().transform(v => v === 'true').default('false'),
  /** Enable system metrics collection via audit logs */
  ENABLE_METRICS_COLLECTION: z.string().transform(v => v === 'true').default('true'),

  // ─── RabbitMQ Configuration ─────────────────────────────────────
  /** AMQP connection URL for RabbitMQ */
  RABBITMQ_URL: z.string().default('amqp://localhost:5672'),
  /** Prefix for all RabbitMQ queue names */
  RABBITMQ_QUEUE_PREFIX: z.string().default('globalfi'),

  // ─── Groq AI Configuration ─────────────────────────────────────
  /** Groq API key — leave empty to disable AI features */
  GROQ_API_KEY: z.string().default(''),
  /** Primary Groq model for complex analysis tasks */
  GROQ_PRIMARY_MODEL: z.string().default('llama-3.3-70b-versatile'),
  /** Fast Groq model for quick/simple tasks */
  GROQ_FAST_MODEL: z.string().default('llama-3.1-8b-instant'),
});

/**
 * Parse and validate all environment variables against the Zod schema.
 * 
 * Exits the process with code 1 if any variable fails validation.
 * This is intentional — the app should not start with invalid config.
 * 
 * @returns {z.infer<typeof envSchema>} Validated and type-coerced environment values
 */
const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
};

/**
 * Validated environment variables (parsed once at module load time).
 * 
 * @type {z.infer<typeof envSchema>}
 */
export const env = parseEnv();

/**
 * Structured configuration object providing organized, type-safe access
 * to all environment variables. Import this object instead of accessing
 * `process.env` directly.
 * 
 * @example
 * import { config } from './config/environment.js';
 * console.log(config.server.port);     // 3000
 * console.log(config.database.uri);    // 'mongodb://...'
 * console.log(config.server.isProd);   // true/false
 * 
 * @type {Object}
 */
export const config = {
  /** Server runtime configuration */
  server: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    isDev: env.NODE_ENV === 'development',   // Convenience boolean
    isProd: env.NODE_ENV === 'production',   // Convenience boolean
    isTest: env.NODE_ENV === 'test',         // Convenience boolean
  },

  /** MongoDB connection configuration */
  database: {
    uri: env.MONGODB_URI,
    poolSize: env.MONGODB_POOL_SIZE,
  },

  /** Redis connection and caching configuration */
  redis: {
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD,
    ttlDefault: env.REDIS_TTL_DEFAULT,
  },

  /** External API key store — one key per financial data provider */
  apiKeys: {
    alphaVantage: env.ALPHA_VANTAGE_API_KEY,
    coinGecko: env.COINGECKO_API_KEY,
    newsApi: env.NEWS_API_KEY,
    fred: env.FRED_API_KEY,
    finnhub: env.FINNHUB_API_KEY,
  },

  /** Security-related configuration (CORS, rate limiting) */
  security: {
    corsOrigins: env.CORS_ORIGIN.split(',').map(s => s.trim()),
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  /** Circuit breaker configuration for external API resilience */
  circuitBreaker: {
    threshold: env.CIRCUIT_BREAKER_THRESHOLD,
    timeout: env.CIRCUIT_BREAKER_TIMEOUT,
    resetTimeout: env.CIRCUIT_BREAKER_RESET_TIMEOUT,
  },

  /** Winston logger configuration */
  logging: {
    level: env.LOG_LEVEL,
    filePath: env.LOG_FILE_PATH,
  },

  /** Socket.io real-time communication configuration */
  socketIo: {
    corsOrigins: env.SOCKET_IO_CORS_ORIGIN.split(',').map(s => s.trim()),
  },

  /** Feature toggles for optional functionality */
  features: {
    cacheWarming: env.ENABLE_CACHE_WARMING,
    metricsCollection: env.ENABLE_METRICS_COLLECTION,
  },

  /** RabbitMQ message queue configuration */
  rabbitmq: {
    url: env.RABBITMQ_URL,
    queuePrefix: env.RABBITMQ_QUEUE_PREFIX,
  },

  /** Groq AI LLM configuration */
  ai: {
    groqApiKey: env.GROQ_API_KEY,
    primaryModel: env.GROQ_PRIMARY_MODEL,
    fastModel: env.GROQ_FAST_MODEL,
  },

  /**
   * Per-API cache TTL values (in seconds).
   * 
   * Shorter TTLs for volatile data (crypto, stock quotes),
   * longer TTLs for slow-changing data (economic indicators, news).
   */
  cacheTTL: {
    alphaVantage: 60,     // Stock quotes: 1 minute
    coinGecko: 30,        // Crypto prices: 30 seconds
    exchangeRate: 300,    // Forex rates: 5 minutes
    newsApi: 600,         // News: 10 minutes
    fred: 1800,           // Economic data: 30 minutes (updated monthly)
    finnhub: 600,         // Finnhub data: 10 minutes
  },
};

export default config;
