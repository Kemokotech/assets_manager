# Quick Deploy to Production (15 minutes)

## Fastest Path: Railway + Vercel + Expo

### Prerequisites
- GitHub account
- Email address
- Credit card (for Expo, but free for testing)

---

## Step 1: Push to GitHub (2 min)

```bash
cd "E:\OneDrive\Desktop\Asset manager"

# Initialize git if not already
git init
git add .
git commit -m "Production ready"

# Create repo on GitHub and push
git remote add origin https://github.com/yourusername/asset-manager.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend on Railway (5 min)

1. **Go to https://railway.app**
2. Click "Start a New Project"
3. Click "Deploy from GitHub repo"
4. **Authorize GitHub** and select your `asset-manager` repo
5. Click "Add Variables" and set:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key-minimum-32-characters-long
   JWT_REFRESH_SECRET=your-refresh-secret-also-32-chars
   UPLOAD_PATH=./uploads
   ```
6. Click "New" → "Database" → "Add PostgreSQL"
7. Wait 2-3 minutes for deployment
8. Click your backend service → "Settings" → Copy the public URL
   - Example: `https://asset-manager-production.up.railway.app`

✅ **Backend URL:** `________________________________`

---

## Step 3: Deploy Web App on Vercel (3 min)

1. **Go to https://vercel.com**
2. Click "Add New" → "Project"
3. **Import your GitHub repo**
4. **Root Directory:** `web`
5. Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app/api
   ```
   (Replace with your Railway URL from Step 2)
6. Click "Deploy"
7. Wait 2-3 minutes
8. Copy your web app URL
   - Example: `https://asset-manager.vercel.app`

✅ **Web App URL:** `________________________________`

---

## Step 4: Update Mobile App API URL (2 min)

Edit `mobile/src/services/api.ts`:

```typescript
const API_URL = 'https://your-railway-url.railway.app/api'; // ← Change this
const BASE_URL = 'https://your-railway-url.railway.app'; // ← And this
```

Save the file.

---

## Step 5: Build Mobile App (3 min)

```bash
cd mobile

# Install EAS CLI (first time only)
npm install -g eas-cli

# Login to Expo (create account if needed)
eas login

# Configure EAS (first time only)
eas build:configure

# Build Android APK
eas build --platform android --profile preview
```

Wait 5-10 minutes for build to complete.

✅ Download APK from the link provided and install on your Android phone.

---

## Step 6: Test Everything (5 min)

### Test Web App:
1. Go to your Vercel URL
2. Login with: `admin@company.com` / `admin123`
3. Create a test asset
4. Check if QR code generates

### Test Mobile App:
1. Install APK on phone
2. Login with same credentials
3. Scan the QR code you just created
4. Verify it shows asset details

---

## ✅ You're Live!

### Share With Users:

**Web App:** `https://your-app.vercel.app`

**Mobile App:** Send them the APK download link

**Login Credentials:**
- Email: `admin@company.com`
- Password: `admin123`
- ⚠️ **Change this password immediately after first login!**

---

## Costs

- **Railway:** Free tier (500 hours/month)
- **Vercel:** Free tier (unlimited)
- **Expo:** Free for preview builds
- **Total:** $0/month for testing and small teams

---

## Troubleshooting

### Backend not responding:
- Check Railway logs
- Verify DATABASE_URL is set
- Make sure backend service is running

### Web app can't connect:
- Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Must include `/api` at the end
- Must use Railway public URL, not internal

### Mobile app can't connect:
- Verify API_URL in `src/services/api.ts`
- Make sure you rebuilt after changing URL
- Check if backend is accessible from your phone

---

## Need Help?

1. Check Railway logs: Railway Dashboard → Service → Deployments
2. Check Vercel logs: Vercel Dashboard → Project → Deployments
3. Check EAS build logs: Run `eas build:list`

---

## Next Steps

1. **Change admin password**
2. **Add more users** (if needed)
3. **Create departments**
4. **Start adding assets**
5. **Monitor usage** (Railway and Vercel dashboards)

---

**Congratulations! Your Asset Manager is now in production! 🎉**
