# 🔧 Render Environment Variables Setup

## ⚠️ CRITICAL: Your deployment is failing because environment variables are not set!

Follow these steps to fix the issue:

---

## 🎯 Step-by-Step Instructions

### 1. Go to Render Dashboard
1. Open https://dashboard.render.com
2. Sign in to your account
3. Find and click on your **backend service** (e.g., "lets-go-3-backend")

### 2. Navigate to Environment Variables
1. In the left sidebar, click on **"Environment"**
2. Click the **"Add Environment Variable"** button

### 3. Add These Environment Variables

Copy and paste each variable name and value exactly as shown:

---

## 📋 REQUIRED Environment Variables

### **Supabase Configuration** (CRITICAL - App won't start without these!)

**Variable 1:**
```
SUPABASE_URL
```
**Value:**
```
https://vbtqlofjbuzxwskzybnl.supabase.co
```

**Variable 2:**
```
SUPABASE_KEY
```
**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidHFsb2ZqYnV6eHdza3p5Ym5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MzE4OTgsImV4cCI6MjA4NDUwNzg5OH0.475EDGSuhYFh8phHJvBs7SxuXdrSpu0tPF7UrDHodFc
```

---

### **Google Gemini API** (CRITICAL - Required for AI features!)

**Variable 3:**
```
GEMINI_API_KEY
```
**Value:**
```
YOUR_ACTUAL_GEMINI_API_KEY_HERE
```
🔑 **Get your API key from:** https://makersuite.google.com/app/apikey

---

## 📋 OPTIONAL Environment Variables (Add if you're using these features)

### **MongoDB** (Required for Face Authentication)
```
MONGODB_URI
```
**Value:** Your MongoDB connection string
```
mongodb+srv://username:password@cluster.mongodb.net/database_name
```

---

### **Cloudinary** (Required for Image Storage & Face Auth)
```
CLOUDINARY_CLOUD_NAME
```
**Value:** Your Cloudinary cloud name

```
CLOUDINARY_API_KEY
```
**Value:** Your Cloudinary API key

```
CLOUDINARY_API_SECRET
```
**Value:** Your Cloudinary API secret

---

### **Twilio** (Required for SMS/Call Features)
```
TWILIO_ACCOUNT_SID
```
**Value:** Your Twilio Account SID

```
TWILIO_AUTH_TOKEN
```
**Value:** Your Twilio Auth Token

```
TWILIO_PHONE_NUMBER
```
**Value:** Your Twilio phone number (e.g., +1234567890)

```
FARMER_PHONE_NUMBER
```
**Value:** Default farmer phone number (e.g., +919579649407)

---

### **CORS Configuration** (Required for Frontend)
```
ALLOWED_ORIGINS
```
**Value:** Comma-separated list of your frontend URLs
```
https://your-frontend.vercel.app,https://localhost:5173
```

---

### **Blockchain** (Optional - if using blockchain features)
```
BLOCKCHAIN_RPC_URL
```
**Value:** Your blockchain RPC URL (default: https://127.0.0.1:8545)

---

### **Satellite Data** (Optional - if using satellite features)
```
SENTINEL_CLIENT_ID
```
**Value:** Your Sentinel Hub client ID

```
SENTINEL_CLIENT_SECRET
```
**Value:** Your Sentinel Hub client secret

---

### **Encryption** (Optional but recommended for production)
```
ENCRYPTION_KEY
```
**Value:** A secure 32-character encryption key (auto-generated if not provided)

---

### **Subsidy Scraping** (Optional configuration)
```
SUBSIDY_SCRAPE_ENABLED
```
**Value:** `true` or `false` (default: true)

```
SUBSIDY_SCRAPE_TTL_MINUTES
```
**Value:** Number in minutes (default: 1440)

---

## 🚀 After Adding Variables

1. **Save** all the environment variables
2. Render will **automatically redeploy** your service
3. Wait 5-10 minutes for the deployment to complete
4. Check the **Logs** tab to verify deployment was successful

---

## ✅ Verify Deployment

Once deployment is complete, test these endpoints:

1. **Root endpoint:**
   ```
   https://your-backend-name.onrender.com/
   ```
   Should return: `{"message": "Hello from Let Go 3.0 - Farm Equipment Analyzer!"}`

2. **Health check:**
   ```
   https://your-backend-name.onrender.com/api/health
   ```
   Should return: `{"status": "healthy", "service": "sankaat-saathi-api"}`

---

## 🐛 Troubleshooting

### Problem: Still getting "supabase_url is required" error
**Solution:** 
- Double-check you spelled `SUPABASE_URL` correctly (all caps)
- Make sure there are no extra spaces in the variable name or value
- Click "Save" after adding variables
- Wait for automatic redeploy to complete

### Problem: Deployment keeps failing
**Solution:**
- Go to "Logs" tab in Render dashboard
- Look for the specific error message
- Make sure all REQUIRED variables are set

### Problem: "GEMINI_API_KEY not found" error
**Solution:**
- Add your actual Google Gemini API key
- Get it from: https://makersuite.google.com/app/apikey

---

## 📝 Quick Checklist

Before deployment, ensure you have:
- [ ] `SUPABASE_URL` - Set
- [ ] `SUPABASE_KEY` - Set
- [ ] `GEMINI_API_KEY` - Set with your actual API key
- [ ] `ALLOWED_ORIGINS` - Set with your frontend URL
- [ ] Other optional variables as needed for your features

---

## 🎉 Success!

Once all variables are set and deployment succeeds, your backend will be live at:
```
https://your-service-name.onrender.com
```

You can now use this URL in your frontend's `.env` file:
```
VITE_API_URL=https://your-service-name.onrender.com
```

---

## 🔒 Security Note

- Never commit your actual `.env` file to Git
- Use `.env.example` for documentation only
- Render stores environment variables securely
- Update keys regularly for production apps
