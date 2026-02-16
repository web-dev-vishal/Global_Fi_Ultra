/**
 * Global-Fi Ultra - Admin Controller
 * 
 * Handles HTTP requests for administrative operations including cache
 * management, system metrics, and error log retrieval.
 * 
 * Security Note: These endpoints should be protected by admin-only
 * authentication middleware in production. Currently accessible to
 * anyone with API access, protected only by adminRateLimiter (20 req/15min).
 * 
 * @module controllers/AdminController
 */

import { logger } from '../config/logger.js';

/**
 * Controller class for admin management HTTP endpoints.
 * 
 * Injected via DI container with RedisCache and AuditLogRepository dependencies.
 */
export class AdminController {
    /**
     * Creates a new AdminController instance.
     * 
     * @param {Object} dependencies - DI-injected dependencies
     * @param {import('../infrastructure/cache/RedisCache.js').RedisCache} dependencies.cache - Redis cache manager
     * @param {import('../infrastructure/repositories/AuditLogRepository.js').AuditLogRepository} dependencies.auditLogRepository - Audit log data access
     */
    constructor(dependencies) {
        /** @type {import('../infrastructure/cache/RedisCache.js').RedisCache} */
        this.cache = dependencies.cache;
        /** @type {import('../infrastructure/repositories/AuditLogRepository.js').AuditLogRepository} */
        this.auditLogRepository = dependencies.auditLogRepository;
    }

    /**
     * POST /admin/cache/clear — Flush all Redis cache entries.
     * 
     * Clears all cached financial data, forcing fresh API calls on the
     * next `/financial/live` request. Use sparingly — clearing cache
     * increases load on external APIs.
     * 
     * Returns 500 if Redis is unreachable or the flush fails.
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async clearCache(req, res, next) {
        try {
            const success = await this.cache.clear();

            if (!success) {
                return res.status(500).json({
                    error: {
                        code: 'E1006',
                        message: 'Failed to clear cache',
                    },
                    requestId: req.requestId,
                });
            }

            // Log admin action for audit trail
            logger.info('Cache cleared by admin', { requestId: req.requestId });

            res.status(200).json({
                success: true,
                message: 'Cache cleared successfully',
                requestId: req.requestId,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /admin/metrics — Retrieve system performance metrics.
     * 
     * Returns aggregated metrics from the audit log for the specified
     * time period (default: last 24 hours).
     * 
     * Query Parameters:
     * - `hours` (number, default 24): Number of hours to look back
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async getMetrics(req, res, next) {
        try {
            const hours = parseInt(req.query.hours) || 24;
            const metrics = await this.auditLogRepository.getMetrics(hours);

            res.status(200).json({
                period: `${hours} hours`,
                metrics,
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /admin/logs — Retrieve recent error log entries.
     * 
     * Returns the most recent error-level log entries from the audit log.
     * Useful for monitoring and debugging without direct log file access.
     * 
     * Query Parameters:
     * - `limit` (number, default 20): Maximum number of log entries to return
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async getLogs(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const logs = await this.auditLogRepository.getErrors(limit);

            res.status(200).json({
                count: logs.length,
                logs,
                requestId: req.requestId,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default AdminController;