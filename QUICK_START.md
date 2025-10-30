# Quick Start Guide - Asset Management System

Get up and running in 5 minutes! 🚀

## Prerequisites Check

```bash
node --version  # Should be v18 or higher
npm --version
psql --version  # PostgreSQL should be installed
```

If any are missing, install them first.

---

## Step 1: Install Dependencies (2 minutes)

```bash
# Navigate to project root
cd "e:\OneDrive\Desktop\Asset manager"

# Install backend dependencies
cd backend
npm install

# Install web dependencies
cd ../web
npm install

# (Optional) Install mobile dependencies
cd ../mobile
npm install
```

---

## Step 2: Setup Database (1 minute)

### Create Database
```bash
# Using psql
psql -U postgres
CREATE DATABASE asset_manager;
\q

# OR using createdb command
createdb -U postgres asset_manager
```

### Configure Environment
```bash
cd backend

# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

**Edit `.env` file** and update these lines:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asset_manager
DB_USER=postgres
DB_PASSWORD=your_actual_password
JWT_SECRET=change_this_to_something_random_and_secure
```

### Run Database Setup
```bash
# Still in backend directory
npm run setup
```

This will:
- Create all tables ✅
- Add indexes ✅
- Create default departments ✅
- Create admin user ✅

---

## Step 3: Setup Web Frontend (30 seconds)

```bash
cd ../web

# Windows
copy .env.local.example .env.local

# Linux/Mac
cp .env.local.example .env.local
```

No editing needed for local development!

---

## Step 4: Start Development Servers (30 seconds)

Open **3 terminal windows:**

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5000

### Terminal 2 - Web Frontend
```bash
cd web
npm run dev
```
✅ Web app running on http://localhost:3000

### Terminal 3 - Mobile (Optional)
```bash
cd mobile
npm start
```
Scan QR code with Expo Go app

---

## Step 5: Login and Test! 🎉

1. Open browser: http://localhost:3000
2. Login with:
   - **Email:** admin@company.com
   - **Password:** admin123
3. You're in! 🎊

### What you can do:
- View dashboard with analytics
- Create/manage assets
- Scan QR codes (web: use webcam, mobile: use phone camera)
- Manage departments
- View activity logs

---

## Troubleshooting

### "Cannot find module" errors?
**Fix:** Run `npm install` in that directory

### Database connection error?
**Fix:** 
1. Check PostgreSQL is running: `pg_ctl status`
2. Verify credentials in `.env`
3. Ensure database exists: `psql -l | grep asset_manager`

### Port already in use (5000 or 3000)?
**Fix:**
```bash
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Or change port in .env
PORT=5001
```

### "relation does not exist" error?
**Fix:** Run database setup again:
```bash
cd backend
npm run setup
```

---

## Docker Quick Start (Alternative)

If you prefer Docker:

```bash
# Make sure Docker Desktop is running

# Start everything
docker-compose up -d

# Setup database
docker-compose exec backend npm run setup

# Access:
# Web: http://localhost:3000
# API: http://localhost:5000
```

---

## Default Credentials

```
Email: admin@company.com
Password: admin123
```

⚠️ **IMPORTANT:** Change this password after first login!
Go to Profile → Change Password (not yet implemented - use database directly for now)

To change in database:
```sql
-- Login to psql
psql -U postgres -d asset_manager

-- Update password to 'newpassword123'
UPDATE users 
SET password = '$2a$10$k.EvJ9xvxmKCRZ5Z5Z5Z5eZfJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z'
WHERE email = 'admin@company.com';
```
(You'll need to generate proper bcrypt hash)

---

## Next Steps

✅ **You're all set!** Now you can:

1. **Explore the dashboard** - See asset statistics
2. **Add your first asset** - Click "Add Asset" button
3. **Generate QR code** - Automatically created for each asset
4. **Test QR scanning** - Use the "Scan QR" page
5. **Add departments** - Organize your assets
6. **Create users** - Add staff members (admin only)

### For Mobile App:
1. Install **Expo Go** app on your phone (iOS/Android)
2. Scan the QR code from Terminal 3
3. Login with same credentials
4. Scan asset QR codes with your phone camera!

---

## Common Tasks

### Add a new asset:
Web: Dashboard → Assets → Add Asset  
API: `POST http://localhost:5000/api/assets`

### View all assets:
Web: Dashboard → Assets  
API: `GET http://localhost:5000/api/assets`

### Scan QR code:
Web: Dashboard → Scan QR (use webcam)  
Mobile: Scan tab (use camera)

### View analytics:
Web: Dashboard (home page)  
API: `GET http://localhost:5000/api/analytics/dashboard`

---

## API Testing

Use any API client (Postman, Insomnia, curl):

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

### Get Assets (with token)
```bash
curl http://localhost:5000/api/assets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Getting Help

1. **Check logs** - Look at terminal output for errors
2. **Review PROJECT_REVIEW.md** - Comprehensive documentation
3. **Check SETUP.md** - Detailed setup instructions
4. **Health check** - Visit http://localhost:5000/health

---

## Stop Servers

```bash
# In each terminal window, press:
Ctrl + C

# For Docker:
docker-compose down
```

---

**Total Setup Time:** ~5 minutes  
**Difficulty:** Easy 😊

Enjoy your new Asset Management System! 🎉
