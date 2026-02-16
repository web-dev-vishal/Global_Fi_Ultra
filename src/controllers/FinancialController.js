/**
 * Global-Fi Ultra - Financial Controller
 * 
 * Handles HTTP requests for financial data retrieval endpoints. This is the
 * primary data controller that orchestrates calls to multiple external APIs
 * (Alpha Vantage, CoinGecko, FRED, NewsAPI, Finnhub, ExchangeRate-API) and
 * returns aggregated financial data.
 * 
 * Two access patterns:
 * - `/live` — Triggers real-time API calls (slower, 2-5s). Automatically
 *   broadcasts data to connected WebSocket clients via Socket.io.
 * - `/cached` — Returns Redis-cached data (fast, <50ms). Preferred for
 *   dashboard rendering and high-frequency polling.
 * 
 * @module controllers/FinancialController
 */

import { logger } from '../config/logger.js';

/**
 * Controller class for financial data retrieval HTTP endpoints.
 * 
 * Injected via DI container with FinancialDataService and SocketManager.
 */
export class FinancialController {
    /**
     * Creates a new FinancialController instance.
     * 
     * @param {Object} dependencies - DI-injected dependencies
     * @param {import('../services/FinancialDataService.js').FinancialDataService} dependencies.financialDataService - Data orchestration service
     * @param {import('../infrastructure/websocket/SocketManager.js').SocketManager} dependencies.socketManager - WebSocket broadcast manager
     */
    constructor(dependencies) {
        /** @type {import('../services/FinancialDataService.js').FinancialDataService} */
        this.financialDataService = dependencies.financialDataService;
        /** @type {import('../infrastructure/websocket/SocketManager.js').SocketManager} */
        this.socketManager = dependencies.socketManager;
    }

    /**
     * GET /financial/live — Fetch fresh data from all external API sources.
     * 
     * Makes parallel requests to Alpha Vantage, CoinGecko, FRED, etc.
     * On success, broadcasts the data to all connected WebSocket clients
     * for real-time dashboard updates.
     * 
     * Query Parameters:
     * - `symbol` (string, default 'IBM'): Stock symbol to query
     * - `crypto` (string, default 'bitcoin,ethereum'): Comma-separated crypto IDs
     * - `currency` (string, default 'USD'): Base currency for conversions
     * - `newsQuery` (string, default 'finance OR stock market'): News search query
     * - `fredSeries` (string, default 'GDP'): FRED economic data series ID
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async getLive(req, res, next) {
        try {
            // Build options from query params with sensible defaults
            const options = {
                stockSymbol: req.query.symbol || 'IBM',
                cryptoIds: req.query.crypto || 'bitcoin,ethereum',
                baseCurrency: req.query.currency || 'USD',
                newsQuery: req.query.newsQuery || 'finance OR stock market',
                fredSeriesId: req.query.fredSeries || 'GDP',
            };

            // Execute parallel data fetching from all configured API sources
            const data = await this.financialDataService.execute(options);

            // Broadcast fresh data to all connected WebSocket clients
            // (only if the fetch was at least partially successful)
            if (data.status !== 'error') {
                this.socketManager.broadcastFinancialData(data);
            }

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /financial/cached — Return cached financial data from Redis.
     * 
     * Returns 404 if no cached data exists (cache is cold or expired).
     * This endpoint never makes external API calls, so it's safe for
     * high-frequency polling.
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async getCached(req, res, next) {
        try {
            const cachedData = await this.financialDataService.getCachedData();

            // No cached data — cache is cold or has expired
            if (!cachedData) {
                return res.status(404).json({
                    error: {
                        code: 'E1010',
                        message: 'No cached data available',
                    },
                    requestId: req.requestId,
                });
            }

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                status: 'cached',
                data: cachedData,
                metadata: {
                    fromCache: true,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

export default FinancialController;
