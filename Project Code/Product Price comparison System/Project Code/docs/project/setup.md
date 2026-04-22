# Local Development Setup

## Prerequisites

- **Node.js** 18.x or later — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/VishnupriyaDK240701603/Software-Construction.git
cd Software-Construction
```

### 2. Set Up Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

Start the backend server:

```bash
npm start        # Production
npm run dev      # Development (with auto-reload)
```

The API will be available at `http://localhost:5000/api`.

### 3. Set Up Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Default Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ppc.com` | `Admin@123` |
| User | `demo@ppc.com` | `Demo@1234` |

> **Note:** These accounts are auto-created when the backend starts with an empty database.

## Available Scripts

### Backend

| Command | Description |
|---|---|
| `npm start` | Start the server |
| `npm run dev` | Start with auto-reload |
| `npm run seed` | Seed the database |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
