/**
 * Global-Fi Ultra - Rate Limiter Middleware
 * 
 * Provides tiered rate limiting for all API endpoints using express-rate-limit.
 * 
 * Rate Limiting Strategy (three tiers):
 * ──────────────────────────────────────────────────────────────────────────────
 * | Tier           | Limit             | Applied To                          |
 * |----------------|-------------------|-------------------------------------|
 * | Auth           | 5 req / 15 min    | Login, register, password reset     |
 * | Public API     | 100 req / 15 min  | Financial data, status, health      |
 * | Authenticated  | 1000 req / 15 min | User CRUD, alerts, watchlists, etc. |
 * | Admin          | 20 req / 15 min   | Cache clear, metrics, logs          |
 * | AI             | 10 req / 1 min    | All AI-powered endpoints            |
 * | Health         | 1000 req / 1 min  | Health and readiness checks         |
 * ──────────────────────────────────────────────────────────────────────────────
 * 
 * All limiters emit standard `RateLimit-*` headers (RFC draft-ietf-httpapi-ratelimit)
 * and return structured JSON error responses when limits are exceeded.
 * 
 * Key Generation:
 * - Default: IP-based (req.ip) — suitable for unauthenticated traffic.
 * - AI & Authenticated: Hybrid — uses `req.user.id` if available, falls back to IP.
 *   This prevents a single authenticated user from consuming the entire IP's quota.
 * 
 * Security Considerations:
 * - `trust proxy` must be set in Express for accurate IP detection behind reverse
 *   proxies (Render, Heroku, Nginx). Already configured in server.js.
 * - Rate limit state is stored in-memory by default. For multi-instance deployments,
 *   consider using `rate-limit-redis` store for shared state.
 * 
 * @module middleware/rateLimiter
 */

import rateLimit from 'express-rate-limit';
import { config } from '../config/environment.js';
import { logger } from '../config/logger.js';

// ─── Constants ───────────────────────────────────────────────────────────────

/** 15 minutes in milliseconds — standard window for most limiters */
const FIFTEEN_MINUTES_MS = config.security.rateLimitWindowMs; // defaults to 900000

/** 1 minute in milliseconds — window for burst-sensitive endpoints */
const ONE_MINUTE_MS = 60 * 1000;

// ─── Helper: Hybrid Key Generator ────────────────────────────────────────────

/**
 * Creates a key generator that prefers authenticated user ID over raw IP.
 * This ensures per-user fairness: two users behind the same NAT/proxy
 * each get their own rate limit bucket.
 * 
 * @param {string} prefix - Prefix to namespace the key (e.g. 'auth', 'ai')
 * @returns {Function} Express-compatible keyGenerator function
 */
const createHybridKeyGenerator = (prefix) => {
    return (req) => {
        const identifier = req.user?.id || req.ip;
        return `${prefix}:${identifier}`;
    };
};

// ─── Helper: Rate Limit Exceeded Handler ─────────────────────────────────────

/**
 * Factory for creating rate-limit exceeded handlers with contextual logging.
 * Logs a warning with the client IP, path, and request ID for audit purposes,
 * then responds with a structured JSON error body.
 * 
 * @param {string} context - Human-readable context for log messages (e.g. 'Global', 'AI')
 * @returns {Function} Express rate-limit handler function
 */
const createLimitHandler = (context) => {
    return (req, res, next, options) => {
        logger.warn(`${context} rate limit exceeded`, {
            ip: req.ip,
            path: req.path,
            method: req.method,
            requestId: req.requestId,
            userId: req.user?.id || 'anonymous',
        });
        res.status(429).json(options.message);
    };
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIER 1: Authentication Rate Limiter (STRICTEST)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Strict rate limiter for authentication endpoints.
 * 
 * Limits: 5 requests per 15 minutes per IP.
 * 
 * Purpose: Prevents brute-force attacks on login, registration, and password
 * reset endpoints. The very low limit is intentional — legitimate users rarely
 * need more than a few auth attempts in a short window.
 * 
 * Applied to: Future `/api/v1/auth/*` routes (login, register, forgot-password).
 * Also exported for use on any security-sensitive endpoint (e.g. POST /users
 * for account creation).
 * 
 * @type {import('express').RequestHandler}
 */
export const authRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    max: 5,
    message: {
        error: {
            code: 'E1013',
            message: 'Too many authentication attempts. Please try again in 15 minutes.',
            retryAfter: Math.ceil(FIFTEEN_MINUTES_MS / 1000),
        },
    },
    standardHeaders: true,   // Send `RateLimit-*` headers (RFC standard)
    legacyHeaders: false,    // Disable deprecated `X-RateLimit-*` headers
    keyGenerator: (req) => req.ip,  // Always IP-based for auth (user not yet identified)
    handler: createLimitHandler('Auth'),
});

// ═══════════════════════════════════════════════════════════════════════════════
// TIER 2: Public API Rate Limiter (MODERATE)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Global rate limiter for public API endpoints.
 * 
 * Limits: 100 requests per 15 minutes per IP (configurable via RATE_LIMIT_MAX_REQUESTS).
 * 
 * Purpose: Protects public-facing read endpoints from abuse while allowing
 * reasonable usage for data consumers. This is the default limiter applied
 * to the `/api` prefix in server.js.
 * 
 * Applied to: Financial data, status, and general public endpoints.
 * 
 * @type {import('express').RequestHandler}
 */
export const globalRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    max: config.security.rateLimitMaxRequests,  // Default: 100
    message: {
        error: {
            code: 'E1002',
            message: 'Too many requests, please try again later.',
            retryAfter: Math.ceil(FIFTEEN_MINUTES_MS / 1000),
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: createLimitHandler('Global'),
});

// ═══════════════════════════════════════════════════════════════════════════════
// TIER 3: Authenticated User Rate Limiter (LENIENT)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lenient rate limiter for authenticated user resource endpoints.
 * 
 * Limits: 1000 requests per 15 minutes per user (or per IP if unauthenticated).
 * 
 * Purpose: Provides a generous limit for logged-in users interacting with
 * their own resources (CRUD operations on users, alerts, watchlists, assets).
 * The higher limit acknowledges that legitimate app usage involves many
 * rapid interactions (loading dashboards, updating multiple items, etc.).
 * 
 * Key Generation: Uses `req.user.id` when available (after auth middleware),
 * falling back to `req.ip` for unauthenticated requests. This means:
 * - With auth: Each user gets 1000 requests regardless of shared IP
 * - Without auth: Each IP gets 1000 requests (shared among all users on that IP)
 * 
 * Applied to: User, Alert, Watchlist, and Asset CRUD routes.
 * 
 * @type {import('express').RequestHandler}
 */
export const authenticatedUserRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    max: 1000,
    message: {
        error: {
            code: 'E1014',
            message: 'Request limit exceeded for your account. Please try again later.',
            retryAfter: Math.ceil(FIFTEEN_MINUTES_MS / 1000),
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: createHybridKeyGenerator('user'),
    handler: createLimitHandler('Authenticated User'),
});

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIAL: Admin Rate Limiter
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Stricter rate limiter for admin/management endpoints.
 * 
 * Limits: 20 requests per 15 minutes per IP.
 * 
 * Purpose: Admin operations (cache clear, metrics retrieval, log access) are
 * sensitive and resource-intensive. The low limit prevents accidental
 * or malicious repeated cache flushes, excessive log reads, etc.
 * 
 * Applied to: `/api/v1/admin/*` routes.
 * 
 * @type {import('express').RequestHandler}
 */
export const adminRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    max: 20,
    message: {
        error: {
            code: 'E1002',
            message: 'Too many admin requests, please try again later.',
            retryAfter: Math.ceil(FIFTEEN_MINUTES_MS / 1000),
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: createLimitHandler('Admin'),
});

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIAL: AI Rate Limiter
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Strict rate limiter for AI-powered endpoints.
 * 
 * Limits: 10 requests per 1 minute per user/IP.
 * 
 * Purpose: AI calls are expensive in multiple dimensions:
 * - Token consumption on the Groq API (limited free tier quota)
 * - CPU/memory for prompt construction and response parsing
 * - Network latency to external AI service
 * 
 * The short 1-minute window with low max prevents burst abuse while
 * still allowing steady usage (up to 600 AI requests per hour).
 * 
 * Key Generation: Hybrid (user ID or IP) to ensure per-user fairness.
 * 
 * Applied to: `/api/v1/ai/*` routes.
 * 
 * @type {import('express').RequestHandler}
 */
export const aiRateLimiter = rateLimit({
    windowMs: ONE_MINUTE_MS,
    max: 10,
    message: {
        error: {
            code: 'E1012',
            message: 'AI rate limit exceeded. Maximum 10 AI requests per minute.',
            retryAfter: 60,
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: createHybridKeyGenerator('ai'),
    handler: createLimitHandler('AI'),
});

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIAL: Health Check Rate Limiter
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Very lenient rate limiter for health check endpoints.
 * 
 * Limits: 1000 requests per 1 minute per IP.
 * 
 * Purpose: Health checks are called frequently by load balancers, monitoring
 * services (Render, Kubernetes, UptimeRobot), and deployment pipelines.
 * The high limit ensures monitoring is never blocked while still preventing
 * an extreme flood.
 * 
 * Applied to: `/api/v1/health/*` routes.
 * 
 * @type {import('express').RequestHandler}
 */
export const healthRateLimiter = rateLimit({
    windowMs: ONE_MINUTE_MS,
    max: 1000,
    message: {
        error: {
            code: 'E1002',
            message: 'Too many health check requests.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── Default Export ──────────────────────────────────────────────────────────

export default globalRateLimiter;
