import helmet from 'helmet';
import mongoSanitize from 'mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

/**
 * Security Hardening Configuration for CCTV Surveillance System
 * 
 * Implements:
 * - HTTP security headers (Helmet.js)
 * - NoSQL injection prevention
 * - XSS protection
 * - HTTP Parameter Pollution (HPP) protection
 * - CORS security
 * - HTTPS/SSL enforcement
 * - Input validation and sanitization
 */

/**
 * Helmet Security Headers Middleware
 * Sets various HTTP headers to protect against common vulnerabilities
 */
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"]
    }
  },
  
  // X-Frame-Options: Prevent clickjacking
  frameguard: {
    action: 'deny'
  },
  
  // X-Content-Type-Options: Prevent MIME type sniffing
  noSniff: true,
  
  // X-XSS-Protection: Legacy XSS protection
  xssFilter: true,
  
  // Referrer-Policy: Control referrer information
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  
  // Strict-Transport-Security: Force HTTPS
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },
  
  // Remove X-Powered-By header
  hidePoweredBy: true,
  
  // Permissions-Policy: Restrict browser features
  permittedCrossDomainPolicies: false
});

/**
 * CORS Security Configuration
 */
export const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
  
  // Restrict to specific origins in production
  // origin: ['https://yourdomain.com', 'https://app.yourdomain.com']
};

/**
 * NoSQL Injection Prevention Middleware
 * Sanitizes user input to prevent MongoDB injection attacks
 */
export const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_', // Replace prohibited characters
  onSanitize: ({ req, key }) => {
    console.warn(`Potential NoSQL injection attempt in ${key}`);
  }
});

/**
 * XSS Protection Middleware
 * Cleans user input to prevent XSS attacks
 */
export const xssCleanConfig = xss();

/**
 * HTTP Parameter Pollution Prevention
 * Prevents attack using multiple parameters with same name
 */
export const hppConfig = hpp({
  whitelist: [
    // Query parameters that can have multiple values
    'sort',
    'fields',
    'limit',
    'skip',
    'page'
  ]
});

/**
 * Request Size Limits
 * Prevent denial of service through large payloads
 */
export const requestSizeLimits = {
  json: {
    limit: '10kb' // JSON payload limit
  },
  urlencoded: {
    limit: '10kb',
    extended: true
  },
  raw: {
    limit: '10kb'
  }
};

/**
 * Input Validation Rules
 */
export const validationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  password: {
    minLength: 8,
    minNumbers: 1,
    minUppercase: 1,
    minLowercase: 1,
    minSpecialChars: 1
  },
  
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  
  mongoId: /^[0-9a-f]{24}$/i,
  
  url: /^https?:\/\/.+/i,
  
  ipAddress: /^(\d{1,3}\.){3}\d{1,3}$/
};

/**
 * HTTPS/SSL Configuration
 */
export const httpsConfig = {
  // In production, use proper SSL certificates
  // Example with Let's Encrypt:
  // const fs = require('fs');
  // const https = require('https');
  // const privateKey = fs.readFileSync('/path/to/private-key.pem');
  // const certificate = fs.readFileSync('/path/to/certificate.pem');
  // const options = { key: privateKey, cert: certificate };
  // https.createServer(options, app).listen(443);
  
  enforceHttps: process.env.NODE_ENV === 'production',
  redirectHTTP: process.env.NODE_ENV === 'production'
};

/**
 * Session Security Configuration
 */
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
  
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent JavaScript access
    sameSite: 'strict', // Prevent CSRF
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  resave: false,
  saveUninitialized: false
};

/**
 * JWT Security Configuration
 */
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-jwt-secret-change-this',
  
  expiresIn: process.env.JWT_EXPIRY || '7d',
  
  // Options for signing
  signOptions: {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRY || '7d'
  },
  
  // Options for verification
  verifyOptions: {
    algorithms: ['HS256']
  }
};

/**
 * Password Security Configuration
 */
export const passwordConfig = {
  // bcrypt salt rounds
  saltRounds: 12,
  
  // Password requirements
  minLength: 8,
  requireNumbers: true,
  requireUppercase: true,
  requireLowercase: true,
  requireSpecialChars: true,
  
  // Prevent common passwords
  preventCommon: true,
  
  // Password history (prevent reuse)
  preventReuse: 5
};

/**
 * API Key Security
 */
export const apiKeyConfig = {
  header: 'X-API-Key',
  location: 'header', // or 'query'
  rotationInterval: 90 * 24 * 60 * 60 * 1000, // 90 days
  minLength: 32
};

/**
 * Encryption Configuration
 */
export const encryptionConfig = {
  // Algorithm for data encryption
  algorithm: 'aes-256-gcm',
  
  // Encryption key (use environment variable in production)
  encryptionKey: process.env.ENCRYPTION_KEY,
  
  // Fields to encrypt
  encryptedFields: [
    // Don't encrypt critical auth fields
    // 'phone', // example
    // 'apiKey'
  ]
};

/**
 * Security Headers Middleware Factory
 */
export const securityHeadersMiddleware = (req, res, next) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server identification
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * Audit Logging Configuration
 */
export const auditLogConfig = {
  enabled: true,
  
  // Events to log
  events: [
    'user.login',
    'user.logout',
    'user.register',
    'camera.create',
    'camera.delete',
    'recording.delete',
    'admin.action',
    'auth.failed'
  ],
  
  // Log level
  level: 'info',
  
  // Retention period
  retentionDays: 90
};

/**
 * Suspicious Activity Detection
 */
export const suspiciousActivityThresholds = {
  // Failed login attempts threshold
  failedLoginAttempts: 5,
  failedLoginWindow: 15 * 60 * 1000, // 15 minutes
  
  // Rapid API requests
  rapidRequestsThreshold: 100,
  rapidRequestsWindow: 60 * 1000, // 1 minute
  
  // Unusual patterns
  dataExfiltrationSize: 100 * 1024 * 1024, // 100 MB
  dataExfiltrationWindow: 60 * 60 * 1000 // 1 hour
};

/**
 * Security Checklist Middleware
 * Verifies security headers on startup
 */
export const securityChecklist = {
  // Verify required environment variables
  requiredEnvVars: [
    'JWT_SECRET',
    'MONGODB_URI',
    'SESSION_SECRET'
  ],
  
  // Verify security configurations
  checks: [
    'HTTPS enforced in production',
    'JWT_SECRET is strong',
    'CORS origin is configured',
    'Rate limiting is enabled',
    'Input validation is active',
    'Security headers are set',
    'Helmet is configured'
  ]
};

export default {
  helmetConfig,
  corsConfig,
  mongoSanitizeConfig,
  xssCleanConfig,
  hppConfig,
  requestSizeLimits,
  validationRules,
  httpsConfig,
  sessionConfig,
  jwtConfig,
  passwordConfig,
  apiKeyConfig,
  encryptionConfig,
  securityHeadersMiddleware,
  auditLogConfig,
  suspiciousActivityThresholds,
  securityChecklist
};
