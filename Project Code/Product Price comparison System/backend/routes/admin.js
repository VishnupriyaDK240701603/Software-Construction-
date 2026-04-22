/**
 * Admin Routes (protected + admin role required)
 */
const express = require('express');
const router = express.Router();
const {
  getAnalytics, getUsers, updateUserRole, deleteUser,
  createProduct, updateProduct, deleteProduct,
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);           // Must be logged in
router.use(authorize('admin')); // Must be admin

// Analytics
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Product management
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
