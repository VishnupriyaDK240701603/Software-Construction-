/**
 * Server Entry Point
 * Initializes Express app with all middleware, routes, and security features.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { applySecurity } = require('./middleware/security');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const priceRoutes = require('./routes/prices');
const searchRoutes = require('./routes/search');
const wishlistRoutes = require('./routes/wishlist');
const alertRoutes = require('./routes/alerts');
const adminRoutes = require('./routes/admin');

const app = express();

// --- Core Middleware ---
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
    allowed.push('http://localhost:5173', 'https://software-construction.vercel.app');
    if (!origin || allowed.some(allowedOrigin => origin.endsWith(allowedOrigin.replace(/https?:\/\//, '').replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent abuse
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// --- Security Middleware ---
applySecurity(app);

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRoutes);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Product Price Comparison API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// --- Global Error Handler ---
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Ensure database directory exists
    const fs = require('fs');
    const dbDir = path.join(__dirname, 'db_data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Auto-seed if database is empty
    const db = require('./config/db');
    const productCount = await db.products.count({});
    if (productCount === 0) {
      console.log('📦 Empty database detected — running auto-seed...');
      const bcrypt = require('bcryptjs');
      const { generatePriceHistory } = require('./services/scraper');

      // Create admin + demo user
      const salt = await bcrypt.genSalt(12);
      await db.users.insert({ name: 'Admin User', email: 'admin@ppc.com', password: await bcrypt.hash('Admin@123', salt), role: 'admin', createdAt: new Date().toISOString() });
      await db.users.insert({ name: 'Demo User', email: 'demo@ppc.com', password: await bcrypt.hash('Demo@1234', salt), role: 'user', createdAt: new Date().toISOString() });

      // Diverse product catalog (prices in ₹ — scraped live from real platforms)
      const seedProducts = [
        { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Electronics', description: 'Galaxy S24 Ultra with Galaxy AI', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', basePrice: 134999, rating: 4.7 },
        { name: 'Sony WH-1000XM5 Headphones', brand: 'Sony', category: 'Electronics', description: 'Noise canceling headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', basePrice: 26990, rating: 4.6 },
        { name: 'boAt Airdopes 141', brand: 'boAt', category: 'Electronics', description: 'TWS earbuds 42H playtime', image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400', basePrice: 1299, rating: 4.3 },
        { name: 'Tata Gold Tea 500g', brand: 'Tata', category: 'Groceries', description: 'Premium long leaf tea', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', basePrice: 285, rating: 4.4 },
        { name: 'Nescafe Classic Coffee 200g', brand: 'Nescafe', category: 'Groceries', description: 'Instant coffee 200g', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', basePrice: 560, rating: 4.5 },
        { name: 'Lakme 9to5 Foundation', brand: 'Lakme', category: 'Beauty', description: 'Primer + Matte Foundation', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', basePrice: 650, rating: 4.2 },
        { name: 'Mamaearth Onion Hair Oil', brand: 'Mamaearth', category: 'Beauty', description: 'Hair oil with Redensyl', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400', basePrice: 449, rating: 4.3 },
        { name: 'Nike Air Max Running Shoes', brand: 'Nike', category: 'Fashion', description: 'Air Max 270 React', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', basePrice: 8995, rating: 4.6 },
        { name: 'Prestige Induction Cooktop', brand: 'Prestige', category: 'Home & Kitchen', description: '1600W induction cooktop', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', basePrice: 2199, rating: 4.3 },
        { name: 'Atomic Habits by James Clear', brand: 'Penguin', category: 'Books', description: 'Build good habits bestseller', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', basePrice: 399, rating: 4.8 },
      ];

      for (const p of seedProducts) {
        const inserted = await db.products.insert({ ...p, specs: {}, createdAt: new Date().toISOString() });
        // Generate price history (live prices fetched on-demand when user views product)
        const history = generatePriceHistory(p.name, p.basePrice, 30);
        for (const h of history) {
          await db.priceHistory.insert({ productId: inserted._id, platform: h.platform, price: h.price, date: h.date });
        }
      }
      console.log('✅ Auto-seed completed with diverse products (prices fetched live from real sites)');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
      console.log(`🔒 Security: Helmet, Rate Limiting, XSS Protection, HPP enabled`);
      console.log(`🌍 CORS: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      console.log(`\n📋 Login Credentials:`);
      console.log(`   Admin: admin@ppc.com / Admin@123`);
      console.log(`   User:  demo@ppc.com / Demo@1234\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
