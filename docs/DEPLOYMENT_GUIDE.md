# DueLedger — Production Deployment Troubleshooting & Guide

If you encounter **Login/Signup Errors (e.g. 404 Not Found, 500 Network Error, or Failed to Fetch)** after deploying, here is why it happens and how to resolve it in 3 easy steps.

---

## 🔍 Why Login/Signup Errors Happen After Deploying

There are **3 common reasons** for deployment errors:

### 1. Missing Backend API URL on the Frontend (`VITE_API_URL`)
- **What happens**: In local development, Vite proxies `/api` requests to `http://localhost:5000`.
- **In production**: When you deploy the frontend (e.g., on Vercel or Netlify), Vite does not run a proxy. If you don't tell the frontend where your backend is hosted, requests to `/api/auth/login` go to the frontend server and return `404 Not Found`.
- **Fix**: Set `VITE_API_URL=https://your-backend-api.onrender.com/api` in your frontend environment variables.

---

### 2. Missing `MONGODB_URI` in Backend Cloud Host
- **What happens**: Locally, the backend fell back to a local database. In production on cloud hosts (Render, Railway, Heroku), you must provide a real MongoDB connection string.
- **If missing**: The backend cannot connect to a database, causing `/api/auth/register` and `/api/auth/login` to fail.
- **Fix**: Set `MONGODB_URI` to your MongoDB Atlas cluster URI in your backend host environment variables.

---

### 3. Missing `JWT_SECRET`
- **What happens**: JWT token signing requires a secret key.
- **Fix**: Set `JWT_SECRET=your_secure_random_key_here` in your backend environment variables.

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Set Up Free Database (MongoDB Atlas)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
2. Under **Database Access**, create a database user and password (e.g. `admin_user` / `SecurePassword123`).
3. Under **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere).
4. Click **Connect** → **Drivers** → Copy the connection string:
   ```
   mongodb+srv://admin_user:SecurePassword123@cluster0.abcde.mongodb.net/dueledger?retryWrites=true&w=majority
   ```

---

### Step 2: Deploy the Backend (e.g. on Render / Railway)
1. Go to [render.com](https://render.com) and create a **Web Service** linked to your repository `PaymentTracker`.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node src/server.js`)
3. Add **Environment Variables** in the Render Dashboard:
   - `MONGODB_URI`: `mongodb+srv://admin_user:SecurePassword123@cluster0.abcde.mongodb.net/dueledger?retryWrites=true&w=majority`
   - `JWT_SECRET`: `dueledger_production_super_secret_key_2026`
   - `NODE_ENV`: `production`
4. Copy your backend live URL (e.g., `https://dueledger-api.onrender.com`).
5. Test health by opening `https://dueledger-api.onrender.com/api/health` in your browser. It should show:
   ```json
   {
     "status": "ok",
     "app": "DueLedger API",
     "database": "connected"
   }
   ```

---

### Step 3: Deploy the Frontend (e.g. on Vercel / Netlify)
1. Go to [vercel.com](https://vercel.com) and import the `PaymentTracker` repository.
2. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
3. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://dueledger-api.onrender.com/api` *(replace with your actual backend URL + `/api`)*
4. Click **Deploy**.
5. Once deployed, open your frontend URL and test **Signup / Login / 1-Click Demo Login** — it will connect directly to your cloud backend with zero errors!
