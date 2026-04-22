/**
 * Authentication Controller
 * Handles user registration, login, and profile retrieval.
 * Passwords are hashed with bcrypt. Tokens use JWT with configurable expiry.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validateRegistration, validateLogin } = require('../utils/validators');

/**
 * Generate JWT token for a user
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
}

/**
 * POST /api/auth/register
 * Register a new user account
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validate input
    const errors = validateRegistration({ name, email, password });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    // Check for existing user (case-insensitive email)
    const existing = await db.users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password with strong salt rounds
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await db.users.insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString(),
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate input
    const errors = validateLogin({ email, password });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    // Find user by email
    const user = await db.users.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Use generic message to prevent email enumeration
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 */
async function getMe(req, res) {
  res.json({
    success: true,
    data: { user: req.user },
  });
}

/**
 * PUT /api/auth/profile
 * Update current user's profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (email) {
      const { isEmail } = require('validator');
      if (!isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
      updates.email = email.toLowerCase().trim();
    }

    const updatedUser = await db.users.update(
      { _id: req.user._id },
      { $set: updates },
      { returnUpdatedDocs: true }
    );

    const { password, ...safeUser } = updatedUser;
    res.json({ success: true, data: { user: safeUser } });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, getMe, updateProfile };
