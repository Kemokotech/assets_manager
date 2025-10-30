# Asset Management System - Setup Guide

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn
- Git

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and configure:
- Database credentials (PostgreSQL)
- JWT secret key
- Application URLs

### 3. Create Database

```bash
# Create PostgreSQL database
createdb asset_manager

# Or using psql
psql -U postgres
CREATE DATABASE asset_manager;
\q
```

### 4. Run Migrations

```bash
npm run migrate
```

This creates all tables and inserts default data including:
- Default admin user: `admin@company.com` / `admin123` (change password after first login)
- Default departments

### 5. Start Backend Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## Web Frontend Setup

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Web App

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Web app runs on `http://localhost:3000`

## Mobile App Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure API URL

Edit `mobile/src/services/api.ts` and set your backend URL:
```typescript
const API_URL = 'http://YOUR_IP:5000/api'; // Use your computer's IP address
```

### 3. Start Expo

```bash
npm start
```

Scan QR code with Expo Go app (iOS/Android) or run:
```bash
# Android
npm run android

# iOS
npm run ios
```

## Docker Deployment

### Quick Start

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Configure for Production

1. Edit `docker-compose.yml`:
   - Change all passwords
   - Update JWT_SECRET
   - Set appropriate URLs

2. Run migrations:
```bash
docker-compose exec backend npm run migrate
```

3. Access:
   - Web: http://localhost:3000
   - API: http://localhost:5000

## Default Credentials

**Admin Account:**
- Email: `admin@company.com`
- Password: `admin123`

**IMPORTANT:** Change this password immediately after first login!

## API Documentation

### Authentication Endpoints

```
POST /api/auth/register - Register new user
POST /api/auth/login - Login
POST /api/auth/refresh - Refresh token
GET  /api/auth/profile - Get current user
```

### Asset Endpoints

```
GET    /api/assets - List assets
POST   /api/assets - Create asset (Admin)
GET    /api/assets/:id - Get asset details
PUT    /api/assets/:id - Update asset (Admin)
DELETE /api/assets/:id - Delete asset (Admin)
GET    /api/assets/serial/:serial - Get by serial number
GET    /api/assets/:id/qrcode - Get QR code
```

### Department Endpoints

```
GET    /api/departments - List departments
POST   /api/departments - Create department (Admin)
GET    /api/departments/:id - Get department
PUT    /api/departments/:id - Update department (Admin)
DELETE /api/departments/:id - Delete department (Admin)
```

### Analytics Endpoints

```
GET /api/analytics/dashboard - Dashboard statistics
GET /api/analytics/assets - Asset statistics
GET /api/analytics/departments - Department statistics
GET /api/analytics/activity - Activity timeline
```

## Troubleshooting

### Database Connection Error

- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### Port Already in Use

- Backend (5000): `lsof -ti:5000 | xargs kill`
- Web (3000): `lsof -ti:3000 | xargs kill`

### CORS Errors

- Check `CORS_ORIGIN` in backend `.env`
- Ensure web app URL matches

### QR Scanning Not Working

- **Web**: Grant camera permissions in browser
- **Mobile**: Grant camera permissions in app settings

### Image Upload Fails

- Check `uploads/` directory exists and is writable
- Verify `MAX_FILE_SIZE` in `.env`

## Development Tips

### Hot Reload

- Backend: Uses `nodemon` for auto-restart
- Web: Next.js hot reload enabled
- Mobile: Expo Fast Refresh enabled

### Database Reset

```bash
cd backend
npm run migrate
```

### Clear Mobile Cache

```bash
cd mobile
npx expo start -c
```

## Production Checklist

- [ ] Change all default passwords
- [ ] Update JWT_SECRET
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure file upload limits
- [ ] Set up monitoring/logging
- [ ] Review security headers
- [ ] Test on mobile devices
- [ ] Deploy to cloud (AWS/Azure/GCP)

## Support

For issues and questions:
- Check logs: `docker-compose logs`
- Review API responses
- Verify environment variables

## License

MIT License - See LICENSE file for details
