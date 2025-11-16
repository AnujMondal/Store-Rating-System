# Deployment Guide

This guide covers deploying the Store Rating System to production using various platforms.

## Table of Contents

- [Option 1: Render (Recommended - Free Tier)](#option-1-render-recommended)
- [Option 2: Railway](#option-2-railway)
- [Option 3: Heroku](#option-3-heroku)
- [Option 4: Vercel + Render](#option-4-vercel--render)

---

## Option 1: Render (Recommended)

Render offers free hosting for both frontend and backend with PostgreSQL database.

### Prerequisites

- GitHub account
- Push your code to a GitHub repository

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - Store Rating System"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/store-rating-system.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `store-rating-db`
   - **Database**: `store_rating_db`
   - **User**: (auto-generated)
   - **Region**: Choose closest to you
   - **Instance Type**: Free
4. Click **"Create Database"**
5. **Save these credentials** (shown on the database page):
   - Internal Database URL
   - External Database URL
   - PSQL Command

### Step 3: Deploy Backend

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:

   - **Name**: `store-rating-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. **Add Environment Variables** (click "Environment" tab):

   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=<from Render database>
   DB_PORT=5432
   DB_NAME=store_rating_db
   DB_USER=<from Render database>
   DB_PASSWORD=<from Render database>
   JWT_SECRET=<generate a random 64-char string>
   JWT_EXPIRE=7d
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=Admin@123
   ```

5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. **Run migrations**:

   - Go to your service dashboard
   - Click "Shell" tab
   - Run: `npm run migrate`

8. **Copy your backend URL**: `https://store-rating-backend.onrender.com`

### Step 4: Deploy Frontend

1. **Update API URL in frontend**:

   Edit `frontend/src/utils/api.js`:

   ```javascript
   const API_BASE_URL =
     process.env.REACT_APP_API_URL ||
     "https://store-rating-backend.onrender.com/api";
   ```

2. **Commit and push changes**:

   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push
   ```

3. On Render, click **"New +"** → **"Static Site"**
4. Connect your GitHub repository
5. Configure:

   - **Name**: `store-rating-frontend`
   - **Root Directory**: `frontend`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

6. **Add Environment Variable**:

   ```
   REACT_APP_API_URL=https://store-rating-backend.onrender.com/api
   ```

7. Click **"Create Static Site"**
8. Your app will be live at: `https://store-rating-frontend.onrender.com`

### ✅ Done! Your app is deployed!

**Access your app**: `https://store-rating-frontend.onrender.com`

**Default admin login**:

- Email: `admin@example.com`
- Password: `Admin@123`

---

## Option 2: Railway

Railway provides $5 free credit per month.

### Step 1: Deploy to Railway

1. Visit [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository

### Step 2: Add PostgreSQL

1. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway will provision the database
3. Click on PostgreSQL service to see connection details

### Step 3: Configure Backend Service

1. Click on your backend service
2. Go to **"Variables"** tab
3. Add environment variables:

   ```
   NODE_ENV=production
   PORT=${{PORT}}
   DATABASE_URL=${{DATABASE_URL}}
   JWT_SECRET=<generate random string>
   JWT_EXPIRE=7d
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=Admin@123
   ```

4. Go to **"Settings"** → **"Deploy"**:

   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Click **"Deploy"**

### Step 4: Run Migrations

1. Click **"Settings"** → **"Connect"**
2. Use Railway CLI or web terminal
3. Run: `npm run migrate`

### Step 5: Configure Frontend Service

1. Add another service for frontend
2. Set variables:
   ```
   REACT_APP_API_URL=<your backend URL>/api
   ```
3. Configure build:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build`

---

## Option 3: Heroku

### Prerequisites

- Heroku CLI installed: `npm install -g heroku`

### Step 1: Prepare for Heroku

Create `Procfile` in backend directory:

```
web: node server.js
```

Create `Procfile` in frontend directory:

```
web: npm start
```

### Step 2: Deploy Backend

```bash
cd backend
heroku login
heroku create your-app-backend
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key
heroku config:set JWT_EXPIRE=7d
heroku config:set ADMIN_EMAIL=admin@example.com
heroku config:set ADMIN_PASSWORD=Admin@123

git init
git add .
git commit -m "Deploy backend"
git push heroku main

# Run migrations
heroku run npm run migrate
```

### Step 3: Deploy Frontend

```bash
cd ../frontend
heroku create your-app-frontend

# Update API URL in .env.production
echo "REACT_APP_API_URL=https://your-app-backend.herokuapp.com/api" > .env.production

heroku config:set REACT_APP_API_URL=https://your-app-backend.herokuapp.com/api

git init
git add .
git commit -m "Deploy frontend"
git push heroku main
```

---

## Option 4: Vercel + Render

Deploy frontend on Vercel and backend on Render for optimal performance.

### Step 1: Deploy Backend on Render

Follow [Option 1: Steps 2-3](#step-2-deploy-postgresql-database)

### Step 2: Deploy Frontend on Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend:

   ```bash
   cd frontend
   ```

3. Create `vercel.json`:

   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "build",
     "devCommand": "npm start",
     "env": {
       "REACT_APP_API_URL": "https://your-backend.onrender.com/api"
     }
   }
   ```

4. Deploy:

   ```bash
   vercel
   ```

5. Follow prompts and your app will be live!

---

## Post-Deployment Checklist

- ✅ Database connected and migrations run
- ✅ Environment variables set correctly
- ✅ Frontend can connect to backend API
- ✅ Admin login works
- ✅ User registration works
- ✅ Store creation works
- ✅ Rating system works
- ✅ SSL/HTTPS enabled (automatic on most platforms)

## Troubleshooting

### Frontend can't connect to backend

- Check CORS settings in `backend/server.js`
- Verify API URL in frontend is correct
- Check browser console for errors

### Database connection errors

- Verify DATABASE*URL or DB*\* variables
- Check database service is running
- Ensure migrations have been run

### "Admin user already exists" error

- This is normal if migrations were run multiple times
- Admin credentials: admin@example.com / Admin@123

---

## Monitoring & Maintenance

### View Logs

- **Render**: Service dashboard → Logs tab
- **Railway**: Service → Logs
- **Heroku**: `heroku logs --tail`

### Database Backups

- **Render**: Automatic on paid plans
- **Railway**: Manual export via pg_dump
- **Heroku**: `heroku pg:backups:capture`

---

## Updating Your Deployment

```bash
# Make changes to code
git add .
git commit -m "Update description"
git push origin main
```

Most platforms will automatically redeploy when you push to main branch!

---

## Cost Considerations

| Platform | Free Tier              | Paid Plans Start At |
| -------- | ---------------------- | ------------------- |
| Render   | ✅ Yes (750 hrs/month) | $7/month            |
| Railway  | ✅ $5 credit/month     | $5/month            |
| Heroku   | ❌ No (ended 2022)     | $5/month            |
| Vercel   | ✅ Yes (hobby)         | $20/month           |

**Recommendation**: Start with **Render's free tier** for both frontend and backend!
