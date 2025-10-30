# Asset Manager - Production Deployment Guide

## Overview
This guide covers deploying the Asset Manager application to production, including:
- Backend API (Node.js + PostgreSQL)
- Web Frontend (Next.js)
- Mobile App (React Native / Expo)

---

## 1. Backend Deployment

### Option A: Railway (Recommended - Easy & Free Tier)

#### Steps:
1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account and select the Asset Manager repo

3. **Add PostgreSQL Database**
   - In your project, click "New" → "Database" → "Add PostgreSQL"
   - Railway automatically creates the database and sets environment variables

4. **Configure Backend Service**
   - Click "New" → "GitHub Repo" → Select your repo
   - Set root directory: `/backend`
   - Railway will auto-detect Node.js

5. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too
   UPLOAD_PATH=./uploads
   ```

6. **Deploy**
   - Railway will automatically deploy
   - Get your backend URL: `https://your-app.up.railway.app`

---

### Option B: Render (Alternative)

1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Set:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add PostgreSQL database from Render dashboard
6. Set environment variables (same as above)

---

### Option C: DigitalOcean / AWS / VPS

1. **Provision Server**
   - Ubuntu 22.04 LTS
   - At least 1GB RAM

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm postgresql nginx
   ```

3. **Setup PostgreSQL**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE asset_manager;
   CREATE USER asset_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE asset_manager TO asset_user;
   \q
   ```

4. **Deploy Backend**
   ```bash
   cd /var/www
   git clone your-repo.git asset-manager
   cd asset-manager/backend
   npm install --production
   ```

5. **Setup PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "asset-api" -- start
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /uploads {
           alias /var/www/asset-manager/backend/uploads;
       }
   }
   ```

7. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

## 2. Web Frontend Deployment

### Option A: Vercel (Recommended - Optimized for Next.js)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd web
   vercel
   ```

3. **Configure Environment Variables** (in Vercel dashboard)
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   ```

4. **Set Root Directory**
   - In Vercel project settings, set root directory to `web`

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

### Option B: Netlify

1. Go to https://netlify.com
2. Click "Add new site" → "Import existing project"
3. Connect GitHub repo
4. Settings:
   - Base directory: `web`
   - Build command: `npm run build`
   - Publish directory: `web/.next`
5. Add environment variables in Netlify dashboard
6. Deploy

---

## 3. Mobile App Deployment

### For Testing (Development Build)

**Create EAS Build** (Expo Application Services)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   cd mobile
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

4. **Update API URL in `mobile/src/services/api.ts`**
   ```typescript
   const API_URL = 'https://your-production-api.com/api';
   ```

5. **Build for Android**
   ```bash
   eas build --platform android --profile preview
   ```

6. **Build for iOS** (requires Apple Developer account)
   ```bash
   eas build --platform ios --profile preview
   ```

7. **Download APK and share with testers**

---

### For Production (App Stores)

#### Android (Google Play Store)

1. **Build Release APK/AAB**
   ```bash
   eas build --platform android --profile production
   ```

2. **Google Play Console**
   - Go to https://play.google.com/console
   - Create new app
   - Fill in app details, screenshots, descriptions
   - Upload AAB file
   - Submit for review

#### iOS (Apple App Store)

1. **Apple Developer Account** ($99/year required)

2. **Build for iOS**
   ```bash
   eas build --platform ios --profile production
   ```

3. **App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Create new app
   - Upload build using Transporter app
   - Fill in app metadata
   - Submit for review

---

## 4. Database Migration

### Export from Development
```bash
pg_dump -h localhost -U postgres -d asset_manager > backup.sql
```

### Import to Production
```bash
psql -h production-host -U production-user -d production-db < backup.sql
```

---

## 5. Environment Variables Summary

### Backend (.env)
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-256-bits-minimum
JWT_REFRESH_SECRET=your-super-secret-refresh-key-256-bits
UPLOAD_PATH=./uploads
APP_URL=https://your-web-app.com
```

### Web (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
```

### Mobile (src/services/api.ts)
```typescript
const API_URL = 'https://your-backend-api.com/api';
```

---

## 6. Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (minimum 256 bits)
- [ ] Enable HTTPS/SSL for all services
- [ ] Set up CORS properly (only allow your frontend domains)
- [ ] Enable rate limiting on API
- [ ] Set up database backups
- [ ] Use environment variables (never commit secrets)
- [ ] Enable API authentication for all routes
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure file upload limits
- [ ] Set proper file permissions on server

---

## 7. Post-Deployment

### Update CORS in Backend

Edit `backend/src/middleware/cors.js` or add to `backend/src/index.js`:

```javascript
app.use(cors({
  origin: [
    'https://your-web-app.com',
    'https://your-web-app.vercel.app'
  ],
  credentials: true
}));
```

### Test Everything

1. **Backend API**
   - Test all endpoints with Postman
   - Verify authentication works
   - Check file uploads

2. **Web App**
   - Test login/logout
   - Create/edit/delete assets
   - QR code generation
   - Scanner functionality

3. **Mobile App**
   - Install on test devices
   - Test all features
   - Check camera permissions
   - Verify QR scanning

---

## 8. Monitoring & Maintenance

### Recommended Tools

- **Uptime Monitoring**: UptimeRobot (free)
- **Error Tracking**: Sentry (free tier)
- **Analytics**: Google Analytics or Plausible
- **Database Backups**: Automated daily backups
- **Log Management**: Railway/Render built-in logs

---

## 9. Cost Estimate

### Free Tier (Good for small teams)
- **Backend**: Railway/Render Free Tier
- **Database**: Railway PostgreSQL (512MB free)
- **Web**: Vercel Free Tier
- **Mobile**: Expo Go (development)
- **Total**: $0/month

### Production (Recommended)
- **Backend**: Railway Hobby ($5/month)
- **Database**: Railway Pro ($10/month)
- **Web**: Vercel Pro ($20/month) or Free tier
- **Mobile**: EAS Build ($29/month for app store builds)
- **Total**: ~$35-65/month

### Enterprise
- **Backend**: DigitalOcean Droplet ($12-24/month)
- **Database**: Managed PostgreSQL ($15-50/month)
- **Web**: Vercel/Netlify ($20-40/month)
- **Mobile**: EAS Production ($99/month)
- **Apple Developer**: $99/year
- **Google Play Developer**: $25 one-time
- **Total**: ~$60-150/month + one-time fees

---

## Quick Start (Railway + Vercel)

### 1. Backend (5 minutes)
```bash
# Push to GitHub
git add .
git commit -m "Production ready"
git push

# Deploy on Railway
# - Sign up at railway.app
# - New Project → Deploy from GitHub
# - Add PostgreSQL
# - Set environment variables
```

### 2. Web (3 minutes)
```bash
cd web
vercel
# Follow prompts
# Set NEXT_PUBLIC_API_URL in Vercel dashboard
```

### 3. Mobile (10 minutes)
```bash
cd mobile
# Update API_URL in src/services/api.ts
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

---

## Support

For issues or questions:
1. Check Railway/Vercel logs
2. Review error messages
3. Test API endpoints directly
4. Verify environment variables are set correctly

---

**Ready to deploy? Follow the steps above and your app will be live!** 🚀
