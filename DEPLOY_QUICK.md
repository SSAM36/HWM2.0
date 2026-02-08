# 🚀 Quick Deployment Steps

## Current Status
- ✅ CORS configured for sankaat-saathi.vercel.app
- ✅ Backend ready for Render deployment
- ✅ Frontend ready for Vercel deployment
- ✅ Node.js 24.x configured

## 📦 Push to GitHub

```bash
# Add all changes
git add .

# Commit
git commit -m "feat: Setup dual deployment - Vercel frontend + Render backend with CORS"

# Push to GitHub
git push origin main
```

---

## 🔧 Backend Deployment (Render)

### Via Dashboard:
1. Go to https://render.com → **New** → **Web Service**
2. Connect repository: **DHRUV-SAVE21/Let_Go_3.0**
3. Configure:
   - **Name**: `sankaat-saathi-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
5. Click **Create Web Service**

**Your backend URL**: `https://your-app-name.onrender.com`

---

## 🌐 Frontend Deployment (Vercel)

### Via Dashboard:
1. Go to https://vercel.com → **New Project**
2. Import repository: **DHRUV-SAVE21/Let_Go_3.0**
3. Configure:
   - **Framework**: Vite
   - **Build Command**: `npm run build --prefix frontend`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install --prefix frontend --legacy-peer-deps`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` = `https://your-backend.onrender.com`
5. Click **Deploy**

**Your frontend URL**: `https://sankaat-saathi.vercel.app`

---

## ⚡ Super Quick Deploy

### Using CLI:

**Vercel:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Render:**
- Use dashboard (CLI coming soon for Python)

---

## 🔐 Environment Variables Needed

### Backend (Render):
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PYTHON_VERSION=3.11.0
```

### Frontend (Vercel):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_URL=https://your-backend.onrender.com
```

---

## ✅ Test Deployment

**Backend:**
```bash
curl https://your-backend.onrender.com/api/health
```

**Frontend:**
- Visit: https://sankaat-saathi.vercel.app
- Check console for errors
- Test API calls

---

## 📚 Full Guide
See `DEPLOYMENT_GUIDE.md` for detailed instructions, troubleshooting, and advanced configuration.

---

## 🎯 After Deployment

1. ✅ Test all features work
2. ✅ Verify CORS works (no errors in console)
3. ✅ Check API calls succeed
4. ✅ Test navigation and routing
5. ✅ Verify images/assets load

**Both deployments auto-update on git push!** 🎉
