# Enterprise Employee Management & AI Attendance System

Production-ready Employee Management System with browser-based facial recognition.

## Features

### Admin Dashboard
- Real-time statistics
- Employee count and status
- Attendance percentage

### Employee Management
- Add/Edit/Delete employees
- Face registration via webcam
- Department organization
- Search and filter

### AI Face Recognition Attendance
- Browser-based face detection (face-api.js)
- Real-time recognition
- Confidence score tracking
- Automatic absent marking
- Late attendance detection

### Reports & Analytics
- Daily/Weekly/Monthly reports
- CSV export
- Department analytics
- Employee attendance trends
- Visual charts

### Security
- JWT authentication
- Protected routes
- Password hashing
- Input validation

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion, face-api.js
- **Backend**: Node.js, Express.js, SQLite
- **Face Recognition**: face-api.js with TensorFlow.js
- **Authentication**: JWT with bcryptjs

## Quick Start

### Backend
```bash
cd backend
npm install
copy .env.example .env
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run download-models
npm run dev
```

See [SETUP.md](SETUP.md) for detailed instructions.

## Project Structure

```
EMS_v2/
├── backend/           # Node.js Express API
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── database/     # SQLite setup
│   └── services/     # Business logic
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── context/
│   └── public/
│       └── models/   # face-api.js models
└── docker-compose.yml
```

## License

MIT
