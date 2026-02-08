# Deployment Guide - Fixed Issues

## Issues Fixed ✅

### 1. Backend Deployment Issues
- **Removed problematic packages**: `cryptography` and `bcrypt` that were causing Rust/maturin errors
- **Fixed Procfile**: Removed duplicate entries
- **Enhanced CORS**: Added proper Vercel domain support with wildcard patterns
- **Environment variables**: Added production configuration

### 2. Frontend Deployment Issues
- **Added missing axios**: Installed with `--legacy-peer-deps` to resolve React 19 conflicts
- **API configuration**: Created centralized API client with proper error handling
- **Environment setup**: Added production environment variables
- **Vercel config**: Enhanced with proper headers and environment variables

### 3. CORS Configuration
- **Backend**: Added comprehensive CORS middleware supporting all Vercel domains
- **Frontend**: Configured axios client with credentials and proper headers

## Backend Deployment Steps

### Option 1: Heroku
```bash
# 1. Install Heroku CLI and login
heroku login

# 2. Create app
heroku create your-app-name

# 3. Set environment variables
heroku config:set ALLOWED_ORIGINS="https://let-go-3-0.vercel.app,https://lets-go-3-frontend.vercel.app"
heroku config:set ENVIRONMENT=production
heroku config:set SUPABASE_URL=your_supabase_url
heroku config:set SUPABASE_KEY=your_supabase_key
heroku config:set GEMINI_API_KEY=your_gemini_key

# 4. Deploy
cd backend
git add .
git commit -m "Deploy backend"
git push heroku main
```

### Option 2: Railway
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
railway login
cd backend
railway init
railway up
```

### Option 3: Render
1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
5. Add environment variables in Render dashboard

## Frontend Deployment Steps

### Vercel (Already configured)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
cd frontend
vercel

# 3. Set environment variables in Vercel dashboard:
# VITE_API_BASE_URL=https://your-backend-url.herokuapp.com
```

## Environment Variables Setup

### Backend (.env or Heroku config)
```
ALLOWED_ORIGINS=https://let-go-3-0.vercel.app,https://lets-go-3-frontend.vercel.app
ENVIRONMENT=production
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_key
```

### Frontend (Vercel environment variables)
```
VITE_API_BASE_URL=https://your-backend-url.herokuapp.com
VITE_SUPABASE_URL=https://vbtqlofjbuzxwskzybnl.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPEN_WEATHER_MAP_API=your_weather_api_key
```

## Testing Deployment

### 1. Test Backend
```bash
curl https://your-backend-url.herokuapp.com/api/health
```

### 2. Test Frontend
- Visit your Vercel URL
- Check browser console for any CORS errors
- Test API calls from frontend

## Common Issues & Solutions

### 1. CORS Errors
- Ensure backend ALLOWED_ORIGINS includes your Vercel domain
- Check that frontend API_BASE_URL points to correct backend

### 2. Build Failures
- **Backend**: Check that all packages in requirements.txt are compatible
- **Frontend**: Use `--legacy-peer-deps` for npm install

### 3. Blank Screen on Frontend
- Check browser console for JavaScript errors
- Verify API_BASE_URL is correctly set
- Ensure backend is running and accessible

### 4. API Connection Issues
- Verify CORS headers in network tab
- Check that backend URL is accessible
- Ensure environment variables are set correctly

## Quick Fix Commands

### If frontend shows blank screen:
```bash
cd frontend
npm run build
# Check dist/index.html exists
# Verify no console errors in browser
```

### If CORS errors persist:
```bash
# Update backend CORS origins
heroku config:set ALLOWED_ORIGINS="https://your-vercel-domain.vercel.app"
```

### If backend deployment fails:
```bash
# Check logs
heroku logs --tail
# Or for Railway/Render, check their respective logs
```

## Success Indicators

✅ Backend health endpoint returns 200
✅ Frontend loads without blank screen
✅ No CORS errors in browser console
✅ API calls work from frontend to backend
✅ All features functional

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs for API errors
3. Verify all environment variables are set
4. Test API endpoints directly with curl/Postman