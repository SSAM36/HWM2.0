# 🔧 Render Memory & Deployment Fixes

## 🔴 Problems Identified

### 1. **Out of Memory Error**
```
==> Out of memory (used over 512Mi)
```
Your app is using MORE than 512MB RAM (Free tier limit).

**Why?**
- TensorFlow CPU (200-300MB) is loading at startup
- 4 Gunicorn workers = 4x memory usage
- All AI models loading simultaneously

### 2. **Deprecated Google AI Package**
```
google.generativeai package has ended
Please switch to google.genai
```

### 3. **No Open Ports Detected**
Gunicorn might not be binding to the correct port.

---

## ✅ **Solutions (Choose One)**

### **Option A: Fix Memory Issues (Keep Free Tier) - RECOMMENDED**

This keeps you on the free tier by optimizing memory usage.

#### **Step 1: Reduce Gunicorn Workers**

Update your `Procfile`:

**Current:**
```
web: gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

**Replace with:**
```
web: gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120 --preload
```

**Changes:**
- `--workers 4` → `--workers 1` (Reduces memory by 75%)
- `--timeout 120` (Increases timeout for slow AI operations)
- `--preload` (Loads app before forking workers)

#### **Step 2: Make TensorFlow Loading Lazy**

The TensorFlow model is loading at startup (line 219 in `model_service.py`). We need to make it load ONLY when needed.

I'll fix this for you...

#### **Step 3: Update Python Version in runtime.txt**

**Current:** `python-3.11.0`
**Issue:** Render is using Python 3.13.4 (newer, might have compatibility issues)

Update to:
```
python-3.11.9
```

---

### **Option B: Upgrade to Paid Tier - EASIEST**

Upgrade to **Starter Plan ($7/month)**:
- ✅ 512MB → 2GB RAM
- ✅ No cold starts
- ✅ Always-on instances
- ✅ Better performance

**How to upgrade:**
1. Go to Render Dashboard
2. Click your service
3. Click "Settings" → "Instance Type"
4. Select "Starter" → Save

---

## 🔨 **Implementing Option A (Free Tier Optimization)**

### **Fix 1: Update Procfile**

In your **Render Dashboard**:
1. Go to your service
2. Click "Settings"
3. Find "Start Command"
4. Replace with:
```bash
gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120 --preload
```
5. Click "Save Changes"

OR update the Procfile in your code and push to Git.

---

### **Fix 2: Lazy Load TensorFlow Model**

The issue is in `feature2/model_service.py` line 219:
```python
# Initialize on import
load_model()  # ← This loads TensorFlow immediately!
```

**Solution:** Only load when first prediction is made.

---

### **Fix 3: Fix Deprecated google.generativeai**

Update `equipment_analyzer.py` and other files using the old package.

**Old (Deprecated):**
```python
import google.generativeai as genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
model = genai.GenerativeModel('gemini-2.0-flash-exp')
```

**New (Current):**
```python
from google import genai
from google.genai.types import GenerateContentConfig

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))
```

---

### **Fix 4: Update requirements.txt**

**Replace:**
```
google-generativeai
```

**With:**
```
google-genai>=1.0.0
```

---

## 🚀 **Quick Implementation Steps**

I'll now implement these fixes for you:

1. ✅ Update `Procfile` to use 1 worker
2. ✅ Make TensorFlow loading lazy
3. ✅ Migrate from `google.generativeai` to `google.genai`
4. ✅ Update `requirements.txt`
5. ✅ Update `runtime.txt`

After these changes:
- Push to Git
- Render will auto-deploy
- Memory usage will drop significantly
- Free tier should work!

---

## 📊 **Expected Results**

### Before Fixes:
- Memory: ~600MB+ (crashes)
- Workers: 4 (multiplying memory)
- Startup: Loads TensorFlow immediately

### After Fixes:
- Memory: ~200-350MB (within free tier)
- Workers: 1 (optimized for free tier)
- Startup: Fast, TensorFlow loads on-demand

---

## 🐛 **If Still Having Issues**

### Memory still too high?
**Option 1:** Remove unused dependencies
```bash
# Remove if not using:
- tensorflow-cpu (if you can use mock predictions)
- opencv-python-headless
- scikit-learn (if not used)
```

**Option 2:** Use environment variable to disable TensorFlow
```python
ENABLE_ML_MODELS=false
```

### Port binding issues?
Add this to your environment variables:
```
PORT=10000
```

---

## 💰 **Cost Comparison**

### Free Tier (After Optimization):
- Cost: $0
- RAM: 512MB
- Workers: 1
- Cold starts: Yes (30 seconds)
- Good for: Testing, low traffic

### Starter Tier:
- Cost: $7/month
- RAM: 2GB (4x more)
- Workers: 2-4 (better performance)
- Cold starts: No
- Good for: Production, real users

---

## ✅ **Recommendation**

1. **Try Option A first** (free tier optimization)
2. **If it works:** Great! Save $7/month
3. **If it still crashes:** Upgrade to Starter ($7/month)

For a production app with real users, **Starter tier is worth it** for reliability.

---

Let me implement these fixes now!
