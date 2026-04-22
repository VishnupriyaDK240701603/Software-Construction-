# Project Architecture

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Router 7 |
| **Backend** | Node.js, Express 4 |
| **Database** | NeDB (embedded, file-based) |
| **Authentication** | JWT (jsonwebtoken + bcryptjs) |
| **Scraping** | Axios + Cheerio |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Security** | Helmet, Rate Limiting, HPP, XSS Protection |

## Folder Structure

```
Product Price Comparison System/
├── azure-pipelines.yml          ← CI/CD pipeline configuration
├── render.yaml                  ← Render deployment config
├── api-load-test.jmx            ← JMeter load test plan
├── .gitignore
├── README.md
│
├── backend/                     ← Express API server
│   ├── server.js                ← Entry point
│   ├── package.json             ← Backend dependencies
│   ├── config/
│   │   └── db.js                ← Database configuration
│   ├── controllers/             ← Route handlers
│   ├── middleware/               ← Security, auth, error handling
│   ├── routes/                  ← API route definitions
│   ├── services/                ← Business logic (scraping, etc.)
│   ├── utils/                   ← Utility functions
│   ├── data/                    ← Seed data scripts
│   └── db_data/                 ← NeDB database files
│
├── frontend/                    ← React + Vite SPA
│   ├── index.html               ← HTML entry point
│   ├── package.json             ← Frontend dependencies
│   ├── vite.config.js           ← Vite configuration
│   ├── vercel.json              ← Vercel deployment config
│   ├── src/                     ← React source code
│   ├── public/                  ← Static assets
│   └── dist/                    ← Production build output
│
├── docs/                        ← Project documentation
│   ├── pipeline/                ← CI/CD pipeline docs
│   └── project/                 ← Project architecture docs
│
└── docgen/                      ← Documentation generator
```

## Deployment

| Service | Platform | URL |
|---|---|---|
| **Backend API** | Render | `https://software-construction.onrender.com` |
| **Frontend App** | Vercel | `https://software-construction.vercel.app` |
| **CI/CD Pipeline** | Azure DevOps | Triggered on push to `main` |

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Health check |
| `POST /api/auth/*` | Authentication (login, register) |
| `GET /api/products/*` | Product listings & details |
| `GET /api/prices/*` | Price comparison data |
| `GET /api/search/*` | Product search |
| `*/api/wishlist/*` | User wishlists |
| `*/api/alerts/*` | Price alerts |
| `*/api/admin/*` | Admin operations |
