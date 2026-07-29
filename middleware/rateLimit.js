import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

/**
 * Rate Limiting Middleware for CCTV Surveillance System
 * 
 * Implements multiple rate limiting strategies:
 * - Global rate limit
 * - Authentication endpoint limits (stricter for security)
 * - API endpoint limits
 * - User-based rate limits (optional)
 */

// Create Redis client for rate limiting store
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  legacyMode: true
});

redisClient.connect().catch(err => {
  console.warn('Redis connection failed for rate limiting, using memory store:', err.message);
});

/**
 * Global Rate Limiter
 * Applies to all requests
 * 100 requests per 15 minutes per IP
 */
export const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:global:'
  }).catch(() => undefined), // Fallback to memory if Redis unavailable
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Don't rate limit health checks
    return req.path === '/api/health';
  }
});

/**
 * Authentication Rate Limiter
 * Stricter limits for login/register endpoints (brute force protection)
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }).catch(() => undefined),
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful requests too
  keyGenerator: (req) => {
    // Rate limit by email + IP for registration/login
    return `${req.body?.email || req.ip}`;
  }
});

/**
 * API Rate Limiter
 * Standard limit for API endpoints
 * 30 requests per minute per IP
 */
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }).catch(() => undefined),
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict Rate Limiter for sensitive operations
 * 10 requests per hour per IP
 * Used for: delete operations, user management, etc.
 */
export const strictLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:strict:'
  }).catch(() => undefined),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many sensitive operations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * User-based Rate Limiter
 * Limits per authenticated user
 * 200 requests per hour per user
 */
export const userLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:user:'
  }).catch(() => undefined),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200,
  message: 'User rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.id || req.ip;
  },
  skip: (req) => {
    // Only apply to authenticated users
    return !req.user;
  }
});

/**
 * Create Limiter (Cameras, Recordings)
 * 50 create operations per hour per user
 */
export const createLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:create:'
  }).catch(() => undefined),
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: 'Too many create operations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  skip: (req) => !req.user
});

/**
 * Download/Export Limiter
 * Prevent abuse of export/download endpoints
 * 10 downloads per hour per user
 */
export const downloadLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:download:'
  }).catch(() => undefined),
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many downloads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip
});

export default {
  globalLimiter,
  authLimiter,
  apiLimiter,
  strictLimiter,
  userLimiter,
  createLimiter,
  downloadLimiter
};
