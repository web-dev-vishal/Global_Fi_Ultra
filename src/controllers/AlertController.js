/**
 * Global-Fi Ultra - Alert Controller
 * 
 * Handles HTTP requests for price alert management endpoints. Users can
 * create alerts that trigger when an asset's price crosses a threshold
 * (above, below, or equals a target price).
 * 
 * Error Codes:
 * - E4001: Alert not found (404)
 * 
 * @module controllers/AlertController
 */

import { logger } from '../config/logger.js';

/**
 * Controller class for alert management HTTP endpoints.
 * 
 * Injected via DI container with AlertService dependency.
 * Supports full CRUD operations plus activate/deactivate actions.
 */
export class AlertController {
    /**
     * Creates a new AlertController instance.
     * 
     * @param {Object} dependencies - DI-injected dependencies
     * @param {import('../services/AlertService.js').AlertService} dependencies.alertService - Alert business logic service
     */
    constructor({ alertService }) {
        /** @type {import('../services/AlertService.js').AlertService} */
        this.alertService = alertService;
    }

    /**
     * GET /alerts — List alerts with optional filtering by userId, symbol, and status.
     * 
     * If `userId` is provided in query params, returns that user's alerts directly.
     * Otherwise, returns a paginated list of all alerts with optional filters.
     * 
     * Query Parameters:
     * - `userId` (string): Filter to a specific user's alerts
     * - `symbol` (string): Filter by asset symbol (auto-uppercased)
     * - `isActive` (boolean): Filter by active/inactive status
     * - `isTriggered` (boolean): Filter by triggered/untriggered status
     * - `page` (number, default 1): Page number
     * - `limit` (number, default 20): Results per page
     * - `sort` (string, default '-createdAt'): Sort field with direction
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async listAlerts(req, res, next) {
        try {
            const { userId, symbol, isActive, isTriggered, page, limit, sort } = req.query;

            // Shortcut path: if userId is provided, use the dedicated user-alerts method
            if (userId) {
                const alerts = await this.alertService.getUserAlerts(userId, {
                    isActive: isActive !== undefined ? isActive : null,
                    sort: sort || '-createdAt',
                });

                return res.status(200).json({
                    requestId: req.requestId,
                    timestamp: new Date().toISOString(),
                    alerts,
                });
            }

            // General listing path: apply filters and paginate
            const filter = {};
            if (symbol) filter.symbol = symbol.toUpperCase();
            if (isActive !== undefined) filter.isActive = isActive;
            if (isTriggered !== undefined) filter.isTriggered = isTriggered;

            const result = await this.alertService.listAlerts({
                page: page || 1,
                limit: limit || 20,
                filter,
                sort: sort || '-createdAt',
            });

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /alerts/:id — Get a single alert by its MongoDB ObjectID.
     * 
     * @param {import('express').Request} req - Express request (params.id required)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async getAlert(req, res, next) {
        try {
            const alert = await this.alertService.getAlert(req.params.id);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                alert,
            });
        } catch (error) {
            if (error.message === 'Alert not found') {
                return res.status(404).json({
                    error: { code: 'E4001', message: 'Alert not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * POST /alerts — Create a new price alert.
     * 
     * The request body specifies the symbol, condition (above/below/equals),
     * target price, and optional notification preferences.
     * 
     * @param {import('express').Request} req - Express request (validated body)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async createAlert(req, res, next) {
        try {
            const alert = await this.alertService.createAlert(req.body);

            res.status(201).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Alert created successfully',
                alert,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /alerts/:id — Update an existing alert's configuration.
     * 
     * @param {import('express').Request} req - Express request (params.id + validated body)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async updateAlert(req, res, next) {
        try {
            const alert = await this.alertService.updateAlert(req.params.id, req.body);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Alert updated successfully',
                alert,
            });
        } catch (error) {
            if (error.message === 'Alert not found') {
                return res.status(404).json({
                    error: { code: 'E4001', message: 'Alert not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * DELETE /alerts/:id — Permanently delete an alert.
     * 
     * @param {import('express').Request} req - Express request (params.id required)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async deleteAlert(req, res, next) {
        try {
            await this.alertService.deleteAlert(req.params.id);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Alert deleted successfully',
            });
        } catch (error) {
            if (error.message === 'Alert not found') {
                return res.status(404).json({
                    error: { code: 'E4001', message: 'Alert not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * PATCH /alerts/:id/activate — Enable an alert for price monitoring.
     * 
     * Sets `isActive` to `true`, allowing the alert evaluation background
     * process to check this alert against live prices.
     * 
     * @param {import('express').Request} req - Express request (params.id required)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async activateAlert(req, res, next) {
        try {
            const alert = await this.alertService.updateAlert(req.params.id, { isActive: true });

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Alert activated successfully',
                alert,
            });
        } catch (error) {
            if (error.message === 'Alert not found') {
                return res.status(404).json({
                    error: { code: 'E4001', message: 'Alert not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * PATCH /alerts/:id/deactivate — Disable an alert (stop price monitoring).
     * 
     * Sets `isActive` to `false`. The alert record is retained for reference
     * but will no longer trigger notifications.
     * 
     * @param {import('express').Request} req - Express request (params.id required)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async deactivateAlert(req, res, next) {
        try {
            const alert = await this.alertService.updateAlert(req.params.id, { isActive: false });

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Alert deactivated successfully',
                alert,
            });
        } catch (error) {
            if (error.message === 'Alert not found') {
                return res.status(404).json({
                    error: { code: 'E4001', message: 'Alert not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }
}

export default AlertController;
