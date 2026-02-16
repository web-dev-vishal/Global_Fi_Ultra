/**
 * Global-Fi Ultra - Health Controller
 * 
 * Provides liveness and readiness probe endpoints for infrastructure
 * monitoring. Used by Render.com health checks, Kubernetes probes,
 * and uptime monitoring services.
 * 
 * Two health check types:
 * - `/health` — Basic liveness: "Is the process running?" Always returns 200.
 * - `/readiness` — Dependency check: "Can we serve real requests?"
 *   Returns 200 if MongoDB + Redis are connected, 503 otherwise.
 * 
 * @module controllers/HealthController
 */

import { isDatabaseConnected } from '../config/database.js';
import { isRedisConnected } from '../config/redis.js';
import { getContainer } from '../di/container.js';

/**
 * Controller class for health check and readiness probe HTTP endpoints.
 * 
 * Unlike other controllers, this does NOT require DI injection — it
 * directly queries connection state functions from config modules.
 */
export class HealthController {
    /**
     * GET /health/health — Basic liveness probe.
     * 
     * Always returns 200 if the Node.js process is running and able to
     * handle HTTP requests. Does NOT check external dependencies.
     * 
     * Used by: Render.com health checks (configured in render.yaml),
     * load balancers, and simple uptime monitors.
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @returns {void}
     */
    async health(req, res) {
        const container = getContainer();
        const aiEnabled = container.isAIEnabled();

        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
            features: {
                ai: aiEnabled,  // Indicates whether Groq AI features are available
            }
        });
    }

    /**
     * GET /health/readiness — Detailed readiness probe.
     * 
     * Checks the connectivity status of all critical dependencies:
     * - MongoDB (via Mongoose connection state)
     * - Redis (via ioredis client state)
     * - AI subsystem (Groq client, WebSocket handler, job queue)
     * 
     * Returns 200 if MongoDB AND Redis are connected (minimum viable state).
     * Returns 503 (Service Unavailable) if either is down.
     * 
     * AI features are informational — their absence doesn't cause a 503
     * since the core API can function without AI.
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @returns {void}
     */
    async readiness(req, res) {
        const container = getContainer();
        const aiEnabled = container.isAIEnabled();
        const aiStreamHandler = container.getAIStreamHandler();

        // Check each dependency's connection status
        const checks = {
            database: isDatabaseConnected(),      // Mongoose connection.readyState === 1
            redis: isRedisConnected(),            // ioredis client.status === 'ready'
            ai: {
                enabled: aiEnabled,               // GROQ_API_KEY is set
                websocket: aiStreamHandler !== null, // AI streaming handler is initialized
                jobQueue: container.get('aiJobQueue') !== null  // RabbitMQ AI queue is available
            }
        };

        // Core services (DB + Redis) must both be connected for readiness
        const allHealthy = checks.database && checks.redis;
        const status = allHealthy ? 'ready' : 'not_ready';
        const httpStatus = allHealthy ? 200 : 503;

        res.status(httpStatus).json({
            status,
            checks,
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
        });
    }
}

export default HealthController;
