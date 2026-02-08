# Deployment Guide for Vercel

## Prerequisites
- Vercel account connected to your GitHub repository
- All environment variables configured in Vercel dashboard

## Configuration Files

### 1. package.json (Root)
- Added `"engines": { "node": "24.x" }` to specify Node.js version

### 2. frontend/package.json
- Added `"engines": { "node": "24.x" }` to specify Node.js version

### 3. vercel.json
The deployment configuration:
```json
{
    "buildCommand": "npm run build --prefix frontend",
    "outputDirectory": "frontend/dist",
    "installCommand": "npm install --prefix frontend --legacy-peer-deps",
    "framework": "vite",
    "rewrites": [
        {
            "source": "/(.*)",
            "destination": "/index.html"
        }
    ]
}
```

### 4. .vercelignore
Excludes unnecessary files from deployment to speed up the process.

## Deployment Steps

### Option 1: Auto-Deploy (Recommended)
1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "fix: Update Node.js version to 24.x for Vercel deployment"
   git push origin main
   ```

2. Vercel will automatically detect the push and start deployment

### Option 2: Manual Deploy via CLI
1. Install Vercel CLI (if not installed):
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

## Environment Variables
Make sure to add the following environment variables in your Vercel dashboard:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- Any other API keys or secrets your application needs

Go to: Project Settings → Environment Variables

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are listed in package.json
- Ensure environment variables are set correctly

### 404 Errors on Refresh
- The `vercel.json` rewrites configuration handles SPA routing
- All routes redirect to index.html for client-side routing

### Node Version Warning
- The `engines` field in package.json specifies Node 24.x
- Vercel will use this version automatically

## Local Testing
Before deploying, test your build locally:

```bash
# Install dependencies
npm install --prefix frontend --legacy-peer-deps

# Build the project
npm run build --prefix frontend

# Preview the build
cd frontend
npm run preview
```

## Post-Deployment Checklist
- ✅ Website loads correctly
- ✅ All routes work (no 404s on refresh)
- ✅ Images and assets load properly
- ✅ API calls work correctly
- ✅ Environment variables are active
- ✅ No console errors

## Support
If deployment fails:
1. Check Vercel deployment logs
2. Verify package.json has correct node version (24.x)
3. Ensure all dependencies are compatible
4. Check that frontend builds successfully locally
