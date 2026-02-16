/**
 * Global-Fi Ultra - Application Error Classes
 * 
 * Custom error hierarchy for structured, typed error handling throughout
 * the application. All custom errors extend `AppError`, which provides
 * a consistent interface for the centralized error handler middleware.
 * 
 * Error Hierarchy:
 * ──────────────────────────────────────────────────────────────────────
 * | Class              | Code  | HTTP Status | Use Case                |
 * |--------------------|-------|-------------|-------------------------|
 * | AppError           | E1009 | 500         | Base class / generic    |
 * | ValidationError    | E1008 | 400         | Invalid input data      |
 * | DatabaseError      | E1005 | 500         | MongoDB failures        |
 * | ExternalAPIError   | E1006 | 502         | 3rd-party API failures  |
 * | CircuitBreakerError| E1007 | 503         | Circuit breaker open    |
 * ──────────────────────────────────────────────────────────────────────
 * 
 * The `isOperational` flag distinguishes expected errors (e.g., "user not found")
 * from programmer errors (e.g., null pointer). The error handler uses this
 * to decide whether to show the error message to the client.
 * 
 * @module utils/errors
 */

/**
 * Base application error class.
 * 
 * All custom errors should extend this class. The centralized error handler
 * in `middleware/errorHandler.js` checks `instanceof AppError` to determine
 * whether an error is operational (expected) or a bug.
 * 
 * @extends Error
 */
export class AppError extends Error {
    /**
     * @param {string} message - Human-readable error message (shown to client)
     * @param {string} [code='E1009'] - Application error code for client-side error handling
     * @param {number} [httpStatus=500] - HTTP status code for the response
     * @param {*} [details=null] - Additional error details (only shown in development)
     */
    constructor(message, code = 'E1009', httpStatus = 500, details = null) {
        super(message);
        this.name = 'AppError';
        /** @type {string} Application-specific error code */
        this.code = code;
        /** @type {number} HTTP status code to use in the response */
        this.httpStatus = httpStatus;
        /** @type {*} Additional details (shown only in development mode) */
        this.details = details;
        /** @type {boolean} True for operational errors, false for programmer errors */
        this.isOperational = true;
    }
}

/**
 * Validation error for invalid user input (HTTP 400 Bad Request).
 * 
 * Thrown when input data fails business logic validation (as opposed to
 * Zod schema validation, which is caught separately by the error handler).
 * 
 * @extends AppError
 */
export class ValidationError extends AppError {
    /**
     * @param {string} message - Description of what validation failed
     * @param {*} [details=null] - Field-level validation details
     */
    constructor(message, details = null) {
        super(message, 'E1008', 400, details);
        this.name = 'ValidationError';
    }
}

/**
 * Database error for MongoDB/Mongoose failures (HTTP 500).
 * 
 * Thrown when database operations fail unexpectedly (connection lost,
 * write conflict, etc.). Distinct from "not found" errors, which use
 * plain Error objects.
 * 
 * @extends AppError
 */
export class DatabaseError extends AppError {
    /**
     * @param {string} message - Description of the database failure
     * @param {*} [details=null] - Mongoose error details
     */
    constructor(message, details = null) {
        super(message, 'E1005', 500, details);
        this.name = 'DatabaseError';
    }
}

/**
 * External API error for third-party service failures (HTTP 502 Bad Gateway).
 * 
 * Thrown when an external API (Alpha Vantage, CoinGecko, FRED, etc.)
 * returns an error, times out, or returns unexpected data.
 * 
 * @extends AppError
 */
export class ExternalAPIError extends AppError {
    /**
     * @param {string} message - Description of the API failure
     * @param {string} [service='unknown'] - Name of the failing service (e.g., 'AlphaVantage')
     * @param {*} [details=null] - Raw API error details
     */
    constructor(message, service = 'unknown', details = null) {
        super(message, 'E1006', 502, details);
        this.name = 'ExternalAPIError';
        /** @type {string} The external service that failed */
        this.service = service;
    }
}

/**
 * Circuit breaker error when a service is temporarily unavailable (HTTP 503).
 * 
 * Thrown when the circuit breaker for an external API is in the "open" state,
 * meaning the service has failed repeatedly and requests are being short-circuited
 * to prevent further load on the failing service.
 * 
 * @extends AppError
 */
export class CircuitBreakerError extends AppError {
    /**
     * @param {string} service - Name of the service whose circuit breaker is open
     */
    constructor(service) {
        super(`Circuit breaker is open for ${service}`, 'E1007', 503);
        this.name = 'CircuitBreakerError';
        /** @type {string} The service whose circuit breaker tripped */
        this.service = service;
    }
}

export default { AppError, ValidationError, DatabaseError, ExternalAPIError, CircuitBreakerError };
