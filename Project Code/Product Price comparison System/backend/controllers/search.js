/**
 * Live Search Controller
 * Searches ANY product across all platforms in real-time.
 * This is the core feature — user types anything, we scrape live results.
 */
const db = require('../config/db');
const { scrapeAllPlatforms } = require('../services/scraper');

/**
 * GET /api/search/live?q=shampoo
 * Live search across all platforms — no pre-stored products needed
 */
async function liveSearch(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    const query = q.trim();
    console.log(`[LiveSearch] User searching: "${query}"`);

    // Log search for analytics
    db.searchLogs.insert({
      query,
      userId: req.user?._id || null,
      timestamp: new Date().toISOString(),
    }).catch(() => {});

    // Check cache — have we searched this exact query recently? (last 10 min)
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const cachedResults = await db.prices.find({
      searchQuery: query.toLowerCase(),
      scrapedAt: { $gte: tenMinAgo },
    });

    let results;
    if (cachedResults.length >= 3) {
      console.log(`[LiveSearch] Serving ${cachedResults.length} cached results for "${query}"`);
      results = cachedResults;
    } else {
      // Scrape all platforms live
      results = await scrapeAllPlatforms(query);

      // Cache the results
      if (results.length > 0) {
        await db.prices.remove({ searchQuery: query.toLowerCase() }, { multi: true });
        const toInsert = results.map(r => ({
          ...r,
          searchQuery: query.toLowerCase(),
        }));
        await db.prices.insert(toInsert);
      }
    }

    // Group results by platform for easy display
    const byPlatform = {};
    for (const r of results) {
      if (!byPlatform[r.platform]) byPlatform[r.platform] = [];
      byPlatform[r.platform].push(r);
    }

    // Sort all results by price
    results.sort((a, b) => a.price - b.price);
    if (results.length > 0) results[0].isCheapest = true;

    res.json({
      success: true,
      data: {
        query,
        totalResults: results.length,
        results,
        byPlatform,
        cheapest: results[0] || null,
        platforms: Object.keys(byPlatform),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { liveSearch };
