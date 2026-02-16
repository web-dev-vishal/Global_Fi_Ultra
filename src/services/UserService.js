/**
 * Global-Fi Ultra - User Service
 * 
 * Business logic layer for user management operations. Acts as the
 * intermediary between controllers (HTTP layer) and repositories
 * (data access layer), enforcing business rules like email uniqueness.
 * 
 * All methods follow a consistent pattern:
 * 1. Validate business constraints (e.g., email uniqueness)
 * 2. Delegate to UserRepository for data operations
 * 3. Log the outcome (success or failure)
 * 4. Return the result or throw a descriptive error
 * 
 * Error Strategy:
 * - Throws descriptive Error objects (e.g., 'User not found', 'Email already in use')
 * - Controllers catch these messages and map them to HTTP status codes
 * - All errors are logged before being re-thrown for controller handling
 * 
 * @module services/UserService
 */

import { logger } from '../config/logger.js';

/**
 * Service class for user management business logic.
 * 
 * Injected via DI container with UserRepository dependency.
 * This class contains NO HTTP-specific logic — it works with
 * plain JavaScript objects, making it testable in isolation.
 */
export class UserService {
    /**
     * Creates a new UserService instance.
     * 
     * @param {Object} dependencies - DI-injected dependencies
     * @param {import('../infrastructure/repositories/UserRepository.js').UserRepository} dependencies.userRepository - User data access layer
     */
    constructor({ userRepository }) {
        /** @type {import('../infrastructure/repositories/UserRepository.js').UserRepository} */
        this.userRepository = userRepository;
    }

    /**
     * Create a new user account.
     * 
     * Business Rules:
     * - Email must be unique across all users (case-insensitive, lowercased by schema)
     * - Throws 'Email already in use' if a duplicate is detected
     * 
     * @param {Object} userData - User creation data
     * @param {string} userData.email - Unique email address
     * @param {string} userData.firstName - User's first name
     * @param {string} userData.lastName - User's last name
     * @param {Object} [userData.preferences] - Optional user preferences
     * @returns {Promise<Object>} The created user document (without passwordHash)
     * @throws {Error} 'Email already in use' if email is not unique
     */
    async createUser(userData) {
        try {
            // Enforce email uniqueness before attempting creation
            // (Mongoose unique index provides a safety net, but this gives a cleaner error)
            const exists = await this.userRepository.emailExists(userData.email);
            if (exists) {
                throw new Error('Email already in use');
            }

            const user = await this.userRepository.create(userData);
            logger.info('User created successfully', { userId: user._id });

            return user;
        } catch (error) {
            logger.error('Error in createUser', { error: error.message });
            throw error;
        }
    }

    /**
     * Get a single user by their MongoDB ObjectID.
     * 
     * @param {string} userId - MongoDB ObjectID string
     * @returns {Promise<Object>} The user document
     * @throws {Error} 'User not found' if no user exists with the given ID
     */
    async getUser(userId) {
        try {
            const user = await this.userRepository.findById(userId);

            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            logger.error('Error in getUser', { userId, error: error.message });
            throw error;
        }
    }

    /**
     * List users with pagination, filtering, and sorting.
     * 
     * @param {Object} options - Query options
     * @param {number} [options.page=1] - Page number (1-based)
     * @param {number} [options.limit=20] - Results per page
     * @param {Object} [options.filter] - MongoDB-compatible filter object
     * @param {string} [options.sort='-createdAt'] - Sort field with direction prefix
     * @returns {Promise<{users: Array, total: number, page: number, totalPages: number}>}
     */
    async listUsers(options = {}) {
        try {
            return await this.userRepository.findAll(options);
        } catch (error) {
            logger.error('Error in listUsers', { error: error.message });
            throw error;
        }
    }

    /**
     * Update an existing user's data.
     * 
     * If the email is being changed, performs a uniqueness check to prevent
     * conflicts with other users (excluding the current user's own record).
     * 
     * @param {string} userId - MongoDB ObjectID string
     * @param {Object} updateData - Fields to update
     * @returns {Promise<Object>} The updated user document
     * @throws {Error} 'User not found' if the user doesn't exist
     * @throws {Error} 'Email already in use' if the new email conflicts
     */
    async updateUser(userId, updateData) {
        try {
            // If email is being updated, verify the new email isn't taken by another user
            if (updateData.email) {
                const exists = await this.userRepository.emailExists(updateData.email, userId);
                if (exists) {
                    throw new Error('Email already in use');
                }
            }

            const user = await this.userRepository.update(userId, updateData);

            if (!user) {
                throw new Error('User not found');
            }

            logger.info('User updated successfully', { userId });
            return user;
        } catch (error) {
            logger.error('Error in updateUser', { userId, error: error.message });
            throw error;
        }
    }

    /**
     * Soft-delete a user (set isActive = false).
     * 
     * Retains the user record in the database for audit trail purposes.
     * The user will no longer appear in active user listings.
     * 
     * @param {string} userId - MongoDB ObjectID string
     * @returns {Promise<Object>} The soft-deleted user document
     * @throws {Error} 'User not found' if the user doesn't exist
     */
    async deleteUser(userId) {
        try {
            const user = await this.userRepository.delete(userId);

            if (!user) {
                throw new Error('User not found');
            }

            logger.info('User deleted successfully', { userId });
            return user;
        } catch (error) {
            logger.error('Error in deleteUser', { userId, error: error.message });
            throw error;
        }
    }

    /**
     * Permanently delete a user from the database (admin-only operation).
     * 
     * WARNING: This is irreversible. The user record and all associated
     * data will be permanently removed. Should only be used for GDPR
     * data erasure requests or by system administrators.
     * 
     * @param {string} userId - MongoDB ObjectID string
     * @returns {Promise<boolean>} True if deletion was successful
     * @throws {Error} 'User not found' if the user doesn't exist
     */
    async hardDeleteUser(userId) {
        try {
            const success = await this.userRepository.hardDelete(userId);

            if (!success) {
                throw new Error('User not found');
            }

            logger.warn('User hard deleted', { userId });
            return success;
        } catch (error) {
            logger.error('Error in hardDeleteUser', { userId, error: error.message });
            throw error;
        }
    }
}

export default UserService;
