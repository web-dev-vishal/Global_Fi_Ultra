/**
 * Global-Fi Ultra - Asset Controller
 * 
 * Handles HTTP requests for financial asset management endpoints.
 * Assets represent financial instruments (stocks, crypto, forex, commodities, indices)
 * tracked in the system. Supports CRUD operations and live data retrieval.
 * 
 * The `getLiveAssetData` endpoint is notable: it fetches real-time data from
 * external APIs (Alpha Vantage, CoinGecko, etc.) via FinancialDataService,
 * making it significantly more expensive than other endpoints.
 * 
 * Error Codes:
 * - E5001: Asset not found (404)
 * - E5002: Asset with symbol already exists (409 Conflict)
 * 
 * @module controllers/AssetController
 */

import { logger } from '../config/logger.js';

/**
 * Controller class for financial asset management HTTP endpoints.
 * 
 * Injected via DI container with AssetService and FinancialDataService dependencies.
 */
export class AssetController {
    /**
     * Creates a new AssetController instance.
     * 
     * @param {Object} dependencies - DI-injected dependencies
     * @param {import('../services/AssetService.js').AssetService} dependencies.assetService - Asset CRUD service
     * @param {import('../services/FinancialDataService.js').FinancialDataService} dependencies.financialDataService - External API data aggregation service
     */
    constructor({ assetService, financialDataService }) {
        /** @type {import('../services/AssetService.js').AssetService} */
        this.assetService = assetService;
        /** @type {import('../services/FinancialDataService.js').FinancialDataService} */
        this.financialDataService = financialDataService;
    }

    /**
     * GET /assets — Search or list all assets with optional filters.
     * 
     * Query Parameters:
     * - `type` (string): Filter by asset type (stock, crypto, forex, commodity, index)
     * - `search` (string): Full-text search across symbol and name
     * - `isActive` (boolean): Filter by active/inactive status
     * - `page` (number, default 1): Page number
     * - `limit` (number, default 20): Results per page
     * - `sort` (string, default '-lastUpdated'): Sort field with direction
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async searchAssets(req, res, next) {
        try {
            const { type, search, isActive, page, limit, sort } = req.query;

            // Build filter object from query parameters
            const filter = {};
            if (type) filter.type = type;
            if (isActive !== undefined) filter.isActive = isActive;

            const result = await this.assetService.searchAssets({
                page: page || 1,
                limit: limit || 20,
                filter,
                sort: sort || '-lastUpdated',
                search: search || '',
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
     * GET /assets/:symbol — Get a single asset by its ticker symbol.
     * 
     * Symbols are case-insensitive (normalized to uppercase by the validator).
     * 
     * @param {import('express').Request} req - Express request (params.symbol required)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async getAsset(req, res, next) {
        try {
            const asset = await this.assetService.getAsset(req.params.symbol);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                asset,
            });
        } catch (error) {
            if (error.message === 'Asset not found') {
                return res.status(404).json({
                    error: { code: 'E5001', message: 'Asset not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * GET /assets/:symbol/live — Fetch live market data from external APIs.
     * 
     * This is the most expensive endpoint in asset management — it makes
     * real-time API calls to Alpha Vantage (stocks) or CoinGecko (crypto)
     * via the FinancialDataService orchestrator.
     * 
     * Behavior:
     * 1. Looks up the asset in the DB to determine its type (stock/crypto)
     * 2. If not found in DB, defaults to 'stock' type
     * 3. Calls the appropriate external API based on type
     * 4. Returns combined DB record + live data
     * 
     * @param {import('express').Request} req - Express request (params.symbol)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async getLiveAssetData(req, res, next) {
        try {
            const { symbol } = req.params;
            const { forceRefresh } = req.query;

            // Attempt to look up the asset in the database for type information.
            // If it doesn't exist yet, that's fine — we'll default to 'stock'.
            let asset;
            try {
                asset = await this.assetService.getAsset(symbol);
            } catch (error) {
                asset = null;  // Asset doesn't exist in DB — proceed with defaults
            }

            // Determine asset type for routing to the correct external API
            const assetType = asset?.type || 'stock';
            let liveData;

            if (assetType === 'stock') {
                // Fetch from Alpha Vantage and other stock data sources
                liveData = await this.financialDataService.execute({
                    stockSymbol: symbol,
                    cryptoIds: '',
                    baseCurrency: 'USD',
                    newsQuery: symbol,
                    fredSeriesId: 'GDP',
                });
            } else if (assetType === 'crypto') {
                // Fetch from CoinGecko for cryptocurrency data
                liveData = await this.financialDataService.execute({
                    stockSymbol: 'IBM',            // Placeholder — not used for crypto
                    cryptoIds: symbol.toLowerCase(), // CoinGecko uses lowercase IDs
                    baseCurrency: 'USD',
                    newsQuery: symbol,
                    fredSeriesId: 'GDP',
                });
            }

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                symbol,
                assetInfo: asset,    // DB record (may be null)
                liveData,            // Real-time data from external APIs
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /assets — Create a new financial asset record.
     * 
     * Adds a new asset to the tracking database. Returns 409 if an asset
     * with the same symbol already exists.
     * 
     * @param {import('express').Request} req - Express request (validated body)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async createAsset(req, res, next) {
        try {
            const asset = await this.assetService.createAsset(req.body);

            res.status(201).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Asset created successfully',
                asset,
            });
        } catch (error) {
            if (error.message === 'Asset with this symbol already exists') {
                return res.status(409).json({
                    error: { code: 'E5002', message: 'Asset with this symbol already exists' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * PUT /assets/:symbol — Update an existing asset by its ticker symbol.
     * 
     * @param {import('express').Request} req - Express request (params.symbol + validated body)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async updateAsset(req, res, next) {
        try {
            const asset = await this.assetService.updateAsset(req.params.symbol, req.body);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Asset updated successfully',
                asset,
            });
        } catch (error) {
            if (error.message === 'Asset not found') {
                return res.status(404).json({
                    error: { code: 'E5001', message: 'Asset not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * DELETE /assets/:symbol — Delete a financial asset by its ticker symbol.
     * 
     * @param {import('express').Request} req - Express request (params.symbol required)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async deleteAsset(req, res, next) {
        try {
            await this.assetService.deleteAsset(req.params.symbol);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Asset deleted successfully',
            });
        } catch (error) {
            if (error.message === 'Asset not found') {
                return res.status(404).json({
                    error: { code: 'E5001', message: 'Asset not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }
}

export default AssetController;
