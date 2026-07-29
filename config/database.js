/**
 * Database Optimization Configuration for CCTV Surveillance System
 * 
 * Includes:
 * - Connection pooling
 * - Index definitions
 * - Query optimization
 * - TTL (Time To Live) settings
 * - Performance monitoring
 */

/**
 * MongoDB Connection Options
 * Optimized for production performance
 */
export const mongodbConnectOptions = {
  // Connection pooling
  maxPoolSize: 10,
  minPoolSize: 5,
  
  // Connection timeout
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  
  // Automatic retries
  retryWrites: true,
  retryReads: true,
  
  // Connection monitoring
  monitorCommands: true,
  
  // Database options
  authSource: 'admin',
  
  // Socket keepalive
  socketKeepAliveMS: 30000,
  
  // Memory and buffer
  maxConnecting: 2,
  
  // Replica set (if applicable)
  replicaSet: process.env.MONGODB_REPLICA_SET,
  
  // Write concern
  w: 'majority',
  wtimeout: 5000,
  j: true
};

/**
 * Index Definitions
 * Optimize queries for common access patterns
 */
export const databaseIndexes = {
  User: [
    { email: 1 },           // Quick email lookup for login
    { createdAt: -1 },      // Sort by creation date
    { isActive: 1 },        // Filter active users
    { role: 1, createdAt: -1 }, // Filter and sort by role
    { isActive: 1, role: 1 }    // Combined filter
  ],
  
  Camera: [
    { owner: 1 },           // Find user's cameras
    { status: 1 },          // Filter by status
    { location: 1 },        // Search by location
    { owner: 1, createdAt: -1 }, // Owner's cameras sorted
    { status: 1, owner: 1 },     // Filter and ownership
    { createdAt: -1 },      // Recently added cameras
    { name: 'text', description: 'text' } // Full-text search
  ],
  
  Recording: [
    { camera: 1 },          // Find recordings for camera
    { startTime: -1 },      // Sort by time (recent first)
    { endTime: 1 },         // Filter by end time
    { camera: 1, startTime: -1 }, // Camera's recordings sorted
    { isArchived: 1 },      // Filter archived
    { createdAt: -1 },      // Recently created
    { startTime: 1, endTime: 1 }, // Date range queries
    { camera: 1, isArchived: 1, startTime: -1 } // Common filter
  ],
  
  Analytics: [
    { camera: 1 },          // Analytics for camera
    { eventType: 1 },       // Filter by event type
    { timestamp: -1 },      // Sort by timestamp
    { camera: 1, timestamp: -1 }, // Camera events
    { isAcknowledged: 1 },  // Unacknowledged alerts
    { createdAt: -1 },      // Recent events
    { camera: 1, eventType: 1, timestamp: -1 } // Common query
  ]
};

/**
 * TTL (Time To Live) Index Definitions
 * Automatically delete old records
 */
export const ttlIndexes = {
  // Analytics events older than 90 days
  Analytics: {
    field: 'createdAt',
    expireAfterSeconds: 90 * 24 * 60 * 60 // 90 days
  },
  
  // Old recordings older than 30 days (can be overridden per camera)
  Recording: {
    field: 'createdAt',
    expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days
  }
};

/**
 * Query Optimization Tips
 */
export const queryOptimizationTips = {
  // Use projection to limit fields returned
  // db.cameras.find({}, { name: 1, location: 1 })
  
  // Use compound indexes for multi-field filters
  // { owner: 1, status: 1, createdAt: -1 }
  
  // Avoid regex on large text fields
  // Use text indexes instead
  
  // Batch operations when possible
  // insertMany instead of repeated insert
  
  // Use lean() in Mongoose for read-only queries
  // Camera.find().lean()
  
  // Limit returned documents
  // .limit(50).skip(0)
  
  // Use aggregation pipeline for complex queries
  // Camera.aggregate([...])
  
  // Monitor slow queries with MongoDB profiler
};

/**
 * Connection Pool Management
 */
export const connectionPoolConfig = {
  // Maximum idle time for connections
  idleTimeoutMS: 60000,
  
  // Maximum lifetime of a connection
  maxLifetimeMS: 30 * 60 * 1000, // 30 minutes
  
  // Wait queue timeout
  waitQueueTimeoutMS: 10000,
  
  // Monitor pool status
  monitorPool: true
};

/**
 * Read Preferences for High Availability
 */
export const readPreferences = {
  // Primary reads (default, strong consistency)
  primary: 'primary',
  
  // Read from secondaries (eventual consistency, load balanced)
  secondary: 'secondary',
  
  // Read from nearest replica (lowest latency)
  nearest: 'nearest',
  
  // Recommended for CCTV surveillance:
  // Use 'primary' for critical data (authentication, user management)
  // Use 'secondary' or 'nearest' for analytics and non-critical reads
};

/**
 * Write Concern for Data Durability
 */
export const writeConcern = {
  // Acknowledge write but don't wait for replication
  unacknowledged: { w: 0 },
  
  // Acknowledge write (default)
  acknowledged: { w: 1 },
  
  // Acknowledge write after majority has written
  majority: { w: 'majority', wtimeout: 5000 },
  
  // Recommended: Use 'majority' for cameras and recordings
  // Use 'acknowledged' for less critical data
};

/**
 * Database Monitoring & Metrics
 */
export class DatabaseMonitor {
  constructor(mongooseConnection) {
    this.connection = mongooseConnection;
    this.metrics = {
      queries: 0,
      slowQueries: 0,
      errors: 0,
      totalTime: 0
    };
  }

  /**
   * Start monitoring database metrics
   */
  startMonitoring() {
    // Monitor query execution times
    this.connection.on('open', () => {
      console.log('Database monitoring started');
    });

    // Log slow queries (> 1000ms)
    this.connection.set('debug', (coll, method, query, doc, options) => {
      this.metrics.queries++;
    });
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      averageQueryTime: this.metrics.totalTime / Math.max(this.metrics.queries, 1),
      slowQueryPercentage: (this.metrics.slowQueries / this.metrics.queries) * 100
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      queries: 0,
      slowQueries: 0,
      errors: 0,
      totalTime: 0
    };
  }
}

/**
 * Query Performance Tips
 */
export const performanceGuidelines = {
  // 1. Use lean() for read-only queries
  // Camera.find().lean().exec();

  // 2. Select only needed fields
  // Camera.find({}, 'name location').exec();

  // 3. Index frequently searched fields
  // Schema.index({ owner: 1, status: 1 });

  // 4. Use pagination for large datasets
  // .limit(50).skip(offset);

  // 5. Use aggregation pipeline for complex operations
  // Camera.aggregate([
  //   { $match: { status: 'online' } },
  //   { $group: { _id: '$location', count: { $sum: 1 } } }
  // ]);

  // 6. Cache frequently accessed data
  // Use Redis for frequently accessed cameras/users

  // 7. Use connection pooling
  // Default in Mongoose with maxPoolSize

  // 8. Monitor with MongoDB Atlas if using cloud
  // Check query profiler for slow queries

  // 9. Use batch operations
  // insertMany instead of insert in loop

  // 10. Avoid N+1 queries
  // Use populate() to fetch related documents in one query
};

export default {
  mongodbConnectOptions,
  databaseIndexes,
  ttlIndexes,
  connectionPoolConfig,
  readPreferences,
  writeConcern,
  DatabaseMonitor,
  performanceGuidelines
};
