# Vercel Frontend Deployment Guide - Let's Go 3.0

## ⚠️ IMPORTANT: Current Issue
The error "npm install --prefix frontend --legacy-peer-deps exited with 254" happens because of incorrect path configuration in Vercel dashboard.

## 🎯 Complete Vercel Dashboard Configuration

### Step 1: Go to Your Vercel Project Settings
1. Login to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **Let_Go_3.0**
3. Go to **Settings** tab

### Step 2: Configure Build & Development Settings

Navigate to **Settings → General** and configure:

#### **Root Directory**
```
frontend
```
☝️ **CRITICAL**: Set this to `frontend` (the subdirectory containing your React app)

After setting this, Vercel will:
- Start builds from the `frontend/` directory
- Find `package.json` at `frontend/package.json` (not `frontend/frontend/package.json`)

#### **Framework Preset**
```
Vite
```

#### **Node.js Version**
```
20.x
```
(Matches the `engines` field in your `frontend/package.json`)

#### **Build Command**
```
npm run build
```
(No `--prefix` needed since Root Directory is already set to `frontend`)

#### **Output Directory**
```
dist
```
(Just `dist`, not `frontend/dist`, because we're already in the frontend directory)

#### **Install Command**
```
npm install --legacy-peer-deps
```
(No `--prefix` needed)

### Step 3: Environment Variables

Go to **Settings → Environment Variables** and add:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key | Production, Preview, Development |
| `VITE_API_BASE_URL` | Your Render backend URL | Production, Preview, Development |

Example:
```
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Delete vercel.json (Optional)

Since we're configuring everything in the dashboard, you can optionally remove `vercel.json` from the root, or keep it for routing only:

```json
{
    "rewrites": [
        {
            "source": "/(.*)",
            "destination": "/index.html"
        }
    ]
}
```

## 🚀 Deployment Steps

### Option A: Redeploy from Dashboard
1. Go to **Deployments** tab
2. Click on the **three dots** (⋯) next to latest deployment
3. Click **Redeploy**
4. Check **Use existing Build Cache** = OFF
5. Click **Redeploy**

### Option B: Trigger New Deployment
1. Make a small change to any file in your repo (or just trigger a redeploy)
2. Push to GitHub
3. Vercel will auto-deploy

## 📝 Verification Checklist

After deployment, verify:

- ✅ Build starts in the correct directory
- ✅ No "double frontend/frontend" path errors
- ✅ `npm install` completes successfully
- ✅ `npm run build` creates `dist` folder
- ✅ Site deploys to your Vercel URL

## 🔍 Troubleshooting

### If you still see path errors:

1. **Clear Vercel Cache**:
   - Settings → General → Clear Cache
   - Then redeploy

2. **Verify Root Directory**:
   - Must be set to `frontend` in dashboard
   - Not blank, not `./`, not `./frontend`

3. **Check Project Structure**:
   ```
   Let_Go_3.0/
   ├── backend/           # NOT deployed to Vercel
   ├── frontend/          # THIS is what Vercel should deploy
   │   ├── package.json
   │   ├── vite.config.js
   │   ├── src/
   │   └── dist/         # Created during build
   └── vercel.json
   ```

## 🎉 Expected Success Output

When successful, you should see:
```
✓ Installing dependencies...
✓ Running build command...
✓ Build completed successfully
✓ Deploying outputs...
✓ Deployment ready!
```

## 📱 Final URLs

- **Frontend (Vercel)**: `https://your-project.vercel.app`
- **Backend (Render)**: `https://your-backend.onrender.com`

---

**Last Updated**: 2026-01-25
