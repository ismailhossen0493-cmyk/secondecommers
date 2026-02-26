# KIN Store — Quick Setup Guide

## Step 1: MongoDB Atlas (Free)
1. https://mongodb.com/atlas → Free account
2. Create free cluster → Get connection string:
   `mongodb+srv://user:password@cluster.mongodb.net/`

## Step 2: Backend .env
Create `backend/.env` file:
```
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/kin_store
JWT_SECRET=any_long_random_string_here
JWT_EXPIRES_IN=30d
NODE_ENV=production
WHATSAPP_NUMBER=8801XXXXXXXXX
FRONTEND_URL=https://your-frontend.onrender.com
```

## Step 3: Frontend .env
Create `frontend/.env` file:
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_WHATSAPP_NUMBER=8801XXXXXXXXX
```

## Step 4: GitHub Upload
- Drag & Drop the entire folder to GitHub (see main README)

## Step 5: Render Deploy
### Backend:
- New Web Service → connect repo
- Root Directory: `backend`
- Build: `npm install`
- Start: `node server.js`
- Add environment variables from Step 2

### Frontend:
- New Static Site → connect repo
- Root Directory: `frontend`
- Build: `npm install && npm run build`
- Publish: `dist`
- Add environment variables from Step 3

## Step 6: Make yourself Super Admin
In MongoDB Atlas → Browse Collections → users collection
→ Find your user → Edit role: "customer" → "super_admin"
