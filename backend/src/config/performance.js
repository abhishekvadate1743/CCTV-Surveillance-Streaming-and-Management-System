/**
 * Performance Optimization Configuration for CCTV Surveillance System
 * 
 * Includes:
 * - Response compression
 * - Query optimization
 * - Caching strategies
 * - CDN configuration
 * - Performance monitoring
 * - Load balancing tips
 */

/**
 * Response Compression Configuration
 * Reduces bandwidth by compressing responses
 */
export const compressionConfig = {
  // Enable compression for responses > 1KB
  threshold: 1024,
  
  // Compression level (0-9)
  level: 6,
  
  // Include these MIME types
  type: [
    'application/json',
    'application/javascript',
    'text/css',
    'text/html',
    'text/plain',
    'application/xml',
    'application/json; charset=utf-8'
  ]
};

/**
 * Async/Await Best Practices
 */
export const asyncPatterns = {
  // Use Promise.all for independent operations
  // const [result1, result2] = await Promise.all([operation1(), operation2()]);
  
  // Use Promise.allSettled to handle failures gracefully
  // const results = await Promise.allSettled([...]);
  
  // Use async generators for large data streaming
  // async function* fetchRecordings() { ... }
  
  // Limit concurrent operations
  // const pLimit = require('p-limit');
  // const limit = pLimit(5);
  // await Promise.all(tasks.map(t => limit(() => t)));
};

/**
 * Query Optimization Patterns
 */
export const queryPatterns = {
  // Use lean() for read-only queries (30% faster)
  // Camera.find().lean();
  
  // Select specific fields to reduce payload
  // Camera.find({}, 'name location -_id');
  
  // Use aggregation pipeline for complex queries
  // Camera.aggregate([...]);
  
  // Avoid N+1 queries with populate()
  // Camera.find().populate('owner');
  
  // Use countDocuments() sparingly
  // Cache counts if possible
  
  // Batch update operations
  // Model.updateMany({}, { $set: {...} });
  
  // Use bulk operations for multiple inserts
  // Model.insertMany([...], { ordered: false });
};

/**
 * Memory Management
 */
export const memoryManagement = {
  // Monitor memory usage
  // const used = process.memoryUsage();
  
  // Force garbage collection if needed (requires --expose-gc flag)
  // if (global.gc) global.gc();
  
  // Stream large files instead of loading into memory
  // fs.createReadStream();
  
  // Use pagination for large datasets
  // Avoid loading all records at once
  
  // Clear caches periodically
  // Set TTLs on cached data
  
  // Monitor memory leaks
  // Use memory profiling tools
};

/**
 * CPU Optimization
 */
export const cpuOptimization = {
  // Use clustering for multi-core systems
  // const cluster = require('cluster');
  // const numCPUs = os.cpus().length;
  
  // Offload heavy operations to background jobs
  // Use Bull queue for job processing
  
  // Implement timeouts for long-running operations
  // Use setTimeout with proper cleanup
  
  // Profile CPU usage
  // const v8Profiler = require('v8-profiler');
  
  // Use native modules for performance-critical code
  // Consider C++ bindings for heavy computation
};

/**
 * Database Connection Optimization
 */
export const databaseOptimization = {
  // Connection pooling
  // Already configured in database.js
  
  // Batch operations
  // insertMany instead of insert loop
  
  // Use indexes for frequent queries
  // Defined in database.js
  
  // Monitor slow queries
  // Enable MongoDB profiler
  
  // Use read replicas for read-heavy workloads
  // Configure secondary read preferences
  
  // Archive old data
  // Move old recordings to cold storage
  
  // TTL indexes for automatic cleanup
  // Already configured in database.js
};

/**
 * Response Optimization
 */
export const responseOptimization = {
  // Pagination for large datasets
  // Return 50-100 items per page
  
  // Field selection (projection)
  // Only return necessary fields
  
  // Response caching
  // Set appropriate Cache-Control headers
  
  // Streaming for large files
  // Use res.sendFile() or streams
  
  // ETag support for conditional requests
  // Reduce bandwidth for unchanged resources
  
  // Gzip compression
  // Already configured above
};

/**
 * Frontend Performance (serve from Node)
 */
export const frontendPerformance = {
  // Minify and bundle assets
  // Use webpack or similar
  
  // Use CDN for static assets
  // S3, CloudFront, or similar
  
  // Service Worker for offline support
  // PWA capabilities
  
  // Code splitting and lazy loading
  // Load code on demand
  
  // Asset versioning for cache busting
  // Add hash to filenames
};

/**
 * Load Balancing Configuration
 */
export const loadBalancingConfig = {
  // Horizontal scaling
  // Run multiple Node instances
  
  // Load balancer (use nginx, HAProxy, etc)
  // Round-robin or least connections
  
  // Session persistence
  // Use Redis for session store
  // export const sessionStore = new RedisStore({...});
  
  // Sticky sessions
  // Route user to same server
  
  // Health checks
  // GET /api/health endpoint
};

/**
 * Caching Strategy
 */
export const cachingStrategy = {
  // L1: Application Cache (Redis)
  // Cache frequently accessed data
  // TTL: 5-15 minutes for cameras, recordings
  
  // L2: Browser Cache
  // Cache-Control headers
  // max-age: 300 seconds for GET requests
  
  // L3: CDN Cache
  // CloudFlare, Akamai, etc
  // Cache static assets
  
  // Cache invalidation
  // Invalidate on mutations
  // Use publish/subscribe pattern
};

/**
 * Monitoring and Metrics
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      totalResponseTime: 0,
      slowRequests: 0,
      errors: 0,
      databaseQueries: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.slowRequestThreshold = 1000; // ms
  }

  /**
   * Track request performance
   */
  trackRequest(method, path, responseTime, statusCode) {
    this.metrics.requests++;
    this.metrics.totalResponseTime += responseTime;
    
    if (responseTime > this.slowRequestThreshold) {
      this.metrics.slowRequests++;
      console.warn(`Slow request: ${method} ${path} took ${responseTime}ms`);
    }
    
    if (statusCode >= 400) {
      this.metrics.errors++;
    }
  }

  /**
   * Track cache hit/miss
   */
  trackCacheHit(hit = true) {
    if (hit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  /**
   * Get performance report
   */
  getReport() {
    const avgResponseTime = this.metrics.totalResponseTime / Math.max(this.metrics.requests, 1);
    const slowRequestPercentage = (this.metrics.slowRequests / this.metrics.requests) * 100;
    const errorRate = (this.metrics.errors / this.metrics.requests) * 100;
    const cacheHitRate = (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100;

    return {
      totalRequests: this.metrics.requests,
      averageResponseTime: avgResponseTime.toFixed(2),
      slowRequestPercentage: slowRequestPercentage.toFixed(2),
      errorRate: errorRate.toFixed(2),
      cacheHitRate: cacheHitRate.toFixed(2),
      ...this.metrics
    };
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      requests: 0,
      totalResponseTime: 0,
      slowRequests: 0,
      errors: 0,
      databaseQueries: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
}

/**
 * Performance Middleware
 * Track response times
 */
export const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Store original res.json
  const originalJson = res.json.bind(res);

  // Override res.json
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Add performance headers
    res.set('X-Response-Time', `${responseTime}ms`);
    
    // Log if slow
    if (responseTime > 1000) {
      console.warn(`Slow response: ${req.method} ${req.path} took ${responseTime}ms`);
    }

    return originalJson(data);
  };

  next();
};

/**
 * Performance Targets
 */
export const performanceTargets = {
  // API endpoints should respond within
  apiResponseTime: {
    get: 500, // ms
    post: 1000,
    put: 1000,
    delete: 1000
  },

  // Success rate should be > 99%
  successRate: 0.99,

  // Cache hit rate should be > 80%
  cacheHitRate: 0.80,

  // P95 response time should be < 2000ms
  p95ResponseTime: 2000,

  // P99 response time should be < 5000ms
  p99ResponseTime: 5000,

  // Database query time should be < 500ms
  databaseQueryTime: 500
};

/**
 * Scaling Recommendations
 */
export const scalingGuidelines = {
  // Vertical Scaling (increase instance size)
  // - First: Add more RAM and CPU
  // - Improves single-instance performance
  // - Limited by hardware constraints

  // Horizontal Scaling (add more instances)
  // - Add multiple Node instances
  // - Use load balancer (nginx, HAProxy)
  // - Use Redis for sessions
  // - Use database replicas

  // Capacity Planning
  // - Monitor CPU and memory usage
  // - Monitor request throughput
  // - Monitor database connections
  // - Plan for 2x peak load

  // Bottleneck Analysis
  // - CPU bound: Add replicas or optimize code
  // - Memory bound: Increase instance size or use caching
  // - I/O bound: Add database replicas or use caching
  // - Network bound: Use CDN or edge locations
};

/**
 * Benchmark Baseline (for reference)
 */
export const benchmarkBaseline = {
  // Single Node.js instance (4GB RAM, 2 CPU cores)
  // - Concurrent users: ~500-1000
  // - Requests per second: ~100-200
  // - Response time: 200-500ms

  // With load balancer (2 Node instances)
  // - Concurrent users: ~1000-2000
  // - Requests per second: ~200-400
  // - Response time: 200-500ms

  // With Redis caching
  // - Cache hit rate: 80%+
  // - Effective response time: 50-200ms
  // - Database load: Reduced by 80%

  // With CDN
  // - Static asset delivery: < 100ms
  // - Bandwidth saved: 60-80%
  // - User experience: Significantly improved
};

export default {
  compressionConfig,
  memoryManagement,
  cpuOptimization,
  databaseOptimization,
  responseOptimization,
  frontendPerformance,
  loadBalancingConfig,
  cachingStrategy,
  PerformanceMonitor,
  performanceMiddleware,
  performanceTargets,
  scalingGuidelines,
  benchmarkBaseline
};
