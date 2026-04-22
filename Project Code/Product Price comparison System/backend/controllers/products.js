/**
 * Products Controller
 * Handles product listing, search, autocomplete, and detail retrieval.
 * Supports filtering by category, brand, price range, and rating.
 */
const db = require('../config/db');
const { validatePagination } = require('../utils/validators');

/**
 * GET /api/products
 * List products with search, filters, and pagination
 */
async function getProducts(req, res, next) {
  try {
    const { page, limit, skip } = validatePagination(req.query);
    const { search, category, brand, minPrice, maxPrice, minRating, sort } = req.query;

    // Build query
    const query = {};

    if (search) {
      // Case-insensitive search across name, brand, and description
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
      ];

      // Log search for analytics (non-blocking)
      db.searchLogs.insert({
        query: search,
        userId: req.user?._id || null,
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }

    if (category) {
      query.category = new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }
    if (brand) {
      query.brand = new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Sorting
    let sortBy = { createdAt: -1 }; // Default: newest first
    if (sort === 'price_asc') sortBy = { basePrice: 1 };
    else if (sort === 'price_desc') sortBy = { basePrice: -1 };
    else if (sort === 'rating') sortBy = { rating: -1 };
    else if (sort === 'name') sortBy = { name: 1 };

    // Execute query with pagination
    const [products, total] = await Promise.all([
      db.products.find(query).sort(sortBy).skip(skip).limit(limit),
      db.products.count(query),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/autocomplete?q=...
 * Return product name suggestions for search autocomplete
 */
async function autocomplete(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const products = await db.products.find(
      { $or: [{ name: regex }, { brand: regex }] },
    );

    // Return top 8 unique suggestions
    const suggestions = products.slice(0, 8).map(p => ({
      id: p._id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      image: p.image,
    }));

    res.json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/categories
 * Return all unique categories and brands for filter UI
 */
async function getFilters(req, res, next) {
  try {
    const products = await db.products.find({});
    
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();

    res.json({
      success: true,
      data: { categories, brands },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
async function getProduct(req, res, next) {
  try {
    const product = await db.products.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProducts, getProduct, autocomplete, getFilters };
