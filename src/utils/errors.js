/**
 * Global-Fi Ultra - Application Error Classes
 * 
 * Custom error classes for structured error handling.
 */

/**
 * Base application error
 */
export class AppError extends Error {
    constructor(message, code = 'E1009', httpStatus = 500, details = null) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.httpStatus = httpStatus;
        this.details = details;
        this.isOperational = true;
    }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 'E1008', 400, details);
        this.name = 'ValidationError';
    }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
    constructor(message, details = null) {
        super(message, 'E1005', 500, details);
        this.name = 'DatabaseError';
    }
}

/**
 * External API error (502)
 */
export class ExternalAPIError extends AppError {
    constructor(message, service = 'unknown', details = null) {
        super(message, 'E1006', 502, details);
        this.name = 'ExternalAPIError';
        this.service = service;
    }
}

/**
 * Circuit breaker error (503)
 */
export class CircuitBreakerError extends AppError {
    constructor(service) {
        super(`Circuit breaker is open for ${service}`, 'E1007', 503);
        this.name = 'CircuitBreakerError';
        this.service = service;
    }
}

export default { AppError, ValidationError, DatabaseError, ExternalAPIError, CircuitBreakerError };
