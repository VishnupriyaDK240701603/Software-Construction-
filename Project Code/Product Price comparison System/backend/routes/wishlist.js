/**
 * Wishlist Routes (protected)
 */
const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist, checkWishlist } = require('../controllers/wishlist');
const { protect } = require('../middleware/auth');

router.use(protect); // All wishlist routes require authentication

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.get('/check/:productId', checkWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
