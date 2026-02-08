# Complete Deployment Guide
# Sankaat Saathi - Dual Deployment Setup

This guide covers deploying your application with:
- **Frontend**: Vercel (sankaat-saathi.vercel.app)
- **Backend**: Render (Python/FastAPI)

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment on Render](#backend-deployment-on-render)
3. [Frontend Deployment on Vercel](#frontend-deployment-on-vercel)
4. [Git Push Instructions](#git-push-instructions)
5. [Environment Variables](#environment-variables)
6. [Testing the Deployment](#testing-the-deployment)

---

## Prerequisites

### Required Accounts
- ✅ GitHub account (repository already set up)
- ✅ Vercel account (https://vercel.com)
- ✅ Render account (https://render.com)
- ✅ Supabase account (for database)

### Local Setup
- Git installed
- Node.js 24.x (for local testing)
- Python 3.11+ (for backend testing)

---

## 🚀 Backend Deployment on Render

### Step 1: Prepare Your Repository

First, ensure all changes are committed and pushed to GitHub (see [Git Push Instructions](#git-push-instructions) below).

### Step 2: Create a New Web Service on Render

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository:
   - Select **"DHRUV-SAVE21/Let_Go_3.0"** (or your repository name)
   - Click **"Connect"**

### Step 3: Configure the Web Service

Fill in the following settings:

**Basic Settings:**
- **Name**: `sankaat-saathi-backend` (or any name you prefer)
- **Region**: Choose closest to your users (e.g., Singapore for Asia)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: `Python 3`

**Build & Deploy Settings:**
- **Build Command**: `./build.sh` or `pip install -r requirements.txt`
- **Start Command**: `gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

**Instance Type:**
- Select **Free** (or paid plan for better performance)

### Step 4: Add Environment Variables

In the **Environment** section, add these variables:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase anon key |
| `PYTHON_VERSION` | `3.11.0` |
| `ALLOWED_ORIGINS` | (Optional) Additional domains if needed |

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies from `requirements.txt`
   - Start your application
   - Assign you a URL like: `https://sankaat-saathi-backend.onrender.com`

3. **Wait for deployment to complete** (usually 2-5 minutes)

### Step 6: Verify Backend is Running

Once deployed, visit your Render URL:
- `https://your-app-name.onrender.com/` → Should return `{"message": "Hello from Let Go 3.0 Backend!"}`
- `https://your-app-name.onrender.com/api/health` → Should return `{"status": "healthy"}`
- `https://your-app-name.onrender.com/docs` → FastAPI interactive docs

**📝 Note Your Backend URL** - You'll need this for the frontend!

---

## 🌐 Frontend Deployment on Vercel

### Step 1: Update Frontend Environment Variables

Before deploying, you need to update the frontend to connect to your deployed backend.

Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://your-backend-app.onrender.com
```

Replace `https://your-backend-app.onrender.com` with your actual Render backend URL.

### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended for First Deploy)**

1. Go to https://vercel.com
2. Click **"Add New..." → "Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: Leave as is (root)
   - **Build Command**: `npm run build --prefix frontend`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install --prefix frontend --legacy-peer-deps`

5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add all variables from `.env.example`:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_API_URL` (your Render backend URL)

6. Click **"Deploy"**

7. Once deployed, Vercel will give you:
   - Production URL: `https://sankaat-saathi.vercel.app`
   - Deployment URL: `https://sankat-saathi-l061zi2b6-dhruvsave2311-4181s-projects.vercel.app`

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time) or Yes (subsequent deploys)
# - Project name: sankaat-saathi
# - Directory: ./
```

### Step 3: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to **Settings → Domains**
2. Add `sankaat-saathi.vercel.app` (Vercel provides this automatically)
3. Your app will be available at both:
   - `https://sankaat-saathi.vercel.app`
   - `https://[deployment-id].vercel.app`

---

## 📤 Git Push Instructions

### Initial Setup (If not done already)

```bash
# Check current git status
git status

# Check remote repository
git remote -v

# If remote is not set, add it:
git remote add origin https://github.com/DHRUV-SAVE21/Let_Go_3.0.git
```

### Committing and Pushing Changes

```bash
# Step 1: Add all changes
git add .

# Step 2: Commit with a descriptive message
git commit -m "feat: Add Render backend deployment and Vercel frontend setup with CORS"

# Step 3: Pull latest changes (to avoid conflicts)
git pull origin main --rebase

# Step 4: Push to GitHub
git push origin main
```

### If You Encounter Issues

**Issue: "failed to push some refs"**
```bash
# Pull and merge first
git pull origin main --allow-unrelated-histories
git push origin main
```

**Issue: "Permission denied"**
```bash
# Check your GitHub authentication
git remote set-url origin https://github.com/DHRUV-SAVE21/Let_Go_3.0.git
# Or use SSH:
git remote set-url origin git@github.com:DHRUV-SAVE21/Let_Go_3.0.git
```

---

## 🔐 Environment Variables Reference

### Backend (Render)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
PYTHON_VERSION=3.11.0
ALLOWED_ORIGINS=https://additional-domain.com  # Optional
```

### Frontend (Vercel)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=https://sankaat-saathi-backend.onrender.com
```

---

## ✅ Testing the Deployment

### 1. Test Backend on Render

```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Root endpoint
curl https://your-backend.onrender.com/

# API Documentation
# Visit: https://your-backend.onrender.com/docs
```

### 2. Test Frontend on Vercel

1. Visit `https://sankaat-saathi.vercel.app`
2. Check browser console for errors
3. Test navigation between pages
4. Verify API calls to backend work correctly
5. Check that all assets load properly

### 3. Test CORS

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate your app and make API calls
4. Verify no CORS errors appear
5. Check that requests to your Render backend succeed

### 4. Common Issues and Solutions

**Frontend can't connect to backend:**
- ✅ Check `VITE_API_URL` is set correctly in Vercel
- ✅ Verify backend is running on Render
- ✅ Check CORS configuration includes your Vercel domain

**Backend CORS errors:**
- ✅ Ensure `sankaat-saathi.vercel.app` is in allowed origins
- ✅ Redeploy backend after updating CORS settings

**Build failures on Vercel:**
- ✅ Check Node.js version is 24.x in `package.json`
- ✅ Verify all dependencies install correctly
- ✅ Check build logs for specific errors

**Backend crashes on Render:**
- ✅ Check Render logs for error messages
- ✅ Verify all environment variables are set
- ✅ Ensure `requirements.txt` has all dependencies

---

## 🎯 Quick Reference Commands

### Git Commands
```bash
# Commit and push
git add .
git commit -m "your message"
git push origin main

# Check status
git status
git log --oneline -5
```

### Local Testing
```bash
# Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Deploy
```bash
# Vercel (after first setup)
git push origin main  # Auto-deploys

# Or manual:
vercel --prod

# Render deploys automatically on git push
```

---

## 📞 Support & Troubleshooting

### Render Logs
- Dashboard → Your Service → Logs tab

### Vercel Logs
- Dashboard → Your Project → Deployments → Click deployment → Logs

### Test Local to Production
```bash
# Test backend locally but frontend in production
# Update local .env:
VITE_API_URL=https://let-go-3-0.onrender.com
npm run dev

# Test frontend locally but backend in production
VITE_API_URL=https://your-backend.onrender.com
npm run dev
```

---

## ✨ Deployment Complete!

Your application is now live:
- 🌐 Frontend: https://sankaat-saathi.vercel.app
- 🔧 Backend: https://your-backend.onrender.com
- 📚 API Docs: https://your-backend.onrender.com/docs

Both platforms support:
- ✅ Automatic deploys on git push
- ✅ Easy rollback to previous versions
- ✅ Free SSL certificates
- ✅ Custom domains
- ✅ Environment variable management

Happy deploying! 🚀
