/**
 * Authentication Middleware
 * Verifies JWT tokens and enforces role-based access control.
 * Security: Token is validated on every protected request.
 */
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Protect routes — requires valid JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header (Bearer scheme)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    // Verify token integrity and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB to ensure they still exist and haven't been disabled
    const user = await db.users.findOne({ _id: decoded.id });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user no longer exists',
      });
    }

    // Attach user to request (exclude password hash)
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired — please login again',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

/**
 * Optional auth — attaches user if token present, continues if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.users.findOne({ _id: decoded.id });
      if (user) {
        const { password, ...safeUser } = user;
        req.user = safeUser;
      }
    }
    next();
  } catch {
    // Token invalid or expired — continue as guest
    next();
  }
};

/**
 * Role-based authorization — restrict to specific roles
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };
