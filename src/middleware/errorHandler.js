/**
 * Global-Fi Ultra - Error Handler Middleware
 * 
 * Centralized Express error-handling middleware that catches all errors
 * propagated via `next(error)` from controllers and middleware.
 * 
 * Error Classification Strategy:
 * ──────────────────────────────────────────────────────────────────────
 * | Error Type           | HTTP Status | Error Code | When                |
 * |----------------------|-------------|------------|---------------------|
 * | AppError (custom)    | Varies      | Varies     | Business logic errs |
 * | ZodError             | 400         | E1008      | Input validation    |
 * | Mongoose Validation  | 400         | E1008      | Schema validation   |
 * | Unknown/unhandled    | 500         | E1009      | Unexpected failures |
 * ──────────────────────────────────────────────────────────────────────
 * 
 * Security Considerations:
 * - In production, stack traces and internal error details are NEVER exposed.
 * - Error messages for unknown errors are replaced with a generic message.
 * - Zod and Mongoose validation details are only shown in development mode.
 * - All errors are logged with Winston for post-incident analysis.
 * 
 * @module middleware/errorHandler
 */

import { AppError } from '../utils/errors.js';
import { logger } from '../config/logger.js';
import { config } from '../config/environment.js';

/**
 * Express error-handling middleware (4-argument signature required by Express).
 * 
 * This function is the LAST middleware in the chain. It classifies errors
 * by type and returns appropriate HTTP status codes and structured JSON
 * error responses. All errors are logged before responding.
 * 
 * @param {Error} err - The error object thrown or passed via next(error)
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function (required for signature but unused)
 * @returns {void}
 * 
 * @example
 * // In a controller:
 * async getUser(req, res, next) {
 *   try {
 *     const user = await this.userService.getUser(req.params.id);
 *     res.json({ user });
 *   } catch (error) {
 *     next(error); // Caught by this error handler
 *   }
 * }
 */
export const errorHandler = (err, req, res, next) => {
    // Extract request ID for correlation in logs and API responses
    const requestId = req.requestId || 'unknown';

    // ── Step 1: Log the error with full context ──────────────────────────
    // Stack traces are only logged in development to avoid log bloat in production.
    logger.error('Request error', {
        requestId,
        path: req.path,
        method: req.method,
        error: err.message,
        stack: config.server.isDev ? err.stack : undefined,
        code: err.code,
    });

    // ── Step 2: Classify and respond based on error type ─────────────────

    // Handle operational errors (custom AppError subclasses like ValidationError,
    // DatabaseError, ExternalAPIError, CircuitBreakerError).
    // These are "expected" errors with known HTTP statuses and error codes.
    if (err instanceof AppError) {
        return res.status(err.httpStatus).json({
            error: {
                code: err.code,
                // In production, show the user-friendly message.
                // In dev, prefer detailed `details` field for debugging.
                message: config.server.isProd ? err.message : err.details || err.message,
            },
            requestId,
        });
    }

    // Handle Zod validation errors (thrown when schema.parse() fails).
    // These occur when request input doesn't match the expected schema.
    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: {
                code: 'E1008',
                message: 'Validation error',
                // Only expose field-level details in development to avoid
                // leaking schema structure in production.
                details: config.server.isDev ? err.errors : undefined,
            },
            requestId,
        });
    }

    // Handle Mongoose validation errors (e.g., required field missing, 
    // unique constraint violated, custom validator failed).
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: {
                code: 'E1008',
                message: 'Validation error',
                details: config.server.isDev ? err.message : undefined,
            },
            requestId,
        });
    }

    // ── Step 3: Handle unknown/unexpected errors ─────────────────────────
    // SECURITY: In production, NEVER expose internal error messages or stack traces.
    // The generic "Internal server error" message prevents information disclosure attacks.
    return res.status(500).json({
        error: {
            code: 'E1009',
            message: config.server.isProd ? 'Internal server error' : err.message,
        },
        requestId,
    });
};

/**
 * 404 Not Found handler middleware.
 * 
 * Catches all requests that don't match any defined route. Placed AFTER
 * all route registrations but BEFORE the error handler in the middleware chain.
 * 
 * Returns a structured JSON error with the attempted HTTP method and path,
 * which helps API consumers debug incorrect endpoint calls.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void}
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: {
            code: 'E1010',
            message: `Route not found: ${req.method} ${req.path}`,
        },
        requestId: req.requestId,
    });
};

export default errorHandler;
