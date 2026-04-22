/**
 * Database Seed Script
 * Populates the database with diverse product categories and demo accounts.
 * Products span: Electronics, Groceries, Beauty, Fashion, Home, Sports, Books, etc.
 * Run: node data/seed.js
 */
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const db = require('../config/db');
const { generatePriceHistory } = require('../services/scraper');

const PRODUCTS = [
  // ─── Electronics ─────────────────────────────────────────────────────────
  { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Electronics', description: 'Samsung Galaxy S24 Ultra with Galaxy AI, 200MP camera, S Pen, titanium frame.', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', basePrice: 134999, rating: 4.7 },
  { name: 'Apple iPhone 15 Pro Max', brand: 'Apple', category: 'Electronics', description: 'iPhone 15 Pro Max with A17 Pro chip, titanium design, 5x optical zoom.', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', basePrice: 159900, rating: 4.8 },
  { name: 'Sony WH-1000XM5 Headphones', brand: 'Sony', category: 'Electronics', description: 'Industry-leading noise canceling headphones with 30-hour battery life.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', basePrice: 26990, rating: 4.6 },
  { name: 'HP Pavilion Laptop 15', brand: 'HP', category: 'Electronics', description: 'HP Pavilion with Intel i5, 16GB RAM, 512GB SSD, 15.6" FHD display.', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400', basePrice: 65990, rating: 4.5 },
  { name: 'boAt Airdopes 141', brand: 'boAt', category: 'Electronics', description: 'True wireless earbuds with 42H playtime, ENx tech, low latency mode.', image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400', basePrice: 1299, rating: 4.3 },

  // ─── Groceries & Kitchen ─────────────────────────────────────────────────
  { name: 'Tata Gold Tea 500g', brand: 'Tata', category: 'Groceries', description: 'Premium long leaf tea with rich taste and aroma. 500g pack.', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', basePrice: 285, rating: 4.4 },
  { name: 'Aashirvaad Atta 10kg', brand: 'Aashirvaad', category: 'Groceries', description: 'Aashirvaad Superior MP Whole Wheat Atta, 10 kg pack. 0% Maida.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', basePrice: 480, rating: 4.5 },
  { name: 'Saffola Gold Oil 5L', brand: 'Saffola', category: 'Groceries', description: 'Saffola Gold Refined Cooking Oil blend of Rice Bran & Sunflower, 5 Litre.', image: 'https://images.unsplash.com/photo-1474979266404-7eaacdc2f114?w=400', basePrice: 890, rating: 4.3 },
  { name: 'Nescafe Classic Coffee 200g', brand: 'Nescafe', category: 'Groceries', description: 'Nescafe Classic Instant Coffee, 100% Pure Coffee, 200g jar.', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', basePrice: 560, rating: 4.5 },
  { name: 'Amul Butter 500g', brand: 'Amul', category: 'Groceries', description: 'Amul Pasteurised Butter. Made from fresh cream.', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', basePrice: 290, rating: 4.6 },

  // ─── Beauty & Personal Care ──────────────────────────────────────────────
  { name: 'Lakme 9to5 Primer + Matte Foundation', brand: 'Lakme', category: 'Beauty', description: 'Lakme 9 to 5 Primer + Matte Perfect Cover Foundation, universal shade.', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', basePrice: 650, rating: 4.2 },
  { name: 'Mamaearth Onion Hair Oil 250ml', brand: 'Mamaearth', category: 'Beauty', description: 'Onion Hair Oil for hair regrowth with Redensyl. 250ml bottle.', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400', basePrice: 449, rating: 4.3 },
  { name: 'Nivea Soft Moisturizing Cream 300ml', brand: 'Nivea', category: 'Beauty', description: 'Nivea Soft Light Moisturising Cream with Vitamin E & Jojoba Oil. 300ml.', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', basePrice: 345, rating: 4.4 },
  { name: 'Biotique Green Apple Shampoo 650ml', brand: 'Biotique', category: 'Beauty', description: 'Bio Green Apple Fresh Daily Purifying Shampoo & Conditioner. 650ml.', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400', basePrice: 299, rating: 4.1 },
  { name: 'Maybelline Colossal Kajal', brand: 'Maybelline', category: 'Beauty', description: 'Maybelline New York Colossal Kajal, Super Black, smudge-proof, 12H stay.', image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400', basePrice: 199, rating: 4.5 },

  // ─── Fashion & Clothing ──────────────────────────────────────────────────
  { name: 'Levi\'s 511 Slim Fit Jeans', brand: 'Levi\'s', category: 'Fashion', description: 'Levi\'s Men\'s 511 Slim Fit Jeans, classic dark blue wash.', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', basePrice: 2999, rating: 4.4 },
  { name: 'Nike Air Max Running Shoes', brand: 'Nike', category: 'Fashion', description: 'Nike Air Max 270 React Running Shoes for Men, breathable mesh upper.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', basePrice: 8995, rating: 4.6 },
  { name: 'Allen Solly Formal Shirt', brand: 'Allen Solly', category: 'Fashion', description: 'Allen Solly Men\'s Regular Fit Cotton Formal Shirt, checkered pattern.', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', basePrice: 1499, rating: 4.2 },
  { name: 'Wildcraft Trekking Backpack 45L', brand: 'Wildcraft', category: 'Fashion', description: 'Wildcraft 45 Ltrs Grey Rucksack with rain cover for hiking and trekking.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', basePrice: 3599, rating: 4.4 },

  // ─── Home & Kitchen ──────────────────────────────────────────────────────
  { name: 'Prestige Induction Cooktop', brand: 'Prestige', category: 'Home & Kitchen', description: 'Prestige PIC 20 1600-Watt Induction Cooktop with automatic voltage regulator.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', basePrice: 2199, rating: 4.3 },
  { name: 'Pigeon 5L Stainless Steel Pressure Cooker', brand: 'Pigeon', category: 'Home & Kitchen', description: 'Pigeon by Stovekraft Favourite 5 Litre Outer Lid Pressure Cooker.', image: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400', basePrice: 1199, rating: 4.4 },
  { name: 'Philips Mixer Grinder 750W', brand: 'Philips', category: 'Home & Kitchen', description: 'Philips HL7756/00 Mixer Grinder 750 Watt, 3 Jars, turbo motor.', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400', basePrice: 3890, rating: 4.5 },
  { name: 'Milton Thermosteel Flask 1L', brand: 'Milton', category: 'Home & Kitchen', description: 'Milton Thermosteel Duo DLX 1000 Flask, 1L stainless steel, 24hr hot/cold.', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', basePrice: 799, rating: 4.4 },

  // ─── Health & Sports ─────────────────────────────────────────────────────
  { name: 'MuscleTech Whey Protein 2kg', brand: 'MuscleTech', category: 'Health & Sports', description: 'MuscleTech NitroTech Whey Protein Powder 2kg, Milk Chocolate.', image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2c4d8?w=400', basePrice: 4499, rating: 4.3 },
  { name: 'Boldfit Yoga Mat 6mm', brand: 'Boldfit', category: 'Health & Sports', description: 'Boldfit Yoga Mat 6mm, Anti-Skid, extra thick, for gym and exercise.', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', basePrice: 499, rating: 4.2 },
  { name: 'Yonex Badminton Racket', brand: 'Yonex', category: 'Health & Sports', description: 'Yonex Muscle Power 29 Badminton Racket, lightweight, head heavy.', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400', basePrice: 1790, rating: 4.5 },

  // ─── Books ───────────────────────────────────────────────────────────────
  { name: 'Atomic Habits by James Clear', brand: 'Penguin', category: 'Books', description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Bestseller.', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', basePrice: 399, rating: 4.8 },
  { name: 'Rich Dad Poor Dad - Robert Kiyosaki', brand: 'Plata Publishing', category: 'Books', description: 'What the Rich Teach Their Kids About Money That the Poor and Middle Class Do Not.', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', basePrice: 299, rating: 4.6 },

  // ─── Baby & Kids ─────────────────────────────────────────────────────────
  { name: 'Pampers Diapers Large 64 Count', brand: 'Pampers', category: 'Baby & Kids', description: 'Pampers All Round Protection Pants Large Size Baby Diapers (L), 64 count.', image: 'https://images.unsplash.com/photo-1584839404042-8bc42d356781?w=400', basePrice: 1149, rating: 4.4 },
  { name: 'Himalaya Baby Lotion 400ml', brand: 'Himalaya', category: 'Baby & Kids', description: 'Himalaya Baby Lotion with olive oil & almond oil, 400ml.', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400', basePrice: 230, rating: 4.5 },
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Clear all data
    await Promise.all([
      db.users.remove({}, { multi: true }),
      db.products.remove({}, { multi: true }),
      db.prices.remove({}, { multi: true }),
      db.priceHistory.remove({}, { multi: true }),
      db.alerts.remove({}, { multi: true }),
      db.wishlist.remove({}, { multi: true }),
      db.searchLogs.remove({}, { multi: true }),
    ]);
    console.log('  ✓ Cleared existing data');

    // Create admin and demo users
    const salt = await bcrypt.genSalt(12);
    await db.users.insert({
      name: 'Admin User', email: 'admin@ppc.com',
      password: await bcrypt.hash('Admin@123', salt),
      role: 'admin', createdAt: new Date().toISOString(),
    });
    await db.users.insert({
      name: 'Demo User', email: 'demo@ppc.com',
      password: await bcrypt.hash('Demo@1234', salt),
      role: 'user', createdAt: new Date().toISOString(),
    });
    console.log('  ✓ Created admin (admin@ppc.com / Admin@123)');
    console.log('  ✓ Created demo user (demo@ppc.com / Demo@1234)');

    // Insert products
    const insertedProducts = [];
    for (const p of PRODUCTS) {
      const inserted = await db.products.insert({
        ...p, specs: {}, createdAt: new Date().toISOString(),
      });
      insertedProducts.push(inserted);
    }
    console.log(`  ✓ Inserted ${insertedProducts.length} products across ${[...new Set(PRODUCTS.map(p => p.category))].length} categories`);

    // Generate 30-day price history for each product
    for (const product of insertedProducts) {
      const history = generatePriceHistory(product.name, product.basePrice, 30);
      for (const h of history) {
        await db.priceHistory.insert({
          productId: product._id, platform: h.platform, price: h.price, date: h.date,
        });
      }
    }
    console.log('  ✓ Generated 30-day price history for all products');

    console.log('\n✅ Database seeded successfully!');
    console.log(`\n📦 ${insertedProducts.length} Products in categories:`);
    const cats = {};
    PRODUCTS.forEach(p => cats[p.category] = (cats[p.category] || 0) + 1);
    Object.entries(cats).forEach(([cat, count]) => console.log(`   • ${cat}: ${count} products`));
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@ppc.com / Admin@123');
    console.log('   User:  demo@ppc.com / Demo@1234');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
