/**
 * Admin Controller
 * Handles admin-only operations: analytics, user management, product CRUD.
 */
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { validateProduct } = require('../utils/validators');

/**
 * GET /api/admin/analytics
 * Dashboard analytics summary
 */
async function getAnalytics(req, res, next) {
  try {
    const [totalUsers, totalProducts, totalAlerts, totalWishlist, searchLogs] = await Promise.all([
      db.users.count({}),
      db.products.count({}),
      db.alerts.count({}),
      db.wishlist.count({}),
      db.searchLogs.find({}).sort({ timestamp: -1 }).limit(100),
    ]);

    // Popular searches
    const searchCounts = {};
    for (const log of searchLogs) {
      const q = log.query?.toLowerCase();
      if (q) searchCounts[q] = (searchCounts[q] || 0) + 1;
    }
    const popularSearches = Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // Recent activity
    const recentUsers = await db.users.find({}).sort({ createdAt: -1 }).limit(5);
    const safeRecentUsers = recentUsers.map(u => ({
      id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt,
    }));

    // Category distribution
    const products = await db.products.find({});
    const categoryCounts = {};
    for (const p of products) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalProducts, totalAlerts, totalWishlist },
        popularSearches,
        recentUsers: safeRecentUsers,
        categoryDistribution: categoryCounts,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
async function getUsers(req, res, next) {
  try {
    const users = await db.users.find({});
    const safeUsers = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));

    res.json({ success: true, data: safeUsers });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/users/:id/role
 * Update user role
 */
async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Prevent self-demotion
    if (req.params.id === req.user._id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot demote yourself' });
    }

    await db.users.update({ _id: req.params.id }, { $set: { role } });
    res.json({ success: true, message: 'User role updated' });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/users/:id
 * Delete a user (admin only)
 */
async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user._id) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }

    await db.users.remove({ _id: req.params.id }, {});
    await db.wishlist.remove({ userId: req.params.id }, { multi: true });
    await db.alerts.remove({ userId: req.params.id }, { multi: true });

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/products
 * Create a new product
 */
async function createProduct(req, res, next) {
  try {
    const errors = validateProduct(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const product = await db.products.insert({
      name: req.body.name.trim(),
      brand: req.body.brand?.trim() || '',
      category: req.body.category.trim(),
      description: req.body.description?.trim() || '',
      image: req.body.image || '',
      basePrice: parseFloat(req.body.basePrice) || 0,
      rating: parseFloat(req.body.rating) || 0,
      specs: req.body.specs || {},
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/products/:id
 * Update a product
 */
async function updateProduct(req, res, next) {
  try {
    const product = await db.products.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = {};
    if (req.body.name) updates.name = req.body.name.trim();
    if (req.body.brand) updates.brand = req.body.brand.trim();
    if (req.body.category) updates.category = req.body.category.trim();
    if (req.body.description) updates.description = req.body.description.trim();
    if (req.body.image) updates.image = req.body.image;
    if (req.body.basePrice !== undefined) updates.basePrice = parseFloat(req.body.basePrice);
    if (req.body.rating !== undefined) updates.rating = parseFloat(req.body.rating);
    if (req.body.specs) updates.specs = req.body.specs;
    updates.updatedAt = new Date().toISOString();

    await db.products.update({ _id: req.params.id }, { $set: updates });
    const updated = await db.products.findOne({ _id: req.params.id });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/products/:id
 * Delete a product and associated data
 */
async function deleteProduct(req, res, next) {
  try {
    const product = await db.products.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Cascade delete associated data
    await Promise.all([
      db.products.remove({ _id: req.params.id }, {}),
      db.prices.remove({ productId: req.params.id }, { multi: true }),
      db.priceHistory.remove({ productId: req.params.id }, { multi: true }),
      db.wishlist.remove({ productId: req.params.id }, { multi: true }),
      db.alerts.remove({ productId: req.params.id }, { multi: true }),
    ]);

    res.json({ success: true, message: 'Product and associated data deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAnalytics,
  getUsers,
  updateUserRole,
  deleteUser,
  createProduct,
  updateProduct,
  deleteProduct,
};
