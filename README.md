# Asset Management System

A comprehensive cross-platform asset management system with QR code scanning capabilities.

## 🏗️ Architecture

```
asset-manager/
├── backend/          # Node.js + Express + PostgreSQL
├── web/              # Next.js Web Dashboard
├── mobile/           # React Native (Expo) Mobile App
└── docker/           # Docker configuration
```

## 💻 Tech Stack

- **Backend**: Node.js, Express.js, PostgreSQL, JWT
- **Web Frontend**: Next.js, React, TailwindCSS, shadcn/ui
- **Mobile**: React Native, Expo
- **Cloud Storage**: Firebase Storage / AWS S3
- **QR Code**: qrcode (generation), html5-qrcode (web scanning), expo-barcode-scanner (mobile)
- **Charts**: Recharts

## ⚙️ Features

### 1. Asset Registration
- Add assets with name, serial number, department, location, status
- Automatic QR code generation with unique asset URL
- Live photo capture or file upload
- Cloud storage integration

### 2. QR Code Scanning
- Real-time QR scanning on web (webcam) and mobile (camera)
- Instant asset lookup and display
- Registration prompt for unrecognized QR codes

### 3. Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Staff)
- Secure password hashing with bcrypt

### 4. Analytics Dashboard
- Total assets overview
- Assets by department and status
- Visual charts and graphs
- Export capabilities (CSV/PDF)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure database in .env
npm run migrate
npm run dev
```

### Web Frontend Setup
```bash
cd web
npm install
cp .env.local.example .env.local
npm run dev
```

### Mobile App Setup
```bash
cd mobile
npm install
npx expo start
```

## 📦 Database Schema

### Users
- id, name, email, password, role, created_at

### Assets
- id, name, serial_number, department, location, status, purchase_date, image_url, qr_code_path, created_at, updated_at

### Departments
- id, name, description

### Activity Log
- id, user_id, asset_id, action, timestamp

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create asset
- `GET /api/assets/:id` - Get asset details
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `GET /api/assets/qr/:id` - Get QR code

### Departments
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats

## 📖 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Status](#project-status)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Documentation](#documentation)
- [License](#license)

## 🎯 Project Status

**Version:** 1.0.0  
**Status:** ✅ Production-Ready (with configuration)  
**Completion:** 100% ✅  

✅ **Completed:**
- Backend API (Node.js + Express + PostgreSQL)
- Web Dashboard (Next.js + React + TypeScript)
- Mobile App (React Native + Expo)
- Authentication & Authorization
- QR Code Generation & Scanning
- File Upload System
- Analytics Dashboard
- Docker Configuration
- Comprehensive Documentation

⚠️ **Before Production:**
- Install dependencies (`npm install`)
- Configure environment variables
- Run database setup (`npm run setup`)
- Change default admin password
- Set strong JWT_SECRET
- Configure HTTPS/SSL

📚 **Documentation:**
- [QUICK_START.md](./QUICK_START.md) - Get running in 5 minutes
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [PROJECT_REVIEW.md](./PROJECT_REVIEW.md) - Comprehensive code review
- [ISSUES_FIXED.md](./ISSUES_FIXED.md) - Latest fixes and updates

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

## 📝 Environment Variables

See `.env.example` files in each directory.

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Web
cd web
npm test
```

## 📄 License

MIT

## 👥 Contributors

Your Team
