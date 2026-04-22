# Step 3: Pipeline Tasks

The `azure-pipelines.yml` file defines the following tasks that run automatically when the pipeline is triggered.

---

## 3a) Setting up the Node.js Environment using the `NodeTool@0` Task

```yaml
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'  # Use Node.js 18.x LTS version
  displayName: "Set up Node.js"
```

Since the Product Price Comparison System is built with **Node.js (Express backend)** and **React + Vite (frontend)**, we use the `NodeTool@0` task to set up Node.js 18.x LTS on the build agent. This ensures the correct runtime is available for installing dependencies and building the project.

---

## 3b) Installing Project Dependencies from the Correct Path

### Backend Dependencies

Backend dependencies are installed from `backend/package.json`:

```yaml
- script: |
    cd backend
    npm install
  displayName: "Install backend dependencies"
```

The backend uses the following key packages:
- `express` — Web framework
- `cors` — Cross-origin resource sharing
- `helmet` — Security headers
- `jsonwebtoken` — JWT authentication
- `bcryptjs` — Password hashing
- `nedb-promises` — Embedded database
- `axios` & `cheerio` — Price scraping

### Frontend Dependencies

Frontend dependencies are installed from `frontend/package.json`:

```yaml
- script: |
    cd frontend
    npm install
  displayName: "Install frontend dependencies"
```

The frontend uses the following key packages:
- `react` & `react-dom` — UI framework
- `react-router-dom` — Client-side routing
- `axios` — API requests
- `recharts` — Price history charts
- `lucide-react` — Icons
- `vite` — Build tool

### Frontend Production Build

After installing dependencies, the frontend is compiled into an optimized production bundle:

```yaml
- script: |
    cd frontend
    npm run build
  displayName: "Build frontend"
```

The project follows a **monorepo structure** with separate `backend/` and `frontend/` directories, each containing their own `package.json`. The pipeline navigates into the correct path (`cd backend` and `cd frontend`) before running `npm install` to ensure dependencies are resolved from the right location.

---

## 3c) Running a Simple Script to Verify the Pipeline Works

```yaml
- script: |
    node -e "console.log('🛒 Hello from Product Price Comparison System!'); console.log('Node version:', process.version); console.log('Pipeline working successfully ✅');"
  displayName: "Run a Node.js verification script"
```

This step runs a simple Node.js script that prints a greeting message along with the Node.js version to confirm that:

- ✅ The Node.js environment is set up correctly
- ✅ The pipeline is running and executing scripts as expected
- ✅ The build agent can execute Node.js commands without issues

### Expected Output

```
🛒 Hello from Product Price Comparison System!
Node version: v18.x.x
Pipeline working successfully ✅
```
