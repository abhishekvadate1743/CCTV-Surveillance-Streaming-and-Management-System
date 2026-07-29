import redis from 'redis';

/**
 * Caching Middleware for CCTV Surveillance System
 * 
 * Implements Redis-based caching for:
 * - Camera list (5 min cache)
 * - Camera detail (10 min cache)
 * - Recording list (5 min cache)
 * - User data (10 min cache)
 * - Analytics queries (15 min cache)
 */

class CacheManager {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => {
      console.warn('Redis cache client error:', err.message);
    });

    this.client.on('connect', () => {
      console.log('Redis cache client connected');
    });

    this.connecting = this.client.connect().catch(err => {
      console.warn('Redis connection failed:', err.message);
    });
  }

  /**
   * Generate cache key for request
   * Includes user ID, path, and query parameters
   */
  generateKey(req, prefix = '') {
    const userId = req.user?.id || 'anonymous';
    const query = Object.keys(req.query)
      .sort()
      .map(key => `${key}=${req.query[key]}`)
      .join('&');
    
    const key = query 
      ? `${prefix}:${userId}:${req.path}:${query}`
      : `${prefix}:${userId}:${req.path}`;
    
    return key;
  }

  /**
   * Get cached data
   */
  async get(key) {
    try {
      await this.connecting;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Cache get error:', error.message);
      return null;
    }
  }

  /**
   * Set cache data with expiry
   */
  async set(key, value, expirySeconds = 300) {
    try {
      await this.connecting;
      await this.client.setEx(key, expirySeconds, JSON.stringify(value));
    } catch (error) {
      console.warn('Cache set error:', error.message);
    }
  }

  /**
   * Delete cache key
   */
  async delete(key) {
    try {
      await this.connecting;
      await this.client.del(key);
    } catch (error) {
      console.warn('Cache delete error:', error.message);
    }
  }

  /**
   * Delete cache keys matching pattern
   */
  async deletePattern(pattern) {
    try {
      await this.connecting;
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.warn('Cache delete pattern error:', error.message);
    }
  }

  /**
   * Invalidate user's cache
   */
  async invalidateUserCache(userId) {
    try {
      await this.connecting;
      const pattern = `*:${userId}:*`;
      await this.deletePattern(pattern);
    } catch (error) {
      console.warn('Cache invalidation error:', error.message);
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      await this.connecting;
      await this.client.flushDb();
    } catch (error) {
      console.warn('Cache clear error:', error.message);
    }
  }
}

const cacheManager = new CacheManager();

/**
 * Cache middleware factory
 * Usage: app.get('/api/cameras', cacheMiddleware('cameras', 300), controller)
 */
export const cacheMiddleware = (prefix, expirySeconds = 300) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if no-cache header is present
    if (req.headers['cache-control'] === 'no-cache') {
      return next();
    }

    const key = cacheManager.generateKey(req, prefix);

    try {
      // Check cache
      const cachedData = await cacheManager.get(key);
      if (cachedData) {
        res.set('X-Cache', 'HIT');
        return res.json(cachedData);
      }

      // Store original response json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function(data) {
        res.set('X-Cache', 'MISS');
        
        // Cache successful responses only (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheManager.set(key, data, expirySeconds);
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      console.warn('Cache middleware error:', error.message);
      next();
    }
  };
};

/**
 * Invalidate cache after mutations
 * Usage: app.post('/api/cameras', invalidateCacheAfter('cameras'), controller)
 */
export const invalidateCacheAfter = (patterns = []) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      // On successful response, invalidate cache
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id;
        if (userId) {
          patterns.forEach(pattern => {
            cacheManager.deletePattern(`${pattern}:${userId}:*`);
          });
        }
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Specific cache middlewares for common endpoints
 */

export const cameraListCache = cacheMiddleware('cameras:list', 300); // 5 min
export const cameraDetailCache = cacheMiddleware('cameras:detail', 600); // 10 min
export const recordingListCache = cacheMiddleware('recordings:list', 300); // 5 min
export const recordingDetailCache = cacheMiddleware('recordings:detail', 600); // 10 min
export const userListCache = cacheMiddleware('users:list', 600); // 10 min
export const analyticsCache = cacheMiddleware('analytics', 900); // 15 min

/**
 * Cache invalidation patterns for different operations
 */
export const invalidateCameraCache = invalidateCacheAfter(['cameras:list', 'cameras:detail']);
export const invalidateRecordingCache = invalidateCacheAfter(['recordings:list', 'recordings:detail']);
export const invalidateUserCache = invalidateCacheAfter(['users:list']);

export default cacheManager;
