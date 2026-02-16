/**
 * Global-Fi Ultra - Status Controller
 * 
 * Provides system status and monitoring endpoints for observing the
 * health of external API integrations and the current rate limiting
 * configuration.
 * 
 * Useful for operations dashboards and debugging API connectivity issues.
 * 
 * @module controllers/StatusController
 */

/**
 * Controller class for system status HTTP endpoints.
 * 
 * Injected via DI container with an array of API client instances
 * that each expose circuit breaker status.
 */
export class StatusController {
    /**
     * Creates a new StatusController instance.
     * 
     * @param {Object} dependencies - DI-injected dependencies
     * @param {Array<import('../infrastructure/http/BaseApiClient.js').BaseApiClient>} dependencies.apiClients - Array of API client instances with circuit breakers
     */
    constructor(dependencies) {
        /** @type {Array} Array of API clients (AlphaVantage, CoinGecko, FRED, etc.) */
        this.apiClients = dependencies.apiClients || [];
    }

    /**
     * GET /status/circuit-breakers — Shows the state of each external API circuit breaker.
     * 
     * Returns the current state (closed/open/half-open) of each external API's
     * circuit breaker, along with failure counts and last state change timestamps.
     * 
     * Circuit Breaker States:
     * - `closed`: API is healthy, requests flow normally
     * - `open`: API is down, requests are short-circuited (fail fast)
     * - `half-open`: Testing if API has recovered (allows one probe request)
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @returns {void}
     */
    getCircuitBreakers(req, res) {
        // Map each API client to its circuit breaker status
        const states = this.apiClients.map(client => client.getCircuitBreakerStatus());

        res.status(200).json({
            circuitBreakers: states,
            requestId: req.requestId,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * GET /status/rate-limits — Shows external API rate limiting configuration.
     * 
     * Returns the known rate limits for each external API service.
     * Note: `usage` is currently 'N/A' — real usage tracking would require
     * a Redis-backed counter for each API. This is a placeholder for future
     * enhancement.
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @returns {void}
     */
    getRateLimits(req, res) {
        // Static rate limit information for each external API
        // TODO: Implement Redis-backed usage tracking for real-time usage stats
        const rateLimits = {
            alpha_vantage: { limit: 5, period: '1 minute', usage: 'N/A' },
            coingecko: { limit: 50, period: '1 minute', usage: 'N/A' },
            exchangerate_api: { limit: 1500, period: '1 month', usage: 'N/A' },
            newsapi: { limit: 100, period: '1 day', usage: 'N/A' },
            fred: { limit: 'unlimited', period: 'N/A', usage: 'N/A' },
            finnhub: { limit: 60, period: '1 minute', usage: 'N/A' },
        };

        res.status(200).json({
            rateLimits,
            requestId: req.requestId,
            timestamp: new Date().toISOString(),
        });
    }
}

export default StatusController;
