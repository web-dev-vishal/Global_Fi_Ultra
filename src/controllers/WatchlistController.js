/**
 * Global-Fi Ultra - Watchlist Controller
 * 
 * Handles HTTP requests for watchlist management and asset assignment.
 * A watchlist is a named collection of financial assets that a user wants
 * to track. Supports full CRUD plus asset add/remove operations.
 * 
 * Error Codes:
 * - E3001: Watchlist not found (404)
 * - E3002: Watchlist name already exists for user (409 Conflict)
 * 
 * @module controllers/WatchlistController
 */

import { logger } from '../config/logger.js';

/**
 * Controller class for watchlist management HTTP endpoints.
 * 
 * Injected via DI container with WatchlistService dependency.
 */
export class WatchlistController {
    /**
     * Creates a new WatchlistController instance.
     * 
     * @param {Object} dependencies - DI-injected dependencies
     * @param {import('../services/WatchlistService.js').WatchlistService} dependencies.watchlistService
     */
    constructor({ watchlistService }) {
        /** @type {import('../services/WatchlistService.js').WatchlistService} */
        this.watchlistService = watchlistService;
    }

    /**
     * GET /watchlists — List watchlists with optional filtering.
     * 
     * If `userId` is provided, returns only that user's watchlists.
     * Otherwise, returns a paginated list of all watchlists.
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async listWatchlists(req, res, next) {
        try {
            const { userId, page, limit, isPublic, sort } = req.query;

            // Shortcut: return user-specific watchlists when userId is provided
            if (userId) {
                const watchlists = await this.watchlistService.getUserWatchlists(userId, {
                    sort: sort || '-createdAt',
                });

                return res.status(200).json({
                    requestId: req.requestId,
                    timestamp: new Date().toISOString(),
                    watchlists,
                });
            }

            // General listing with pagination and optional isPublic filter
            const filter = {};
            if (isPublic !== undefined) {
                filter.isPublic = isPublic;
            }

            const result = await this.watchlistService.listWatchlists({
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
     * GET /watchlists/:id — Get a single watchlist by its MongoDB ObjectID.
     * 
     * @param {import('express').Request} req - Express request (params.id required)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async getWatchlist(req, res, next) {
        try {
            const watchlist = await this.watchlistService.getWatchlist(req.params.id);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                watchlist,
            });
        } catch (error) {
            if (error.message === 'Watchlist not found') {
                return res.status(404).json({
                    error: { code: 'E3001', message: 'Watchlist not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * POST /watchlists — Create a new watchlist.
     * 
     * Returns 409 if a watchlist with the same name already exists
     * for this user (name + userId uniqueness constraint).
     * 
     * @param {import('express').Request} req - Express request (validated body)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async createWatchlist(req, res, next) {
        try {
            const watchlist = await this.watchlistService.createWatchlist(req.body);

            res.status(201).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Watchlist created successfully',
                watchlist,
            });
        } catch (error) {
            if (error.message === 'Watchlist name already exists for this user') {
                return res.status(409).json({
                    error: { code: 'E3002', message: 'Watchlist name already exists for this user' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * PUT /watchlists/:id — Update a watchlist's metadata (name, description, tags, etc.).
     * 
     * Does NOT modify the assets array — use addAsset/removeAsset for that.
     * 
     * @param {import('express').Request} req - Express request (params.id + validated body)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async updateWatchlist(req, res, next) {
        try {
            const watchlist = await this.watchlistService.updateWatchlist(req.params.id, req.body);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Watchlist updated successfully',
                watchlist,
            });
        } catch (error) {
            if (error.message === 'Watchlist not found') {
                return res.status(404).json({
                    error: { code: 'E3001', message: 'Watchlist not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * DELETE /watchlists/:id — Delete a watchlist and all its asset associations.
     * 
     * @param {import('express').Request} req - Express request (params.id required)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async deleteWatchlist(req, res, next) {
        try {
            await this.watchlistService.deleteWatchlist(req.params.id);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Watchlist deleted successfully',
            });
        } catch (error) {
            if (error.message === 'Watchlist not found') {
                return res.status(404).json({
                    error: { code: 'E3001', message: 'Watchlist not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * POST /watchlists/:id/assets — Add a financial asset to a watchlist.
     * 
     * Adds the specified symbol (e.g., "AAPL", "BTC") to the watchlist's
     * assets array with optional notes.
     * 
     * @param {import('express').Request} req - Express request (params.id + body.symbol)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async addAsset(req, res, next) {
        try {
            const { symbol, notes } = req.body;
            const watchlist = await this.watchlistService.addAssetToWatchlist(
                req.params.id,
                symbol,
                notes
            );

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Asset added to watchlist successfully',
                watchlist,
            });
        } catch (error) {
            if (error.message === 'Watchlist not found') {
                return res.status(404).json({
                    error: { code: 'E3001', message: 'Watchlist not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * DELETE /watchlists/:id/assets/:symbol — Remove an asset from a watchlist.
     * 
     * Removes the asset matching the given symbol from the watchlist's
     * assets array. The asset record in the assets collection is not affected.
     * 
     * @param {import('express').Request} req - Express request (params.id + params.symbol)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async removeAsset(req, res, next) {
        try {
            const watchlist = await this.watchlistService.removeAssetFromWatchlist(
                req.params.id,
                req.params.symbol
            );

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Asset removed from watchlist successfully',
                watchlist,
            });
        } catch (error) {
            if (error.message === 'Watchlist not found') {
                return res.status(404).json({
                    error: { code: 'E3001', message: 'Watchlist not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }
}

export default WatchlistController;
