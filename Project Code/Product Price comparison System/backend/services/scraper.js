/**
 * Real-Time Product Price Scraping Service — India-Focused
 * 
 * Strategy: Use publicly accessible search engines, store pages,
 * and India e-commerce sites to fetch prices in Indian Rupees (₹).
 * 
 * Sources:
 *   1. DuckDuckGo (India-biased queries)
 *   2. Google Shopping (India region)
 *   3. Google Web Search (India region)
 *   4. Amazon India (amazon.in)
 *   5. Flipkart
 *   6. Croma (electronics)
 *   7. Snapdeal
 *   8. JioMart (via DuckDuckGo)
 *   9. Walmart (USD → INR conversion)
 *  10. eBay (USD → INR conversion)
 */
const axios = require('axios');
const cheerio = require('cheerio');

// ─── Constants ──────────────────────────────────────────────────────────────────
// USD to INR conversion rate (update periodically or replace with live API)
const USD_TO_INR = 83.5;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ─── HTTP Client with realistic browser headers ────────────────────────────────
async function fetchPage(url, extraHeaders = {}) {
  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent': randomUA(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      ...extraHeaders,
    },
    maxRedirects: 5,
    validateStatus: (status) => status < 400,
  });
  return response.data;
}

// ─── Price extraction helpers ───────────────────────────────────────────────────
const INR_PRICE_PATTERNS = [
  /₹\s?([\d,]+(?:\.\d{1,2})?)/,
  /(?:Rs\.?|INR)\s?([\d,]+(?:\.\d{1,2})?)/i,
  /(?:MRP|Price)[:\s]*₹?\s?([\d,]+(?:\.\d{1,2})?)/i,
];

const USD_PRICE_PATTERNS = [
  /\$\s?([\d,]+(?:\.\d{1,2})?)/,
  /(?:USD)\s?\$?\s?([\d,]+(?:\.\d{1,2})?)/i,
];

function extractINRPrice(text) {
  for (const pattern of INR_PRICE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const price = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(price) && price > 0 && price < 100000000) return price;
    }
  }
  return null;
}

function extractUSDPrice(text) {
  for (const pattern of USD_PRICE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const price = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(price) && price > 0 && price < 1000000) return price;
    }
  }
  return null;
}

function convertToINR(priceUSD) {
  return Math.round(priceUSD * USD_TO_INR);
}

function identifyPlatform(url, title) {
  const urlLower = (url || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();
  if (urlLower.includes('amazon.in') || (urlLower.includes('amazon') && urlLower.includes('.in'))) return 'Amazon India';
  if (urlLower.includes('amazon') || titleLower.includes('amazon')) return 'Amazon';
  if (urlLower.includes('flipkart') || titleLower.includes('flipkart')) return 'Flipkart';
  if (urlLower.includes('croma') || titleLower.includes('croma')) return 'Croma';
  if (urlLower.includes('snapdeal') || titleLower.includes('snapdeal')) return 'Snapdeal';
  if (urlLower.includes('jiomart') || urlLower.includes('jio') || titleLower.includes('jiomart')) return 'JioMart';
  if (urlLower.includes('myntra') || titleLower.includes('myntra')) return 'Myntra';
  if (urlLower.includes('nykaa') || titleLower.includes('nykaa')) return 'Nykaa';
  if (urlLower.includes('tatacliq') || titleLower.includes('tata cliq')) return 'Tata CLiQ';
  if (urlLower.includes('reliancedigital') || titleLower.includes('reliance digital')) return 'Reliance Digital';
  if (urlLower.includes('walmart') || titleLower.includes('walmart')) return 'Walmart';
  if (urlLower.includes('ebay') || titleLower.includes('ebay')) return 'eBay';
  if (urlLower.includes('bestbuy') || titleLower.includes('best buy')) return 'Best Buy';
  if (urlLower.includes('target') || titleLower.includes('target')) return 'Target';
  if (urlLower.includes('newegg') || titleLower.includes('newegg')) return 'Newegg';
  if (urlLower.includes('costco') || titleLower.includes('costco')) return 'Costco';
  if (urlLower.includes('meesho') || titleLower.includes('meesho')) return 'Meesho';
  if (urlLower.includes('ajio') || titleLower.includes('ajio')) return 'AJIO';
  return 'Online Store';
}

// ─── Source 1: DuckDuckGo (India-biased) ────────────────────────────────────────
async function scrapeDuckDuckGo(query) {
  const results = [];
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' price buy online India ₹')}`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    $('.result, .web-result').each((i, el) => {
      if (i >= 10) return false;
      const title = $(el).find('.result__title, .result__a').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const link = $(el).find('.result__a').attr('href') || $(el).find('a').first().attr('href');

      const fullText = `${title} ${snippet}`;
      let price = extractINRPrice(fullText);
      let currency = '₹';
      let wasConverted = false;

      // If no INR price found, try USD and convert
      if (!price) {
        const usdPrice = extractUSDPrice(fullText);
        if (usdPrice) {
          price = convertToINR(usdPrice);
          wasConverted = true;
        }
      }

      const platform = identifyPlatform(link, title);

      if (title && price && price > 0) {
        results.push({
          platform,
          title: title.substring(0, 200),
          price,
          currency,
          rating: null,
          image: null,
          url: link || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          seller: platform,
          availability: 'In Stock',
          convertedFromUSD: wasConverted,
          scrapedAt: new Date().toISOString(),
        });
      }
    });

    console.log(`[Scraper] DuckDuckGo: ${results.length} results for "${query}"`);
  } catch (error) {
    console.log(`[Scraper] DuckDuckGo failed: ${error.message}`);
  }
  return results;
}

// ─── Source 2: Google Shopping (India region) ───────────────────────────────────
async function scrapeGoogleShopping(query) {
  const results = [];
  try {
    // Force India region with gl=in and cr=countryIN
    const url = `https://www.google.co.in/search?q=${encodeURIComponent(query + ' buy online')}&tbm=shop&hl=en&gl=in&cr=countryIN`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    const selectors = [
      '.sh-dgr__grid-result',
      '.sh-dlr__list-result',
      '.KZmu8e',
      '.i0X6df',
      '.xcR77',
    ];

    for (const selector of selectors) {
      if (results.length > 0) break;
      $(selector).each((i, el) => {
        if (i >= 10) return false;
        const title = $(el).find('h3').text().trim()
          || $(el).find('.tAxDx').text().trim()
          || $(el).find('.Xjkr3b').text().trim()
          || $(el).find('a').first().text().trim();

        let priceText = '';
        const priceSelectors = ['.a8Pemb', '.HRLxBb', '.kHxwFf', 'span[aria-label*="Price"]', '.XrAfOe'];
        for (const ps of priceSelectors) {
          priceText = $(el).find(ps).text().trim();
          if (priceText) break;
        }

        const seller = $(el).find('.aULzUe, .IuHnof, .E5ocAb, .b5ycib').text().trim();
        const image = $(el).find('img').attr('src');
        const ratingText = $(el).find('.Rsc7Yb, .QIrs8').text().trim();
        const link = $(el).find('a[href*="url"]').attr('href') || $(el).find('a').first().attr('href');

        if (title && priceText) {
          let price = extractINRPrice(priceText);
          let wasConverted = false;
          if (!price) {
            const usdPrice = extractUSDPrice(priceText);
            if (usdPrice) {
              price = convertToINR(usdPrice);
              wasConverted = true;
            } else {
              const cleanPrice = priceText.replace(/[^0-9.,]/g, '').replace(/,/g, '');
              price = parseFloat(cleanPrice);
            }
          }

          if (!isNaN(price) && price > 0 && price < 100000000) {
            const platform = seller ? identifyPlatform('', seller) : 'Google Shopping';
            results.push({
              platform: platform === 'Online Store' ? (seller || 'Google Shopping') : platform,
              title: title.substring(0, 200),
              price: Math.round(price),
              currency: '₹',
              rating: ratingText ? parseFloat(ratingText) : null,
              image: (image && !image.startsWith('data:')) ? image : null,
              url: link ? (link.startsWith('http') ? link : `https://www.google.co.in${link}`) : `https://www.google.co.in/search?q=${encodeURIComponent(query)}&tbm=shop`,
              seller: seller || 'Online Store',
              availability: 'In Stock',
              convertedFromUSD: wasConverted,
              scrapedAt: new Date().toISOString(),
            });
          }
        }
      });
    }

    // Fallback: parse from regular Google search snippets
    if (results.length === 0) {
      $('div[data-docid], div[data-cid]').each((i, el) => {
        if (i >= 10) return false;
        const title = $(el).find('h3, [role="heading"]').text().trim();
        const allText = $(el).text();
        let price = extractINRPrice(allText);
        let wasConverted = false;
        if (!price) {
          const usdPrice = extractUSDPrice(allText);
          if (usdPrice) {
            price = convertToINR(usdPrice);
            wasConverted = true;
          }
        }
        const seller = $(el).find('span[class*="merchant"], span[class*="store"]').text().trim();

        if (title && price && price > 0) {
          results.push({
            platform: seller || 'Google Shopping',
            title: title.substring(0, 200),
            price: Math.round(price),
            currency: '₹',
            rating: null,
            image: null,
            url: `https://www.google.co.in/search?q=${encodeURIComponent(query)}&tbm=shop`,
            seller: seller || 'Online Store',
            availability: 'In Stock',
            convertedFromUSD: wasConverted,
            scrapedAt: new Date().toISOString(),
          });
        }
      });
    }

    console.log(`[Scraper] Google Shopping: ${results.length} results for "${query}"`);
  } catch (error) {
    console.log(`[Scraper] Google Shopping failed: ${error.message}`);
  }
  return results;
}

// ─── Source 3: Google Web Search (India region) ─────────────────────────────────
async function scrapeGoogleWeb(query) {
  const results = [];
  try {
    const url = `https://www.google.co.in/search?q=${encodeURIComponent(query + ' price buy India')}&gl=in&hl=en`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    $('div.g, div[data-hveid]').each((i, el) => {
      if (i >= 12 || results.length >= 8) return false;
      const title = $(el).find('h3').text().trim();
      const link = $(el).find('a').first().attr('href');
      const snippet = $(el).text();

      let price = extractINRPrice(snippet);
      let wasConverted = false;
      if (!price) {
        const usdPrice = extractUSDPrice(snippet);
        if (usdPrice) {
          price = convertToINR(usdPrice);
          wasConverted = true;
        }
      }

      if (title && price && link && link.startsWith('http')) {
        const platform = identifyPlatform(link, title);

        if (price > 0 && price < 100000000) {
          results.push({
            platform,
            title: title.substring(0, 200),
            price: Math.round(price),
            currency: '₹',
            rating: null,
            image: null,
            url: link,
            seller: platform,
            availability: 'In Stock',
            convertedFromUSD: wasConverted,
            scrapedAt: new Date().toISOString(),
          });
        }
      }
    });

    console.log(`[Scraper] Google Web: ${results.length} results for "${query}"`);
  } catch (error) {
    console.log(`[Scraper] Google Web failed: ${error.message}`);
  }
  return results;
}

// ─── Source 4: Amazon India ─────────────────────────────────────────────────────
async function scrapeAmazonIndia(query) {
  const results = [];
  try {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    const html = await fetchPage(url, {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });
    const $ = cheerio.load(html);

    // Amazon search result items
    $('[data-component-type="s-search-result"]').each((i, el) => {
      if (i >= 8 || results.length >= 6) return false;

      const title = $(el).find('h2 a span, h2 span').first().text().trim();
      
      // Price: Amazon India uses ₹ symbol or class a-price
      const wholePart = $(el).find('.a-price .a-price-whole').first().text().trim().replace(/[,.\s]/g, '');
      const fractionPart = $(el).find('.a-price .a-price-fraction').first().text().trim() || '00';
      
      let price = null;
      if (wholePart) {
        price = parseFloat(`${wholePart}.${fractionPart}`);
      } else {
        // Fallback: find price in text
        const allText = $(el).text();
        price = extractINRPrice(allText);
      }

      const image = $(el).find('.s-image').attr('src');
      const link = $(el).find('h2 a').attr('href');
      const ratingText = $(el).find('.a-icon-alt').first().text().trim();
      const rating = ratingText ? parseFloat(ratingText) : null;

      if (!title || title.length < 5) return;

      if (price && price > 0 && price < 100000000) {
        results.push({
          platform: 'Amazon India',
          title: title.substring(0, 200),
          price: Math.round(price),
          currency: '₹',
          rating: (rating && !isNaN(rating)) ? rating : null,
          image: (image && !image.startsWith('data:')) ? image : null,
          url: link ? (link.startsWith('http') ? link : `https://www.amazon.in${link}`) : url,
          seller: 'Amazon India',
          availability: 'In Stock',
          scrapedAt: new Date().toISOString(),
        });
      }
    });

    // Fallback: try LD+JSON structured data
    if (results.length === 0) {
      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const json = JSON.parse($(el).html());
          const items = json?.itemListElement || (json['@type'] === 'Product' ? [{ item: json }] : []);
          items.forEach((entry, idx) => {
            if (idx >= 6) return;
            const product = entry.item || entry;
            if (product.name && product.offers) {
              const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
              const price = parseFloat(offer.price || offer.lowPrice);
              if (!isNaN(price) && price > 0) {
                results.push({
                  platform: 'Amazon India',
                  title: product.name.substring(0, 200),
                  price: Math.round(price),
                  currency: '₹',
                  rating: product.aggregateRating ? parseFloat(product.aggregateRating.ratingValue) : null,
                  image: typeof product.image === 'string' ? product.image : null,
                  url: product.url || url,
                  seller: 'Amazon India',
                  availability: 'In Stock',
                  scrapedAt: new Date().toISOString(),
                });
              }
            }
          });
        } catch {}
      });
    }

    console.log(`[Scraper] Amazon India: ${results.length} results for "${query}"`);
  } catch (error) {
    console.log(`[Scraper] Amazon India failed: ${error.message}`);
  }
  return results;
}

// ─── Source 5: Flipkart ─────────────────────────────────────────────────────────
async function scrapeFlipkart(query) {
  const results = [];
  try {
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    const html = await fetchPage(url, {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });
    const $ = cheerio.load(html);

    // Flipkart search result selectors (multiple patterns since they change frequently)
    const itemSelectors = [
      '._1AtVbE [data-id]',
      '._1xHGtK._373qXS',
      '._2kHMtA',
      '._4ddWXP',
      '._1sdMkc',
      '.tUxRFH',
      '._1AtVbE',
    ];

    for (const selector of itemSelectors) {
      if (results.length > 0) break;
      $(selector).each((i, el) => {
        if (i >= 10 || results.length >= 6) return false;

        // Title selectors
        const title = $(el).find('._4rR01T, .s1Q9rs, .IRpwTa, a[title]').first().text().trim()
          || $(el).find('a').first().attr('title')
          || $(el).find('a div').first().text().trim();

        // Price selectors
        const priceText = $(el).find('._30jeq3, ._1_WHN1').first().text().trim();
        
        let price = null;
        if (priceText) {
          price = extractINRPrice(priceText);
          if (!price) {
            const cleanPrice = priceText.replace(/[^0-9.]/g, '');
            price = parseFloat(cleanPrice);
          }
        }

        // Image
        const image = $(el).find('img._396cs4, img._2r_T1I, img').first().attr('src');
        
        // Link
        const link = $(el).find('a._1fQZEK, a.s1Q9rs, a.IRpwTa, a').first().attr('href');
        
        // Rating
        const ratingText = $(el).find('._3LWZlK, .XQDdHH').first().text().trim();
        const rating = ratingText ? parseFloat(ratingText) : null;

        if (!title || title.length < 5) return;

        if (price && !isNaN(price) && price > 0 && price < 100000000) {
          results.push({
            platform: 'Flipkart',
            title: title.substring(0, 200),
            price: Math.round(price),
            currency: '₹',
            rating: (rating && !isNaN(rating)) ? rating : null,
            image: (image && !image.startsWith('data:')) ? image : null,
            url: link ? (link.startsWith('http') ? link : `https://www.flipkart.com${link}`) : url,
            seller: 'Flipkart',
            availability: 'In Stock',
            scrapedAt: new Date().toISOString(),
          });
        }
      });
    }

    // Fallback: LD+JSON
    if (results.length === 0) {
      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const json = JSON.parse($(el).html());
          if (json['@type'] === 'ItemList' && json.itemListElement) {
            json.itemListElement.forEach((entry, idx) => {
              if (idx >= 6) return;
              const product = entry.item || entry;
              if (product.name && product.offers) {
                const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
                const price = parseFloat(offer.price || offer.lowPrice);
                if (!isNaN(price) && price > 0) {
                  results.push({
                    platform: 'Flipkart',
                    title: product.name.substring(0, 200),
                    price: Math.round(price),
                    currency: '₹',
                    rating: product.aggregateRating ? parseFloat(product.aggregateRating.ratingValue) : null,
                    image: typeof product.image === 'string' ? product.image : null,
                    url: product.url || url,
                    seller: 'Flipkart',
                    availability: 'In Stock',
                    scrapedAt: new Date().toISOString(),
                  });
                }
              }
            });
          }
        } catch {}
      });
    }

    console.log(`[Scraper] Flipkart: ${results.length} results for "${query}"`);
  } catch (error) {
    console.log(`[Scraper] Flipkart failed: ${error.message}`);
  }
  return results;
}

// ─── Source 6: Croma (Electronics) ──────────────────────────────────────────────
async function scrapeCroma(query) {
  const results = [];
  try {
    const url = `https://www.croma.com/searchB?q=${encodeURIComponent(query)}&text=${encodeURIComponent(query)}`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    // Croma product listing selectors
    const itemSelectors = [
      '.product-item',
      '.product_listing_content',
      'li.product-item',
      '.plp-card-container',
      '.cp-product',
    ];

    for (const selector of itemSelectors) {
      if (results.length > 0) break;
      $(selector).each((i, el) => {
        if (i >= 8 || results.length >= 6) return false;

        const title = $(el).find('h3, .product-title, .product-title-block a, .product__list--name').text().trim();
        const priceText = $(el).find('.amount, .new-price, .pdpPrice, .product__list--price, span[data-testid="new-price"]').first().text().trim();
        const image = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src');
        const link = $(el).find('a').first().attr('href');

        let price = null;
        if (priceText) {
          price = extractINRPrice(priceText);
          if (!price) {
            const cleanPrice = priceText.replace(/[^0-9.]/g, '');
            price = parseFloat(cleanPrice);
          }
        }

        if (!title || title.length < 5) return;

        if (price && !isNaN(price) && price > 0 && price < 100000000) {
          results.push({
            platform: 'Croma',
            title: title.substring(0, 200),
            price: Math.round(price),
            currency: '₹',
            rating: null,
            image: (image && !image.startsWith('data:')) ? image : null,
            url: link ? (link.startsWith('http') ? link : `https://www.croma.com${link}`) : url,
            seller: 'Croma',
            availability: 'In Stock',
            scrapedAt: new Date().toISOString(),
          });
        }
      });
    }

    // Fallback: LD+JSON
    if (results.length === 0) {
      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const json = JSON.parse($(el).html());
          const items = json?.itemListElement || (json['@type'] === 'Product' ? [{ item: json }] : []);
          items.forEach((entry, idx) => {
            if (idx >= 6) return;
            const product = entry.item || entry;
            if (product.name && product.offers) {
              const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
              const price = parseFloat(offer.price || offer.lowPrice);
              if (!isNaN(price) && price > 0) {
                results.push({
                  platform: 'Croma',
                  title: product.name.substring(0, 200),
                  price: Math.round(price),
                  currency: '₹',
                  rating: null,
                  image: typeof product.image === 'string' ? product.image : null,
                  url: product.url || url,
                  seller: 'Croma',
                  availability: 'In Stock',
                  scrapedAt: new Date().toISOString(),
                });
              }
            }
          });
        } catch {}
      });
    }

    console.log(`[Scraper] Croma: ${results.length} results for "${query}"`);
  } catch (error) {
    console.log(`[Scraper] Croma failed: ${error.message}`);
  }
  return results;
}

// ─── Source 7: Snapdeal ─────────────────────────────────────────────────────────
async function scrapeSnapdeal(query) {
  const results = [];
  try {
    const url = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}&sort=rlvncy`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    // Snapdeal product listing
    const itemSelectors = [
      '.product-tuple-listing',
      '.product-tuple-image',
      '.col-xs-6',
      '.product-desc-rating',
    ];

    for (const selector of itemSelectors) {
      if (results.length > 0) break;
      $(`${selector}`).each((i, el) => {
        if (i >= 8 || results.length >= 6) return false;

        const title = $(el).find('.product-title, .product-title p, p.product-title').text().trim()
          || $(el).find('img').first().attr('title');
        const priceText = $(el).find('.lfloat.product-price, .product-price, .payBlk span').first().text().trim();
        const image = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src');
        const link = $(el).find('a').first().attr('href');

        let price = null;
        if (priceText) {
          price = extractINRPrice(priceText);
          if (!price) {
            const cleanPrice = priceText.replace(/[^0-9.]/g, '');
            price = parseFloat(cleanPrice);
          }
        }

        if (!title || title.length < 5) return;

        if (price && !isNaN(price) && price > 0 && price < 100000000) {
          results.push({
            platform: 'Snapdeal',
            title: title.substring(0, 200),
            price: Math.round(price),
            currency: '₹',
            rating: null,
            image: (image && !image.startsWith('data:')) ? image : null,
            url: link ? (link.startsWith('http') ? link : `https://www.snapdeal.com${link}`) : url,
            seller: 'Snapdeal',
            availability: 'In Stock',
            scrapedAt: new Date().toISOString(),
          });
        }
      });
    }

    console.log(`[Scraper] Snapdeal: ${results.length} results for "${query}"`);
  } catch (error) {
    console.log(`[Scraper] Snapdeal failed: ${error.message}`);
  }
  return results;
}

// ─── Source 8: JioMart (via DuckDuckGo site-specific search) ────────────────────
async function scrapeJioMart(query) {
  const results = [];
  try {
    // Use DuckDuckGo to search JioMart specifically
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:jiomart.com ' + query + ' price')}`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    $('.result, .web-result').each((i, el) => {
      if (i >= 6) return false;
      const title = $(el).find('.result__title, .result__a').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const link = $(el).find('.result__a').attr('href') || $(el).find('a').first().attr('href');

      const fullText = `${title} ${snippet}`;
      let price = extractINRPrice(fullText);

      if (title && price && price > 0) {
        results.push({
          platform: 'JioMart',
          title: title.substring(0, 200),
          price: Math.round(price),
          currency: '₹',
          rating: null,
          image: null,
          url: link || `https://www.jiomart.com/search/${encodeURIComponent(query)}`,
          seller: 'JioMart',
          availability: 'In Stock',
          scrapedAt: new Date().toISOString(),
        });
      }
    });

    console.log(`[Scraper] JioMart: ${results.length} results for "${query}"`);
  } catch (error) {
    console.log(`[Scraper] JioMart failed: ${error.message}`);
  }
  return results;
}

// ─── Source 9: Walmart (USD → INR) ──────────────────────────────────────────────
async function scrapeWalmartAPI(query) {
  const results = [];
  try {
    const url = `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;
    const html = await fetchPage(url);

    // Try to extract __NEXT_DATA__ JSON
    const nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      try {
        const data = JSON.parse(nextDataMatch[1]);
        const items = data?.props?.pageProps?.initialData?.searchResult?.itemStacks?.[0]?.items
          || data?.props?.pageProps?.initialData?.searchResult?.items
          || [];

        items.forEach((item, idx) => {
          if (idx >= 8 || !item) return;
          const name = item.name || item.title;
          const priceUSD = item.priceInfo?.currentPrice?.price
            || item.priceInfo?.linePrice?.price
            || item.price;
          const image = item.imageInfo?.thumbnailUrl || item.image;
          const rating = item.averageRating || item.rating;
          const itemUrl = item.canonicalUrl || item.productPageUrl;

          if (name && priceUSD && priceUSD > 0) {
            results.push({
              platform: 'Walmart',
              title: name.substring(0, 200),
              price: convertToINR(parseFloat(priceUSD)),
              currency: '₹',
              rating: rating ? parseFloat(rating) : null,
              image: image || null,
              url: itemUrl ? `https://www.walmart.com${itemUrl}` : url,
              seller: 'Walmart',
              availability: 'In Stock',
              convertedFromUSD: true,
              scrapedAt: new Date().toISOString(),
            });
          }
        });
      } catch {}
    }

    // Fallback: LD+JSON
    if (results.length === 0) {
      const $ = cheerio.load(html);
      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const json = JSON.parse($(el).html());
          const items = json?.itemListElement || (json['@type'] === 'Product' ? [{ item: json }] : []);
          items.forEach((entry, idx) => {
            if (idx >= 8) return;
            const product = entry.item || entry;
            if (product.name && product.offers) {
              const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
              const priceUSD = parseFloat(offer.price || offer.lowPrice);
              if (!isNaN(priceUSD) && priceUSD > 0) {
                results.push({
                  platform: 'Walmart',
                  title: product.name.substring(0, 200),
                  price: convertToINR(priceUSD),
                  currency: '₹',
                  rating: product.aggregateRating ? parseFloat(product.aggregateRating.ratingValue) : null,
                  image: typeof product.image === 'string' ? product.image : null,
                  url: product.url || url,
                  seller: 'Walmart',
                  availability: 'In Stock',
                  convertedFromUSD: true,
                  scrapedAt: new Date().toISOString(),
                });
              }
            }
          });
        } catch {}
      });
    }

    // Fallback: HTML parsing
    if (results.length === 0) {
      const $ = cheerio.load(html);
      $('[data-item-id]').each((i, el) => {
        if (i >= 8) return false;
        const title = $(el).find('[data-automation-id="product-title"]').text().trim()
          || $(el).find('span').filter((_, s) => $(s).text().length > 10 && $(s).text().length < 200).first().text().trim();
        const priceText = $(el).find('[itemprop="price"]').attr('content')
          || $(el).text().match(/\$([\d]+\.?\d*)/)?.[1];
        const image = $(el).find('img[data-testid]').attr('src') || $(el).find('img').first().attr('src');
        const link = $(el).find('a').first().attr('href');

        if (title && priceText) {
          const priceUSD = parseFloat(String(priceText).replace(/[^0-9.]/g, ''));
          if (!isNaN(priceUSD) && priceUSD > 0) {
            results.push({
              platform: 'Walmart',
              title: title.substring(0, 200),
              price: convertToINR(priceUSD),
              currency: '₹',
              rating: null,
              image: image || null,
              url: link ? (link.startsWith('http') ? link : `https://www.walmart.com${link}`) : url,
              seller: 'Walmart',
              availability: 'In Stock',
              convertedFromUSD: true,
              scrapedAt: new Date().toISOString(),
            });
          }
        }
      });
    }

    console.log(`[Scraper] Walmart: ${results.length} results for "${query}"`);
  } catch (error) {
    console.log(`[Scraper] Walmart failed: ${error.message}`);
  }
  return results;
}

// ─── Source 10: eBay (USD → INR) ────────────────────────────────────────────────
async function scrapeEbay(query) {
  const results = [];
  try {
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=15&rt=nc`;
    const html = await fetchPage(url, {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });
    const $ = cheerio.load(html);

    $('li.s-item').each((i, el) => {
      if (i >= 8 || results.length >= 6) return false;
      const title = $(el).find('.s-item__title').first().text().trim()
        || $(el).find('h3').first().text().trim();
      const priceText = $(el).find('.s-item__price').first().text().trim();
      const image = $(el).find('.s-item__image-img').attr('src')
        || $(el).find('img').first().attr('src');
      const link = $(el).find('.s-item__link').attr('href')
        || $(el).find('a').first().attr('href');

      // Skip eBay header row
      if (!title || title === 'Shop on eBay' || title.length < 5) return;

      if (priceText) {
        let price = null;
        let wasConverted = false;

        // Try INR first
        price = extractINRPrice(priceText);
        if (!price) {
          const usdPrice = extractUSDPrice(priceText);
          if (usdPrice) {
            price = convertToINR(usdPrice);
            wasConverted = true;
          } else {
            const cleanPrice = priceText.replace(/[^0-9.]/g, '');
            const parsed = parseFloat(cleanPrice);
            if (!isNaN(parsed) && parsed > 0) {
              price = convertToINR(parsed); // Assume USD if no currency symbol
              wasConverted = true;
            }
          }
        }

        if (price && price > 0 && price < 100000000) {
          results.push({
            platform: 'eBay',
            title: title.substring(0, 200),
            price: Math.round(price),
            currency: '₹',
            rating: null,
            image: (image && !image.startsWith('data:')) ? image : null,
            url: link || url,
            seller: 'eBay',
            availability: 'In Stock',
            convertedFromUSD: wasConverted,
            scrapedAt: new Date().toISOString(),
          });
        }
      }
    });

    console.log(`[Scraper] eBay: ${results.length} results for "${query}"`);
  } catch (error) {
    console.log(`[Scraper] eBay failed: ${error.message}`);
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main: Scrape All Sources (India-Focused)
// ═══════════════════════════════════════════════════════════════════════════════
async function scrapeAllPlatforms(query, productData = null) {
  console.log(`\n[Scraper] ━━━ Starting live scrape for: "${query}" ━━━`);
  console.log(`[Scraper] ━━━ Searching across 10 sources (India-focused, all prices in ₹) ━━━`);
  const startTime = Date.now();

  // Fire all scrapers in parallel — India sources first
  const settledResults = await Promise.allSettled([
    scrapeAmazonIndia(query),       // India — most popular
    scrapeFlipkart(query),          // India — second most popular
    scrapeDuckDuckGo(query),        // Global — India-biased query
    scrapeGoogleShopping(query),    // India region
    scrapeGoogleWeb(query),         // India region
    scrapeCroma(query),             // India — electronics
    scrapeSnapdeal(query),          // India — general
    scrapeJioMart(query),           // India — groceries/general
    scrapeWalmartAPI(query),        // US — converted to INR
    scrapeEbay(query),              // Global — converted to INR
  ]);

  let allResults = [];
  const sourceNames = [
    'Amazon India', 'Flipkart', 'DuckDuckGo', 'Google Shopping', 'Google Web',
    'Croma', 'Snapdeal', 'JioMart', 'Walmart', 'eBay',
  ];

  settledResults.forEach((result, idx) => {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      allResults.push(...result.value);
    } else {
      const reason = result.status === 'rejected' ? result.reason?.message : 'empty';
      console.log(`[Scraper] ${sourceNames[idx]}: no results (${reason})`);
    }
  });

  // Normalize: ensure all prices are in ₹
  allResults = allResults.map(r => ({
    ...r,
    currency: '₹',
    price: Math.round(r.price), // Round to whole INR
  }));

  // Remove invalid prices (₹0 or unreasonably low prices)
  allResults = allResults.filter(r => r.price >= 10);

  // Deduplicate by similar titles (keep cheaper one)
  const seen = new Map();
  allResults.forEach(r => {
    const key = r.title.toLowerCase().substring(0, 50);
    if (!seen.has(key) || seen.get(key).price > r.price) {
      seen.set(key, r);
    }
  });
  allResults = Array.from(seen.values());

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[Scraper] ━━━ Completed in ${elapsed}s — ${allResults.length} total results (all in ₹) ━━━\n`);

  // Sort by price ascending
  allResults.sort((a, b) => a.price - b.price);

  // Mark cheapest
  if (allResults.length > 0) {
    allResults[0].isCheapest = true;
  }

  return allResults;
}

/**
 * Generate price history data points for charts (in ₹).
 */
function generatePriceHistory(productName, basePrice, days = 30) {
  const platforms = ['Amazon India', 'Flipkart', 'Croma', 'Snapdeal', 'JioMart'];
  const history = [];
  const now = new Date();

  for (const platform of platforms) {
    let currentPrice = basePrice * (0.9 + Math.random() * 0.2);
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const change = (Math.random() * 0.06 - 0.03);
      currentPrice = Math.round(currentPrice * (1 + change) * 100) / 100;
      currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice));
      history.push({ productName, platform, price: Math.round(currentPrice), date: date.toISOString().split('T')[0] });
    }
  }
  return history;
}

module.exports = {
  scrapeAllPlatforms,
  scrapeDuckDuckGo,
  scrapeGoogleShopping,
  scrapeGoogleWeb,
  scrapeAmazonIndia,
  scrapeFlipkart,
  scrapeCroma,
  scrapeSnapdeal,
  scrapeJioMart,
  scrapeWalmartAPI,
  scrapeEbay,
  generatePriceHistory,
  USD_TO_INR,
};
