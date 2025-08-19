# AV Master Game - Separated Frontend/Backend Deployment

This guide explains how to deploy the AV Master Game with separated frontend and backend services.

## Architecture Overview

- **Frontend**: Static HTML/CSS/JS served on port 8001
- **Backend**: Node.js API server on port 3001
- **Nginx**: Reverse proxy (optional)

## Local Development

### Start Both Services
```bash
npm start
```

### Start Frontend Only
```bash
npm run start:frontend
```

### Start Backend Only
```bash
npm run start:backend
```

## Production Deployment

### Option 1: Railway (Recommended)

#### Backend Deployment
1. Deploy the backend to Railway
2. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `JWT_SECRET`

#### Frontend Deployment
1. Deploy the frontend to Railway or Vercel
2. Set environment variable:
   - `BACKEND_URL` = Your backend Railway URL

### Option 2: Docker Compose

```bash
docker-compose up -d
```

This will start:
- Frontend on http://localhost:8001
- Backend on http://localhost:3001
- Nginx on http://localhost:80

### Option 3: Separate Hosting

#### Frontend (Vercel/Netlify)
1. Deploy frontend files
2. Set `BACKEND_URL` environment variable

#### Backend (Railway/Heroku)
1. Deploy backend code
2. Set all required environment variables

## Environment Variables

### Frontend
- `BACKEND_URL`: URL of the backend API server

### Backend
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `OPENAI_API_KEY`: OpenAI API key
- `JWT_SECRET`: JWT signing secret

## Configuration

The frontend uses `config.js` to manage backend URLs and feature flags. Update this file for different environments.

## Health Checks

- Frontend: `http://localhost:8001/`
- Backend: `http://localhost:3001/health`

## Troubleshooting

1. **Frontend can't connect to backend**: Check `BACKEND_URL` in config
2. **CORS errors**: Ensure backend CORS is configured for frontend domain
3. **API errors**: Check backend environment variables and logs
