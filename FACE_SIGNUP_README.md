# Face ID Sign-Up Implementation Guide

## Overview
A complete Face ID-based authentication system with sign-up functionality. Users can register by capturing their face image, which is encrypted with AES-256 and securely stored in Cloudinary.

## Features Implemented

### 1. **FaceSignUpPage Component** (`frontend/src/pages/FaceSignUpPage.jsx`)
   - Email input with validation
   - Optional password field
   - Live webcam preview for face capture
   - Face image capture with preview
   - Retake functionality
   - Secure upload to backend with encryption
   - Beautiful UI with status indicators (uploading, success, error)
   - Link to login page for existing users

### 2. **Backend Registration Endpoint** (Already exists)
   - `POST /api/auth/register`
   - Accepts: email, password (optional), face_image (file)
   - Encrypts face image with AES-256
   - Uploads encrypted data to Cloudinary
   - Stores face data reference in MongoDB

### 3. **Routes Added**
   - `/signup` - New user registration with Face ID
   - `/auth` - Existing user login (already had Face ID login)

## How It Works

### Sign-Up Flow:
1. User navigates to `/signup`
2. Enters email address (required)
3. Optionally enters password
4. Webcam activates showing live preview
5. User clicks "Capture Face" button
6. Image is captured and shown for review
7. User can "Retake" or "Confirm & Register"
8. On confirm:
   - Image is converted to blob
   - Sent to backend via FormData
   - Backend encrypts with AES-256
   - Uploads to Cloudinary
   - Stores reference in database
9. Success screen shows, then redirects to dashboard

### Login Flow (Already Existed):
1. User navigates to `/auth`
2. Selects "Face ID" tab
3. Webcam auto-captures after 2.5 seconds
4. Backend compares with stored encrypted faces
5. On match, user is authenticated

## Security Features

### Encryption
- **Algorithm**: AES-256 (Fernet)
- **Encryption Key**: Stored in environment variable `ENCRYPTION_KEY`
- **Process**: Face images are encrypted before upload to Cloudinary

### Cloudinary Storage
- Images stored as encrypted raw files
- Folder: `face_auth/encrypted_faces/`
- Format: `{user_id}_face.enc`
- Only accessible via backend API with decryption

### Database
- MongoDB stores:
  - User ID
  - Email
  - Cloudinary public_id (reference)
  - Hashed password (if provided)
- Face encodings for comparison
- No raw images in database

## Environment Variables Required

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Encryption Key (generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
ENCRYPTION_KEY=your_generated_key

# MongoDB
MONGO_URI=your_mongodb_uri

# Frontend API URL
VITE_API_URL=https://let-go-3-0.onrender.com
```

## Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

Required packages:
- `fastapi`
- `python-multipart` (for file uploads)
- `cloudinary`
- `cryptography`
- `pymongo`
- `face-recognition` (for face comparison)

**Frontend:**
```bash
cd frontend
npm install react-webcam
```

### 2. Configure Environment
Create `.env` file in `backend/` with the variables above.

### 3. Generate Encryption Key
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```
Copy output to `ENCRYPTION_KEY` in `.env`

### 4. Start Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 5. Start Frontend
```bash
cd frontend
npm run dev
```

### 6. Test the Flow
1. Navigate to `https://localhost:5173/signup`
2. Enter test email
3. Allow camera access
4. Capture face
5. Confirm registration
6. Check backend logs for encryption/upload confirmation

## API Endpoints

### Registration
```https
POST /api/auth/register
Content-Type: multipart/form-data

Fields:
- email: string (required)
- password: string (optional)
- face_image: file (required, JPEG)

Response:
{
  "success": true,
  "user_id": "abc123",
  "message": "User registered successfully"
}
```

### Face Login
```https
POST /api/auth/face-login
Content-Type: multipart/form-data

Fields:
- face_image: file (required, JPEG)

Response:
{
  "success": true,
  "user_id": "abc123",
  "email": "user@example.com",
  "message": "Authentication successful"
}
```

## User Navigation

### From Landing Page
- Click "Get Started" or "Login" → `/auth` (Login page)
- New users see "Sign Up with Face ID" link → `/signup`

### From Login Page
- Click "Sign Up with Face ID" → `/signup`

### From Sign-Up Page
- Click "Login here" → `/auth`

## UI Components

### Sign-Up Page Features:
- **Glass morphism design** matching app theme
- **Real-time webcam preview** with circular overlay
- **Status indicators**:
  - Idle: Shows "Capture Face" button
  - Captured: Shows preview with Retake/Confirm buttons
  - Uploading: Animated loader with encryption message
  - Success: Green checkmark with success message
  - Error: Red warning with retry button
- **Responsive design** for mobile and desktop
- **Dark mode support**

## Testing Checklist

- [ ] Camera permission request works
- [ ] Face capture produces clear image
- [ ] Email validation works
- [ ] Backend receives and encrypts image
- [ ] Cloudinary upload succeeds
- [ ] Database stores user record
- [ ] Success state shows and redirects
- [ ] Error handling for:
  - [ ] Camera access denied
  - [ ] Network failure
  - [ ] Duplicate email
  - [ ] Invalid image format
- [ ] Login with registered face works
- [ ] Navigation between login/signup works

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Use HTTPS or localhost (https may block camera)
- Verify `react-webcam` is installed

### Upload Fails
- Check Cloudinary credentials in `.env`
- Verify `ENCRYPTION_KEY` is set
- Check network/CORS settings

### Face Not Recognized After Sign-Up
- Ensure good lighting during capture
- Face should be centered and clearly visible
- Check backend logs for face encoding errors

## Future Enhancements
- [ ] Multiple face angles for better recognition
- [ ] Liveness detection (blink detection)
- [ ] 2FA with SMS/email verification
- [ ] Account recovery options
- [ ] Face data update/re-enrollment

## Files Modified/Created

### Created:
- `frontend/src/pages/FaceSignUpPage.jsx` - New sign-up page

### Modified:
- `frontend/src/App.jsx` - Added signup route and import
- `frontend/src/pages/AuthPage.jsx` - Added link to sign-up page

### Already Existing (No changes needed):
- `backend/auth/router.py` - Registration endpoint
- `backend/auth/service.py` - Face recognition logic
- `backend/auth/cloud_storage.py` - Cloudinary + encryption
- `backend/auth/db.py` - MongoDB connection

## Support
For issues or questions, check:
1. Backend logs for encryption/upload errors
2. Browser console for frontend errors
3. Cloudinary dashboard for uploaded files
4. MongoDB for user records
