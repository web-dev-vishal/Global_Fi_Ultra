/**
 * Global-Fi Ultra - User Controller
 * 
 * Handles HTTP requests for user management endpoints. Acts as the
 * presentation layer, translating HTTP request/response semantics into
 * service-layer calls. No business logic lives here — it delegates all
 * operations to UserService.
 * 
 * Error Handling Pattern:
 * - Known errors (User not found, Email conflict) are caught and returned
 *   as structured JSON responses with appropriate HTTP status codes.
 * - Unknown/unexpected errors are forwarded to the centralized error handler
 *   via `next(error)`.
 * 
 * Error Codes:
 * - E2001: User not found (404)
 * - E2002: Email already in use (409 Conflict)
 * 
 * @module controllers/UserController
 */

import { logger } from '../config/logger.js';

/**
 * Controller class for user management HTTP endpoints.
 * 
 * Injected via DI container with UserService dependency.
 * All methods follow the Express `(req, res, next)` signature and
 * are bound to routes in `userRoutes.js`.
 */
export class UserController {
    /**
     * Creates a new UserController instance.
     * 
     * @param {Object} dependencies - DI-injected dependencies
     * @param {import('../services/UserService.js').UserService} dependencies.userService - User business logic service
     */
    constructor({ userService }) {
        /** @type {import('../services/UserService.js').UserService} */
        this.userService = userService;
    }

    /**
     * GET /users — List all users with pagination and optional filtering.
     * 
     * Query Parameters:
     * - `page` (number, default 1): Page number for pagination
     * - `limit` (number, default 20): Results per page
     * - `isActive` (boolean): Filter by active/inactive status
     * - `sort` (string, default '-createdAt'): Sort field with direction
     * 
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async listUsers(req, res, next) {
        try {
            const { page, limit, isActive, sort } = req.query;

            // Build filter object from query params (only include defined params)
            const filter = {};
            if (isActive !== undefined) {
                filter.isActive = isActive;
            }

            const result = await this.userService.listUsers({
                page: page || 1,
                limit: limit || 20,
                filter,
                sort: sort || '-createdAt',  // Default: newest first
            });

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                ...result,  // Spreads { users, total, page, totalPages }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /users/:id — Get a single user by their MongoDB ObjectID.
     * 
     * Returns 404 with error code E2001 if the user does not exist.
     * The `passwordHash` field is excluded from the response by the
     * Mongoose schema (`select: false`).
     * 
     * @param {import('express').Request} req - Express request (params.id required)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async getUser(req, res, next) {
        try {
            const user = await this.userService.getUser(req.params.id);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                user,
            });
        } catch (error) {
            // Handle known "not found" error from UserService
            if (error.message === 'User not found') {
                return res.status(404).json({
                    error: {
                        code: 'E2001',
                        message: 'User not found',
                    },
                    requestId: req.requestId,
                });
            }
            next(error);  // Forward unexpected errors to error handler
        }
    }

    /**
     * POST /users — Create a new user account.
     * 
     * Request body is validated by Zod schema (createUserSchema) in the
     * route middleware before reaching this handler.
     * 
     * Protected by authRateLimiter (5 req/15min) to prevent mass
     * account creation and email enumeration attacks.
     * 
     * Returns 409 (Conflict) if the email is already registered.
     * 
     * @param {import('express').Request} req - Express request (validated body)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async createUser(req, res, next) {
        try {
            const user = await this.userService.createUser(req.body);

            res.status(201).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'User created successfully',
                user,
            });
        } catch (error) {
            // Handle email uniqueness constraint violation
            if (error.message === 'Email already in use') {
                return res.status(409).json({
                    error: {
                        code: 'E2002',
                        message: 'Email already in use',
                    },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * PUT /users/:id — Full update of an existing user.
     * 
     * Replaces all mutable fields with the values provided in the request body.
     * Fields not included in the body retain their current values (handled by
     * the service layer's merge logic).
     * 
     * @param {import('express').Request} req - Express request (params.id + validated body)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async updateUser(req, res, next) {
        try {
            const user = await this.userService.updateUser(req.params.id, req.body);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'User updated successfully',
                user,
            });
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({
                    error: {
                        code: 'E2001',
                        message: 'User not found',
                    },
                    requestId: req.requestId,
                });
            }
            if (error.message === 'Email already in use') {
                return res.status(409).json({
                    error: {
                        code: 'E2002',
                        message: 'Email already in use',
                    },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    /**
     * PATCH /users/:id — Partial update of an existing user.
     * 
     * Delegates to updateUser since the service layer handles partial
     * updates identically to full updates (only provided fields are changed).
     * 
     * @param {import('express').Request} req - Express request (params.id + validated body)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async patchUser(req, res, next) {
        // Reuse updateUser logic — Mongoose handles partial updates natively
        return this.updateUser(req, res, next);
    }

    /**
     * DELETE /users/:id — Soft-delete a user by setting isActive to false.
     * 
     * Does not permanently remove data from the database — the user record
     * is retained for audit trail purposes. The `isActive` flag prevents
     * the user from performing actions.
     * 
     * @param {import('express').Request} req - Express request (params.id required)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async deleteUser(req, res, next) {
        try {
            await this.userService.deleteUser(req.params.id);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'User deleted successfully',
            });
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({
                    error: {
                        code: 'E2001',
                        message: 'User not found',
                    },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }
}

export default UserController;
