/**
 * Global-Fi Ultra - Request Logger Middleware
 * 
 * Logs all HTTP requests with method, path, status code, response duration,
 * and client metadata. Uses the `finish` event on the response object to capture
 * the final status code and timing after the response has been fully sent.
 * 
 * Log Output Fields:
 * - `method`: HTTP method (GET, POST, PUT, DELETE, PATCH)
 * - `path`: Full original URL including query string
 * - `statusCode`: HTTP response status code
 * - `duration`: Response time in milliseconds
 * - `ip`: Client IP address (respects `trust proxy` for reverse proxies)
 * - `userAgent`: Client User-Agent header
 * - `userId`: Authenticated user's ID or 'anonymous' if unauthenticated
 * - `requestId`: Correlation ID from requestIdMiddleware
 * - `contentLength`: Response body size in bytes
 * 
 * Performance Notes:
 * - Uses `Date.now()` for low-overhead timing (sub-microsecond precision
 *   is unnecessary for HTTP request logging).
 * - The `finish` event fires after the last byte is handed off to the OS,
 *   so duration includes response serialization but not network transfer.
 * 
 * @module middleware/requestLogger
 */

import { logger } from '../config/logger.js';

/**
 * Middleware that logs HTTP request/response pairs after the response completes.
 * 
 * Attaches a `finish` event listener to the response object. This is a
 * non-blocking approach — the listener fires asynchronously after the
 * response is sent, so it does not add latency to the request pipeline.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
export const requestLogger = (req, res, next) => {
    // Capture start time before any downstream processing
    const startTime = Date.now();

    // Listen for the response `finish` event, which fires after the response
    // has been fully sent (headers + body). This ensures we log the actual
    // final status code, not a preliminary one.
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info('HTTP Request', {
            method: req.method,
            path: req.originalUrl,        // Use originalUrl to include query params
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,                   // Respects trust proxy setting
            userAgent: req.get('User-Agent'),
            userId: req.user?.id || 'anonymous',  // Will be populated when auth is implemented
            requestId: req.requestId,
            contentLength: res.get('Content-Length'),
        });
    });

    next();
};

export default requestLogger;
