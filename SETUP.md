# Enterprise Employee Management & AI Attendance System - Setup Guide

## Prerequisites
- Node.js 18+
- Git

## Quick Setup

### 1. Backend Setup
```bash
cd backend
npm install
copy .env.example .env
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run download-models
npm run dev
```

The `download-models` script automatically downloads face-api.js models to `public/models/`.

## Manual Model Download (Alternative)

If automatic download fails, manually download these files to `frontend/public/models/`:

From: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Required files:
- tiny_face_detector_model-weights_manifest.json
- tiny_face_detector_model-shard1
- face_landmark_68_model-weights_manifest.json
- face_landmark_68_model-shard1
- face_recognition_model-weights_manifest.json
- face_recognition_model-shard1
- face_recognition_model-shard2

## Configuration

Edit `backend/.env`:
```
JWT_SECRET=your_secure_jwt_secret_key
PORT=5000
OFFICE_START_TIME=10:00
```

## Create Admin Account

Using PowerShell:
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/auth/register -Method Post -ContentType "application/json" -Body '{"email":"admin@company.com","password":"admin123","name":"Admin User"}'
```

Using curl:
```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"admin@company.com\",\"password\":\"admin123\",\"name\":\"Admin User\"}"
```

## Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Login: admin@company.com / admin123

## Features

✅ Admin Login with JWT Authentication
✅ Employee Management (CRUD)
✅ Face Registration using face-api.js
✅ Real-time Face Recognition Attendance
✅ Automatic Absent Marking
✅ Late Attendance Detection
✅ Dashboard with Statistics
✅ Analytics with Charts
✅ Reports (CSV Export)
✅ Department-wise Tracking
✅ Modern Glassmorphism UI
✅ Smooth Animations
✅ Responsive Design

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion, face-api.js
- **Backend**: Node.js, Express.js, SQLite
- **Face Recognition**: face-api.js (TensorFlow.js)
- **Authentication**: JWT

## Configuration

- Office Start Time: 10:00 AM (configurable in .env)
- Face Recognition Threshold: 0.6
- Absent Automation: Daily at 11:59 PM

## Troubleshooting

### Models not loading
- Ensure models are in `frontend/public/models/`
- Check browser console for errors
- Try manual download if automatic fails

### Port already in use
- Change PORT in `backend/.env`
- Change port in `frontend/vite.config.js`

### Database issues
- Delete `backend/data/ems.db` to reset
- Restart backend server

## Security

- JWT token expiry: 24 hours
- Password hashing with bcrypt
- Protected API routes
- Input validation
- CORS enabled
