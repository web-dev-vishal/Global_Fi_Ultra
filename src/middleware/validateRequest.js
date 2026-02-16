/**
 * Global-Fi Ultra - Request Validation Middleware
 * 
 * Generic Zod-based validation middleware that validates req.body, req.params,
 * and req.query against a combined schema. This is used across all resource
 * routes (users, alerts, watchlists, assets) to ensure input safety.
 * 
 * How It Works:
 * 1. Receives a Zod schema that may define `body`, `params`, and/or `query` fields.
 * 2. Constructs a validation payload from the corresponding Express request objects.
 * 3. Runs Zod's `safeParse` — if validation fails, returns a 400 with structured errors.
 * 4. If validation succeeds, replaces req.body/params/query with the validated
 *    (and potentially transformed/coerced) data, then calls next().
 * 
 * Security Considerations:
 * - Validates all input sources (body, params, query) — not just body.
 * - Zod's `.transform()` and `.trim()` coerce data early, preventing type confusion.
 * - Replacing req.body with validated data strips unknown fields not in the schema.
 * 
 * @module middleware/validateRequest
 */

import { logger } from '../config/logger.js';

/**
 * Creates an Express middleware that validates the request against a Zod schema.
 * 
 * The schema should be structured with optional top-level keys matching Express
 * request properties:
 * ```js
 * z.object({
 *   body: z.object({ ... }),    // Validates req.body
 *   params: z.object({ ... }), // Validates req.params
 *   query: z.object({ ... }),  // Validates req.query
 * });
 * ```
 * 
 * @param {import('zod').ZodSchema} schema - Zod schema with body/params/query structure
 * @returns {import('express').RequestHandler} Express middleware function
 * 
 * @example
 * // In a route file:
 * import { validateRequest } from '../middleware/index.js';
 * import { createUserSchema } from '../validators/userSchemas.js';
 * 
 * router.post('/', validateRequest(createUserSchema), (req, res, next) => {
 *   // req.body is now validated and sanitized
 *   controller.createUser(req, res, next);
 * });
 */
export const validateRequest = (schema) => {
    return (req, res, next) => {
        // Build the validation payload from all request input sources.
        // Only include keys that the schema actually defines, so schemas
        // that only validate `body` don't fail on missing `params`/`query`.
        const payload = {};

        if (req.body && Object.keys(req.body).length > 0) {
            payload.body = req.body;
        }
        if (req.params && Object.keys(req.params).length > 0) {
            payload.params = req.params;
        }
        if (req.query && Object.keys(req.query).length > 0) {
            payload.query = req.query;
        }

        // Run Zod validation — safeParse never throws, returns a result union
        const result = schema.safeParse(payload);

        if (!result.success) {
            // Log validation failures for monitoring (may indicate attack attempts)
            logger.debug('Request validation failed', {
                path: req.path,
                method: req.method,
                errors: result.error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
                requestId: req.requestId,
            });

            // Return structured error response matching existing error format
            return res.status(400).json({
                error: {
                    code: 'E1008',
                    message: 'Validation error',
                    details: result.error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                },
                requestId: req.requestId,
            });
        }

        // Replace request data with validated & coerced values.
        // This strips unrecognized fields and applies transformations
        // (e.g., toLowerCase, toUpperCase, Number coercion).
        if (result.data.body) req.body = result.data.body;
        if (result.data.params) req.params = result.data.params;
        if (result.data.query) req.query = result.data.query;

        next();
    };
};

export default validateRequest;
