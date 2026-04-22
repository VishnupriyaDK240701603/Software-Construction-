/**
 * Security Middleware
 * Consolidates all security-related Express middleware.
 * Includes: Helmet, HPP, Rate Limiting, XSS sanitization, Input validation.
 */
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const xss = require('xss');

/**
 * Apply all security middleware to the Express app
 */
function applySecurity(app) {
  // --- HTTP Security Headers ---
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:*"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // --- Prevent HTTP Parameter Pollution ---
  app.use(hpp());

  // --- Global Rate Limiter ---
  const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: {
      success: false,
      message: 'Too many requests — please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', globalLimiter);

  // --- Strict Auth Rate Limiter (prevent brute force) ---
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 login/register attempts per window
    message: {
      success: false,
      message: 'Too many authentication attempts — please try again in 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth/', authLimiter);

  // --- XSS Sanitization Middleware ---
  app.use(sanitizeInput);
}

/**
 * Recursively sanitize all string values in request body, query, and params
 */
function sanitizeInput(req, res, next) {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
}

function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return xss(obj.trim());
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitizeObject(value);
    }
    return cleaned;
  }
  return obj;
}

module.exports = { applySecurity };
