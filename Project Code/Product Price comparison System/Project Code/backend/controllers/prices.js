/**
 * Prices Controller
 * Handles real-time price comparison and price history retrieval.
 * Triggers live web scraping with fallback to cached prices.
 */
const db = require('../config/db');
const { scrapeAllPlatforms, generatePriceHistory } = require('../services/scraper');

/**
 * GET /api/prices/:productId
 * Get current prices for a product from all platforms
 * Triggers live scraping and caches results
 */
async function getPrices(req, res, next) {
  try {
    const product = await db.products.findOne({ _id: req.params.productId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check for recently cached prices (within last 30 minutes)
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const cachedPrices = await db.prices.find({
      productId: product._id,
      scrapedAt: { $gte: thirtyMinAgo },
    });

    let prices;
    if (cachedPrices.length >= 3) {
      // Use cached data
      prices = cachedPrices;
      console.log(`[Prices] Serving cached prices for "${product.name}"`);
    } else {
      // Scrape fresh prices
      console.log(`[Prices] Scraping fresh prices for "${product.name}"`);
      const scrapedPrices = await scrapeAllPlatforms(product.name, product);

      // Store scraped prices in DB
      const priceRecords = scrapedPrices.map(sp => ({
        productId: product._id,
        platform: sp.platform,
        title: sp.title,
        price: sp.price,
        currency: sp.currency || 'USD',
        rating: sp.rating,
        image: sp.image,
        url: sp.url,
        seller: sp.seller,
        availability: sp.availability,
        scrapedAt: sp.scrapedAt,
      }));

      // Remove old prices for this product and insert new ones
      await db.prices.remove({ productId: product._id }, { multi: true });
      if (priceRecords.length > 0) {
        await db.prices.insert(priceRecords);
      }

      // Also add to price history
      for (const pr of priceRecords) {
        await db.priceHistory.insert({
          productId: product._id,
          platform: pr.platform,
          price: pr.price,
          date: new Date().toISOString().split('T')[0],
        });
      }

      prices = priceRecords;
    }

    // Sort by price - cheapest first
    prices.sort((a, b) => a.price - b.price);

    // Mark cheapest
    if (prices.length > 0) {
      prices[0].isCheapest = true;
    }

    res.json({
      success: true,
      data: {
        product: { id: product._id, name: product.name, image: product.image },
        prices,
        cheapest: prices[0] || null,
        lastUpdated: prices[0]?.scrapedAt || new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/prices/:productId/history
 * Get price history data for charts
 */
async function getPriceHistory(req, res, next) {
  try {
    const product = await db.products.findOne({ _id: req.params.productId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let history = await db.priceHistory.find({ productId: product._id });

    // If no history exists, generate some
    if (history.length < 10) {
      const generated = generatePriceHistory(product.name, product.basePrice || 99.99);
      const historyRecords = generated.map(h => ({
        productId: product._id,
        platform: h.platform,
        price: h.price,
        date: h.date,
      }));

      await db.priceHistory.insert(historyRecords);
      history = historyRecords;
    }

    // Sort by date
    history.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group by platform for chart data
    const grouped = {};
    for (const h of history) {
      if (!grouped[h.platform]) grouped[h.platform] = [];
      grouped[h.platform].push({ date: h.date, price: h.price });
    }

    res.json({
      success: true,
      data: {
        product: { id: product._id, name: product.name },
        history: grouped,
        platforms: Object.keys(grouped),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/prices/:productId/refresh
 * Force a fresh scrape for a product (rate-limited)
 */
async function refreshPrices(req, res, next) {
  try {
    const product = await db.products.findOne({ _id: req.params.productId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    console.log(`[Prices] Force refresh for "${product.name}"`);
    const scrapedPrices = await scrapeAllPlatforms(product.name, product);

    // Replace cached prices
    await db.prices.remove({ productId: product._id }, { multi: true });
    const priceRecords = scrapedPrices.map(sp => ({
      productId: product._id,
      platform: sp.platform,
      title: sp.title,
      price: sp.price,
      currency: sp.currency || 'USD',
      rating: sp.rating,
      image: sp.image,
      url: sp.url,
      seller: sp.seller,
      availability: sp.availability,
      scrapedAt: new Date().toISOString(),
    }));

    if (priceRecords.length > 0) {
      await db.prices.insert(priceRecords);
    }

    priceRecords.sort((a, b) => a.price - b.price);
    if (priceRecords.length > 0) priceRecords[0].isCheapest = true;

    res.json({
      success: true,
      message: 'Prices refreshed',
      data: { prices: priceRecords },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getPrices, getPriceHistory, refreshPrices };
