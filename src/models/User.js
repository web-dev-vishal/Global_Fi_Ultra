/**
 * Global-Fi Ultra - User Model
 * 
 * Mongoose schema and model for user accounts. Users are the primary
 * actors in the system — they own watchlists, alerts, and preferences
 * for financial data customization.
 * 
 * Schema Design:
 * ──────────────────────────────────────────────────────────────────────
 * | Field              | Type    | Required | Notes                    |
 * |--------------------|---------|----------|--------------------------|
 * | email              | String  | Yes      | Unique, lowercase, indexed|
 * | passwordHash       | String  | No       | select:false for security |
 * | firstName          | String  | Yes      | Max 50 chars             |
 * | lastName           | String  | Yes      | Max 50 chars             |
 * | isActive           | Boolean | No       | Default: true, indexed   |
 * | preferences        | Object  | No       | Default currency, stocks |
 * | metadata           | Mixed   | No       | Extensible key-value store|
 * ──────────────────────────────────────────────────────────────────────
 * 
 * Security:
 * - `passwordHash` uses `select: false` — never included in queries unless
 *   explicitly requested with `.select('+passwordHash')`. This prevents
 *   accidental exposure in API responses.
 * - Email validation uses regex at the schema level as a safety net
 *   (primary validation is via Zod schemas in the middleware layer).
 * 
 * Indexes:
 * - `email` — unique index for login lookups and duplicate detection
 * - `isActive` — for filtering active/inactive users
 * - `{isActive, createdAt}` — compound index for sorted active user queries
 * - `createdAt` — descending, for "newest first" default sorting
 * 
 * @module models/User
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * User Mongoose schema definition.
 * 
 * @type {mongoose.Schema}
 */
const userSchema = new Schema({
    /** 
     * User's email address — the primary identifier for authentication.
     * Automatically lowercased and trimmed to ensure consistent lookups.
     */
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    /**
     * Bcrypt-hashed password. Marked as `select: false` to prevent
     * accidental inclusion in API responses. Must be explicitly selected
     * with `.select('+passwordHash')` when needed for auth verification.
     * Optional for now — will be required when auth is fully implemented.
     */
    passwordHash: {
        type: String,
        required: false,
        select: false,
    },

    /** User's first name (max 50 characters, trimmed) */
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },

    /** User's last name (max 50 characters, trimmed) */
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },

    /**
     * Active status flag. When false, the user is considered "soft-deleted"
     * and should be excluded from normal application operations.
     */
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },

    /**
     * User preferences for customizing the financial data experience.
     * These defaults are used when fetching financial data without
     * explicit parameters.
     */
    preferences: {
        /** ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP') */
        defaultCurrency: {
            type: String,
            default: 'USD',
            uppercase: true,
        },
        /** Default stock ticker symbol for quick access */
        defaultStockSymbol: {
            type: String,
            default: 'IBM',
            uppercase: true,
        },
        /** Comma-separated CoinGecko cryptocurrency IDs */
        defaultCryptoIds: {
            type: String,
            default: 'bitcoin,ethereum',
        },
        /** Notification channel preferences */
        notifications: {
            /** Whether to send email notifications for alerts */
            email: {
                type: Boolean,
                default: true,
            },
            /** Whether to send real-time WebSocket notifications */
            websocket: {
                type: Boolean,
                default: true,
            },
        },
    },

    /**
     * Extensible metadata object for storing additional user-specific
     * data without schema changes. Uses Mixed type for flexibility.
     */
    metadata: {
        type: Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,       // Adds createdAt and updatedAt fields automatically
    collection: 'users',    // Explicit collection name
});

// ─── Compound Indexes ────────────────────────────────────────────────────────
// Optimized for common query patterns: listing active users sorted by date
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, createdAt: -1 });

// ─── Virtual Properties ──────────────────────────────────────────────────────
/**
 * Virtual property that concatenates firstName and lastName.
 * Included in JSON and object serialization via toJSON/toObject settings.
 * 
 * @type {string}
 */
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual properties are included in JSON serialization (API responses)
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

/**
 * Mongoose User model.
 * 
 * @type {mongoose.Model}
 */
export const User = mongoose.model('User', userSchema);

export default User;
