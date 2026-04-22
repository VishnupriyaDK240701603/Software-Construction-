# 🐝 PriceHive — Product Price Comparison System

A full-stack web application that lets users search products and compare prices across multiple e-commerce platforms in real time.

## ✨ Features

- **🔍 Product Search** — Autocomplete search with filters (price, brand, category, rating)
- **📊 Price Comparison** — Real-time prices from Amazon, eBay, Google Shopping + more
- **📈 Price History** — 30-day price trend charts per platform
- **❤️ Wishlist** — Save products and track prices
- **🔔 Price Alerts** — Get notified when prices drop below your target
- **🧑‍💼 Admin Dashboard** — Analytics, user management, product CRUD
- **🌙 Dark/Light Mode** — Toggle between themes
- **🔒 Secure** — Helmet, rate limiting, XSS protection, JWT auth, bcrypt hashing

## 🏗️ Architecture

```
Frontend (React/Vite :5173) → Backend (Express :5000) → NeDB (file-based)
                                      ↓
                              Web Scraper (Axios/Cheerio)
                              → Amazon, eBay, Google Shopping
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Backend
```bash
cd backend
npm install
npm run dev      # Starts on http://localhost:5000
```
The database auto-seeds on first run with 10 products and demo accounts.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev      # Starts on http://localhost:5173
```

### 3. Full Seed (optional — 20 products)
```bash
cd backend
npm run seed
```

## 🔑 Demo Accounts

| Role  | Email           | Password   |
|-------|-----------------|------------|
| Admin | admin@ppc.com   | Admin@123  |
| User  | demo@ppc.com    | Demo@1234  |

## 📡 API Endpoints

| Method | Endpoint                    | Auth   | Description              |
|--------|-----------------------------|--------|--------------------------|
| POST   | `/api/auth/register`        | —      | Register                 |
| POST   | `/api/auth/login`           | —      | Login, get JWT           |
| GET    | `/api/auth/me`              | User   | Get profile              |
| GET    | `/api/products`             | —      | Search/list products     |
| GET    | `/api/products/autocomplete`| —      | Autocomplete suggestions |
| GET    | `/api/products/filters`     | —      | Categories & brands      |
| GET    | `/api/products/:id`         | —      | Product details          |
| GET    | `/api/prices/:productId`    | —      | Compare prices           |
| GET    | `/api/prices/:id/history`   | —      | Price history            |
| POST   | `/api/prices/:id/refresh`   | User   | Force re-scrape          |
| GET    | `/api/wishlist`             | User   | List wishlist            |
| POST   | `/api/wishlist`             | User   | Add to wishlist          |
| DELETE | `/api/wishlist/:productId`  | User   | Remove from wishlist     |
| GET    | `/api/alerts`               | User   | List alerts              |
| POST   | `/api/alerts`               | User   | Create alert             |
| PUT    | `/api/alerts/:id`           | User   | Update alert             |
| DELETE | `/api/alerts/:id`           | User   | Delete alert             |
| GET    | `/api/admin/analytics`      | Admin  | Dashboard stats          |
| GET    | `/api/admin/users`          | Admin  | List users               |
| PUT    | `/api/admin/users/:id/role` | Admin  | Change user role         |
| DELETE | `/api/admin/users/:id`      | Admin  | Delete user              |
| POST   | `/api/admin/products`       | Admin  | Create product           |
| PUT    | `/api/admin/products/:id`   | Admin  | Update product           |
| DELETE | `/api/admin/products/:id`   | Admin  | Delete product           |

## 🗄️ Database Schema

```
Users:        { _id, name, email, password(hashed), role, createdAt }
Products:     { _id, name, brand, category, description, image, basePrice, rating, specs }
Prices:       { _id, productId, platform, price, seller, url, availability, scrapedAt }
PriceHistory: { _id, productId, platform, price, date }
Alerts:       { _id, userId, productId, targetPrice, isActive, createdAt }
Wishlist:     { _id, userId, productId, addedAt }
SearchLogs:   { _id, query, userId, timestamp }
```

## 🔒 Security Features

- **Helmet** — Secure HTTP headers
- **Rate Limiting** — 100 req/15min global, 15 req/15min for auth
- **XSS Protection** — Recursive input sanitization
- **HPP** — HTTP Parameter Pollution prevention
- **JWT** — Secure token-based auth with expiry
- **bcrypt** — Password hashing with 12 salt rounds
- **Input Validation** — Server-side validation on all inputs
- **CORS** — Restricted to frontend origin
- **Body Size Limit** — 10KB max request body

## 📁 Project Structure

```
├── backend/
│   ├── config/db.js          # Database connections
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth, security, errors
│   ├── routes/               # API route definitions
│   ├── services/scraper.js   # Web scraping engine
│   ├── utils/validators.js   # Input validation
│   ├── data/seed.js          # Database seeder
│   └── server.js             # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React context providers
│   │   ├── pages/            # Page components
│   │   ├── services/api.js   # API client
│   │   ├── App.jsx           # Router & layout
│   │   └── index.css         # Design system
│   └── index.html
└── README.md
```

## 🚢 Deployment

### Recommended Platforms
- **Frontend**: Vercel, Netlify
- **Backend**: Render, Railway, AWS EC2
- **Database**: Swap NeDB → MongoDB Atlas for production

### Environment Variables
Copy `backend/.env.example` to `backend/.env` and update:
```
JWT_SECRET=<your-secure-random-string>
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📜 License

MIT
