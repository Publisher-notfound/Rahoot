# 🚀 ADHYAYAN Deployment Guide

## Quick Deploy for Tech Fest

### 1. Deploy Socket Server to Railway

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Choose "Deploy from subdirectory" and enter: `socket`
5. Railway will auto-detect Node.js and deploy
6. Copy your Railway domain (e.g., `your-app-name.railway.app`)

### 2. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project" → Import your repository
3. In "Environment Variables" add:
   ```
   NEXT_PUBLIC_WEBSOCKET_URL=https://your-railway-domain.railway.app/
   ```
4. Deploy!

### 3. Test Your Deployment

1. Visit your Vercel URL
2. Create a quiz room
3. Join with multiple browser tabs/devices
4. Verify real-time sync works

## Backup Plan: Render.com

If Railway doesn't work:
1. Use [render.com](https://render.com) (also free)
2. Deploy socket server as "Web Service"
3. Use same environment variable setup

## Emergency Local Demo

If deployment fails:
```bash
# Terminal 1
npm run socket

# Terminal 2  
npm run dev
```
Present from localhost with mobile hotspot for others to join.