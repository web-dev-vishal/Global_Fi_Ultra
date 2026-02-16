/**
 * Global-Fi Ultra - Security Middleware
 * 
 * Configures HTTP security headers (via Helmet) and Cross-Origin Resource
 * Sharing (CORS) policies. These two middleware functions run early in the
 * request pipeline — before any route handlers — to establish baseline
 * security for all responses.
 * 
 * Security Layers Provided:
 * ──────────────────────────────────────────────────────────────────────
 * | Header                        | Purpose                           |
 * |-------------------------------|-----------------------------------|
 * | Content-Security-Policy       | Prevents XSS, clickjacking       |
 * | X-Content-Type-Options        | Prevents MIME type sniffing       |
 * | X-Frame-Options               | Prevents iframe embedding        |
 * | X-XSS-Protection              | Legacy XSS filter                |
 * | Strict-Transport-Security     | Forces HTTPS in browsers         |
 * | Access-Control-Allow-Origin   | Controls cross-origin access     |
 * ──────────────────────────────────────────────────────────────────────
 * 
 * CORS Strategy:
 * - Development: Allow all origins for easy local development
 * - Production: Whitelist only the origins specified in CORS_ORIGIN env var
 * - Requests without `Origin` header (curl, mobile apps, Postman) are always allowed
 * 
 * @module middleware/securityMiddleware
 */

import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/environment.js';

/**
 * Helmet security headers configuration.
 * 
 * Helmet sets 15+ HTTP security headers by default. We customize:
 * - CSP directives to allow WebSocket connections (`ws:`, `wss:`) needed
 *   for Socket.io streaming, and `data:` URIs for inline images.
 * - crossOriginEmbedderPolicy is disabled because it blocks cross-origin
 *   API resources that our client may need to load.
 * - crossOriginResourcePolicy is set to 'cross-origin' to allow external
 *   frontends to consume our API responses.
 * 
 * @type {import('express').RequestHandler}
 */
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],              // Only allow resources from same origin
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (needed for some clients)
            scriptSrc: ["'self'"],               // Only allow scripts from same origin
            imgSrc: ["'self'", 'data:', 'https:'], // Allow data URIs and HTTPS images
            connectSrc: ["'self'", 'ws:', 'wss:'], // Allow WebSocket connections for Socket.io
        },
    },
    crossOriginEmbedderPolicy: false,           // Disabled to allow cross-origin API access
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow external origins to read responses
});

/**
 * CORS (Cross-Origin Resource Sharing) configuration.
 * 
 * Controls which domains can make requests to this API. Uses a dynamic
 * origin callback to support environment-specific whitelisting:
 * - Production: Only origins listed in the CORS_ORIGIN env var are allowed
 * - Development: All origins are allowed for convenience
 * - No-origin requests (curl, Postman, server-to-server) are always allowed
 * 
 * Configuration:
 * - `credentials: true` — allows cookies/auth headers in cross-origin requests
 * - `methods` — explicitly lists allowed HTTP methods
 * - `allowedHeaders` — headers the client can send
 * - `exposedHeaders` — headers the client can read from the response
 * - `maxAge` — browser caches preflight for 24 hours to reduce OPTIONS requests
 * 
 * @type {import('express').RequestHandler}
 */
export const corsMiddleware = cors({
    origin: (origin, callback) => {
        // Allow requests with no Origin header — these come from:
        // - curl, Postman, and other HTTP clients
        // - Mobile apps making direct API calls
        // - Server-to-server requests (microservices, webhooks)
        if (!origin) {
            return callback(null, true);
        }

        // Check if the origin is in the whitelist (from CORS_ORIGIN env var)
        if (config.security.corsOrigins.includes(origin)) {
            return callback(null, true);
        }

        // In development mode, allow ALL origins to simplify local testing
        // with different frontend ports (Vite: 5173, React: 3000, etc.)
        if (config.server.isDev) {
            return callback(null, true);
        }

        // Reject the request — the origin is not whitelisted in production
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,                          // Allow cookies and Authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Supported HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'], // Headers the client can send
    exposedHeaders: ['X-Request-Id'],           // Headers the client can read from our response
    maxAge: 86400,                              // Cache preflight responses for 24 hours (seconds)
});

export default { securityHeaders, corsMiddleware };
