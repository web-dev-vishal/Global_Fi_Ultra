/**
 * Global-Fi Ultra - Health Controller
 * 
 * Health check and readiness probe endpoints.
 */

import { isDatabaseConnected } from '../../config/database.js';
import { isRedisConnected } from '../../config/redis.js';
import { getContainer } from '../../di/container.js';

/**
 * Health controller
 */
export class HealthController {
    /**
     * Health check - basic liveness probe
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async health(req, res) {
        const container = getContainer();
        const aiEnabled = container.isAIEnabled();

        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
            features: {
                ai: aiEnabled
            }
        });
    }

    /**
     * Readiness probe - checks all dependencies
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async readiness(req, res) {
        const container = getContainer();
        const aiEnabled = container.isAIEnabled();
        const aiStreamHandler = container.getAIStreamHandler();

        const checks = {
            database: isDatabaseConnected(),
            redis: isRedisConnected(),
            ai: {
                enabled: aiEnabled,
                websocket: aiStreamHandler !== null,
                jobQueue: container.get('aiJobQueue') !== null
            }
        };

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
