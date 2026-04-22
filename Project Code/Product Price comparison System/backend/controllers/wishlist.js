/**
 * Wishlist Controller
 * Manages saved/favorite products for authenticated users.
 */
const db = require('../config/db');

/**
 * GET /api/wishlist
 * Get all wishlist items for the current user
 */
async function getWishlist(req, res, next) {
  try {
    const wishlistItems = await db.wishlist.find({ userId: req.user._id });

    // Populate product data
    const items = [];
    for (const item of wishlistItems) {
      const product = await db.products.findOne({ _id: item.productId });
      if (product) {
        // Get latest cheapest price
        const prices = await db.prices.find({ productId: product._id });
        const cheapest = prices.sort((a, b) => a.price - b.price)[0];
        
        items.push({
          _id: item._id,
          product,
          cheapestPrice: cheapest || null,
          addedAt: item.addedAt,
        });
      }
    }

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/wishlist
 * Add a product to wishlist
 */
async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Verify product exists
    const product = await db.products.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check for duplicates
    const existing = await db.wishlist.findOne({
      userId: req.user._id,
      productId,
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Product already in wishlist' });
    }

    const item = await db.wishlist.insert({
      userId: req.user._id,
      productId,
      addedAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/wishlist/:productId
 * Remove a product from wishlist
 */
async function removeFromWishlist(req, res, next) {
  try {
    const removed = await db.wishlist.remove(
      { userId: req.user._id, productId: req.params.productId },
      {}
    );

    if (removed === 0) {
      return res.status(404).json({ success: false, message: 'Item not found in wishlist' });
    }

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/wishlist/check/:productId
 * Check if a product is in the user's wishlist
 */
async function checkWishlist(req, res, next) {
  try {
    const item = await db.wishlist.findOne({
      userId: req.user._id,
      productId: req.params.productId,
    });

    res.json({ success: true, data: { inWishlist: !!item } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist, checkWishlist };
