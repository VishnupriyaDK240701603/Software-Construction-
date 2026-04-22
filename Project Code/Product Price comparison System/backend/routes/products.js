/**
 * Product Routes
 */
const express = require('express');
const router = express.Router();
const { getProducts, getProduct, autocomplete, getFilters } = require('../controllers/products');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getProducts);
router.get('/autocomplete', autocomplete);
router.get('/filters', getFilters);
router.get('/:id', getProduct);

module.exports = router;
