/**
 * Input Validation Utilities
 * Centralizes validation logic to prevent injection and ensure data integrity.
 */
const validator = require('validator');

/**
 * Validate user registration input
 */
function validateRegistration(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (data.name && data.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (!data.email || !validator.isEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  if (!data.password || data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (data.password && data.password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  if (data.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }

  return errors;
}

/**
 * Validate login input
 */
function validateLogin(data) {
  const errors = [];

  if (!data.email || !validator.isEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  if (!data.password || data.password.length === 0) {
    errors.push('Please provide a password');
  }

  return errors;
}

/**
 * Validate product data (admin operations)
 */
function validateProduct(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters');
  }
  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required');
  }
  if (data.basePrice !== undefined && (typeof data.basePrice !== 'number' || data.basePrice < 0)) {
    errors.push('Base price must be a positive number');
  }

  return errors;
}

/**
 * Validate price alert data
 */
function validateAlert(data) {
  const errors = [];

  if (!data.productId || typeof data.productId !== 'string') {
    errors.push('Product ID is required');
  }
  if (!data.targetPrice || typeof data.targetPrice !== 'number' || data.targetPrice <= 0) {
    errors.push('Target price must be a positive number');
  }

  return errors;
}

/**
 * Sanitize and validate pagination parameters
 */
function validatePagination(query) {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 12;
  
  page = Math.max(1, Math.min(page, 1000)); // Cap at 1000 pages
  limit = Math.max(1, Math.min(limit, 50));  // Cap at 50 per page

  return { page, limit, skip: (page - 1) * limit };
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateProduct,
  validateAlert,
  validatePagination,
};
