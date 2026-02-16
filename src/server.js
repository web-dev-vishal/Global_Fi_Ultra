/**
 * Global-Fi Ultra - Application Entry Point
 * 
 * Main server file that bootstraps the entire application. Responsible for:
 * 1. Connecting to MongoDB, Redis, and RabbitMQ
 * 2. Creating the Express app with middleware pipeline
 * 3. Setting up Socket.io for real-time WebSocket communication
 * 4. Initializing the DI container with all services
 * 5. Mounting API routes under `/api/v1/`
 * 6. Configuring graceful shutdown for all connections
 * 
 * Startup Sequence:
 * ─────────────────────────────────────────────────────────────────
 * 1. MongoDB (required) — App exits if connection fails
 * 2. Redis (optional) — Falls back to in-memory if unavailable
 * 3. RabbitMQ (optional) — AI job queue disabled if unavailable
 * 4. Express app creation + middleware pipeline
 * 5. HTTP server + Socket.io initialization
 * 6. DI container initialization (creates all service instances)
 * 7. Route mounting
 * 8. Graceful shutdown handler registration
 * 9. HTTP server starts listening
 * 
 * Graceful Shutdown:
 * On SIGTERM/SIGINT, the server closes connections in reverse order:
 * Socket.io → AI job queue → MongoDB → Redis → RabbitMQ
 * Force-exits after 15 seconds if graceful shutdown stalls.
 * 
 * @module server
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config, logger, connectDatabase, closeDatabaseConnection, connectRedis, closeRedisConnection, connectRabbitMQ, closeRabbitMQConnection, flushLogger, safeLog } from './config/index.js';
import { getContainer } from './di/container.js';
import {
    requestIdMiddleware,
    globalRateLimiter,
    errorHandler,
    notFoundHandler,
    securityHeaders,
    corsMiddleware,
    requestLogger,
} from './middleware/index.js';
import {
    createHealthRoutes,
    createFinancialRoutes,
    createAdminRoutes,
    createStatusRoutes,
    createUserRoutes,
    createWatchlistRoutes,
    createAlertRoutes,
    createAssetRoutes,
} from './routes/index.js';
import { createAIRoutes } from './routes/aiRoutes.js';

/**
 * Creates and configures the Express application with the full middleware pipeline.
 * 
 * Middleware execution order (top to bottom):
 * 1. `securityHeaders` — Helmet CSP and security headers
 * 2. `corsMiddleware` — CORS policy enforcement
 * 3. `express.json()` — Body parsing (10KB limit to prevent abuse)
 * 4. `express.urlencoded()` — URL-encoded body parsing
 * 5. `requestIdMiddleware` — Attach X-Request-Id to every request
 * 6. `requestLogger` — Log request details on response finish
 * 7. API version header — X-API-Version: 1.0.0
 * 8. `globalRateLimiter` — 100 req/15min on /api prefix
 * 
 * @returns {express.Application} Configured Express application
 */
const createApp = () => {
    const app = express();

    // Enable trust for the first reverse proxy (Render.com, Nginx, etc.)
    // Required for accurate client IP in rate limiting and logging
    app.set('trust proxy', 1);

    // ─── Security Layer ──────────────────────────────────────────────
    app.use(securityHeaders);   // Helmet: CSP, HSTS, X-Frame-Options, etc.
    app.use(corsMiddleware);    // CORS: whitelist allowed origins

    // ─── Request Parsing ─────────────────────────────────────────────
    // 10KB limit prevents large payload attacks (DoS via oversized JSON)
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // ─── Tracing & Logging ───────────────────────────────────────────
    app.use(requestIdMiddleware);  // Attach unique X-Request-Id for distributed tracing
    app.use(requestLogger);        // Log method, path, status, duration on every response

    // ─── API Versioning ──────────────────────────────────────────────
    // Set version header for all responses (helps clients detect API changes)
    app.use((req, res, next) => {
        res.setHeader('X-API-Version', '1.0.0');
        next();
    });

    // ─── Rate Limiting ───────────────────────────────────────────────
    // Global rate limit: 100 requests per 15 minutes, applied to all /api/** routes
    // Additional per-tier limits are applied at the route level
    app.use('/api', globalRateLimiter);

    return app;
};

/**
 * Mount all API routes onto the Express app.
 * 
 * Route Hierarchy:
 * ─────────────────────────────────────────────────────────────────
 * | Path                 | Controller            | Rate Limiter    |
 * |----------------------|-----------------------|-----------------|
 * | /api/v1/health       | HealthController      | healthRateLimiter|
 * | /api/v1/financial    | FinancialController   | globalRateLimiter|
 * | /api/v1/admin        | AdminController       | adminRateLimiter |
 * | /api/v1/status       | StatusController      | globalRateLimiter|
 * | /api/v1/users        | UserController        | authenticatedUser|
 * | /api/v1/watchlists   | WatchlistController   | authenticatedUser|
 * | /api/v1/alerts       | AlertController       | authenticatedUser|
 * | /api/v1/assets       | AssetController       | authenticatedUser|
 * | /api/v1/ai           | AIController (opt.)   | aiRateLimiter    |
 * ─────────────────────────────────────────────────────────────────
 * 
 * @param {express.Application} app - The Express application
 * @param {import('./di/container.js').Container} container - DI container with all instances
 */
const setupRoutes = (app, container) => {
    // Health/readiness probes (high rate limit for monitoring tools)
    app.use('/api/v1/health', createHealthRoutes(container.get('healthController')));

    // Core financial data endpoints
    app.use('/api/v1/financial', createFinancialRoutes(container.get('financialController')));
    app.use('/api/v1/admin', createAdminRoutes(container.get('adminController')));
    app.use('/api/v1/status', createStatusRoutes(container.get('statusController')));

    // Resource CRUD endpoints
    app.use('/api/v1/users', createUserRoutes(container.get('userController')));
    app.use('/api/v1/watchlists', createWatchlistRoutes(container.get('watchlistController')));
    app.use('/api/v1/alerts', createAlertRoutes(container.get('alertController')));
    app.use('/api/v1/assets', createAssetRoutes(container.get('assetController')));

    // AI routes — only mounted if GROQ_API_KEY is configured
    const aiController = container.get('aiController');
    if (aiController) {
        app.use('/api/v1/ai', createAIRoutes(aiController));
        logger.info('✅ AI routes mounted at /api/v1/ai');
    } else {
        logger.info('ℹ️  AI routes not mounted (AI features disabled)');
    }

    // ─── Terminal Middleware ──────────────────────────────────────────
    // These MUST be last — they handle unmatched routes and errors
    app.use(notFoundHandler);  // 404 for unmatched routes
    app.use(errorHandler);     // Centralized error handler (catches all next(error) calls)
};

/**
 * Register graceful shutdown handlers for clean process termination.
 * 
 * Shutdown Order:
 * 1. Stop accepting new HTTP connections (server.close)
 * 2. Close Socket.io connections
 * 3. Close AI job queue (RabbitMQ consumer)
 * 4. Close MongoDB connection
 * 5. Close Redis connection
 * 6. Close RabbitMQ connection
 * 7. Flush Winston logger buffers
 * 
 * Safety: Force-exits after 15 seconds if graceful shutdown stalls.
 * Uses `isShuttingDown` flag to prevent duplicate shutdown attempts.
 * 
 * @param {import('http').Server} server - Node.js HTTP server
 * @param {import('./di/container.js').Container} container - DI container
 */
const setupGracefulShutdown = (server, container) => {
    let isShuttingDown = false;

    const shutdown = async (signal) => {
        // Prevent duplicate shutdown (e.g., SIGTERM followed by SIGINT)
        if (isShuttingDown) return;
        isShuttingDown = true;

        logger.info(`${signal} received, starting graceful shutdown`);

        // Stop accepting new connections immediately
        server.close(() => {
            safeLog('info', 'HTTP server closed');
        });

        // Force-exit safety net: kills process after 15 seconds
        const forceShutdownTimer = setTimeout(() => {
            console.error('Forced shutdown after timeout');
            process.exit(1);
        }, 15000);

        try {
            // Close connections in dependency order (dependents before dependencies)

            // 1. Socket.io — stop WebSocket connections
            const socketManager = container.getSocketManager();
            if (socketManager) {
                await socketManager.close();
                safeLog('info', 'Socket.io closed');
            }

            // 2. AI job queue — stop consuming RabbitMQ messages
            await container.closeAIJobQueue();
            safeLog('info', 'AI job queue closed');

            // 3. MongoDB — close connection pool
            await closeDatabaseConnection();
            safeLog('info', 'MongoDB connection closed');

            // 4. Redis — close connection (may already be disconnected)
            try {
                await closeRedisConnection();
                safeLog('info', 'Redis connection closed');
            } catch (error) {
                safeLog('warn', 'Redis already disconnected or not available');
            }

            // 5. RabbitMQ — close AMQP connection
            await closeRabbitMQConnection();
            safeLog('info', 'RabbitMQ connection closed');

            // 6. Flush logger — ensure all log entries are written to disk
            await flushLogger();
            console.log('Graceful shutdown complete');

            clearTimeout(forceShutdownTimer);
            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown', error.message);
            clearTimeout(forceShutdownTimer);
            process.exit(1);
        }
    };

    // Register signal handlers for graceful shutdown
    process.on('SIGTERM', () => shutdown('SIGTERM')); // Render.com, Docker, systemd
    process.on('SIGINT', () => shutdown('SIGINT'));    // Ctrl+C in terminal

    // Handle uncaught exceptions — log and trigger shutdown
    process.on('uncaughtException', (error) => {
        console.error('='.repeat(60));
        console.error('❌ UNCAUGHT EXCEPTION');
        console.error('='.repeat(60));
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('='.repeat(60));
        shutdown('uncaughtException');
    });

    // Handle unhandled promise rejections — log (don't shutdown)
    process.on('unhandledRejection', (reason, promise) => {
        console.error('='.repeat(60));
        console.error('❌ UNHANDLED REJECTION');
        console.error('='.repeat(60));
        console.error('Reason:', String(reason));
        console.error('='.repeat(60));
    });
};

/**
 * Main startup function — orchestrates the entire application bootstrap.
 * 
 * Exits with code 1 if MongoDB connection fails (required dependency).
 * Redis and RabbitMQ failures are logged as warnings but don't prevent startup.
 * 
 * @returns {Promise<void>}
 */
const startServer = async () => {
    try {
        logger.info('Starting Global-Fi Ultra...');

        // Log environment details in development mode
        if (config.server.isDev) {
            logger.debug('Environment check', {
                nodeEnv: config.server.nodeEnv,
                port: config.server.port,
                groqKeyConfigured: !!config.ai.groqApiKey && config.ai.groqApiKey.length > 0,
                groqKeyLength: config.ai.groqApiKey?.length || 0,
                redisConfigured: !!config.redis.url,
                mongoConfigured: !!config.database.uri,
            });
        }

        // ─── Step 1: Connect to MongoDB (REQUIRED) ──────────────────
        // App CANNOT function without a database — fails fast if unavailable
        await connectDatabase();

        // ─── Step 2: Connect to Redis (OPTIONAL) ────────────────────
        // Falls back to in-memory stores if Redis is unavailable
        try {
            const redisConnected = await connectRedis();
            if (redisConnected) {
                logger.info('✅ Redis connected - caching enabled');
            } else {
                logger.warn('⚠️ Redis not available - running without cache');
                logger.info('ℹ️  Impact: Rate limiting and caching will use in-memory fallbacks');
            }
        } catch (error) {
            logger.warn('⚠️ Redis connection failed - continuing without cache', {
                error: error.message,
                impact: 'Rate limiting and caching will use in-memory fallbacks'
            });
        }

        // ─── Step 3: Connect to RabbitMQ (OPTIONAL) ─────────────────
        // AI job queue and async processing require RabbitMQ
        try {
            await connectRabbitMQ();
        } catch (error) {
            logger.warn('RabbitMQ not available - running without message queue', {
                error: error.message,
                impact: 'AI job queue and async processing will be disabled'
            });
        }

        // ─── Step 4: Create Express App ─────────────────────────────
        const app = createApp();
        const httpServer = createServer(app);

        // ─── Step 5: Create Socket.io Server ────────────────────────
        // Configured with CORS matching the Express CORS policy
        const io = new SocketIOServer(httpServer, {
            cors: {
                origin: config.socketIo.corsOrigins,
                methods: ['GET', 'POST'],
                credentials: true,
            },
            pingTimeout: 60000,    // 60s before considering a client disconnected
            pingInterval: 25000,   // 25s heartbeat interval
        });

        // ─── Step 6: Initialize DI Container ────────────────────────
        // Creates all service instances and wires dependencies
        const container = getContainer();
        await container.initialize({ io });

        // ─── Step 7: Mount Routes ───────────────────────────────────
        setupRoutes(app, container);

        // ─── Step 8: Register Shutdown Handlers ─────────────────────
        setupGracefulShutdown(httpServer, container);

        // ─── Step 9: Start Listening ────────────────────────────────
        httpServer.listen(config.server.port, config.server.host, () => {
            logger.info(`🚀 Global-Fi Ultra running on http://${config.server.host}:${config.server.port}`);
            logger.info(`   Environment: ${config.server.nodeEnv}`);
            logger.info(`   Health check: http://${config.server.host}:${config.server.port}/health`);

            // Log AI feature availability
            if (container.isAIEnabled()) {
                logger.info(`   ✅ AI Features: ENABLED`);
                logger.info(`   🤖 AI Endpoints: http://${config.server.host}:${config.server.port}/api/v1/ai/*`);
                logger.info(`   🔌 AI WebSocket: ws://${config.server.host}:${config.server.port}`);
            } else {
                logger.info(`   ℹ️  AI Features: DISABLED (configure GROQ_API_KEY to enable)`);
            }
        });
    } catch (error) {
        logger.error('Failed to start server', { error: error.message, stack: error.stack });
        process.exit(1);
    }
};

// ─── Application Entry Point ─────────────────────────────────────────────────
startServer();