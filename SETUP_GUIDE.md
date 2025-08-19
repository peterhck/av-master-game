# AV Master Game - Backend Setup Guide

## 🚀 Quick Start

The AV Master Game now includes a complete backend system with:
- **OpenAI Integration** for AI chat and voice responses
- **Supabase Database** for user management and data persistence
- **Real-time Voice Chat** using Socket.IO
- **Secure Authentication** with JWT tokens

## 📋 Prerequisites

1. **Node.js** (version 18 or higher, 20+ recommended)
2. **Python 3** (for frontend server)
3. **Supabase Account** (free tier available)
4. **OpenAI API Key** (for AI features)

## 🔧 Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `env.example` to `.env` and configure:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:8001
```

### 3. Set Up Supabase Database
1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
3. Copy your project URL and keys to the `.env` file

### 4. Start Backend Server
```bash
cd backend
npm start
```

The backend will be available at: http://localhost:3001

## 🌐 Frontend Setup

### 1. Start Frontend Server
```bash
# From project root
python3 -m http.server 8001
```

The frontend will be available at: http://localhost:8001

## 🧪 Testing the System

### 1. Backend Health Check
```bash
curl http://localhost:3001/health
```

### 2. Test AI Integration
1. Open http://localhost:8001 in your browser
2. Click the AI Tutor toggle button (🤖) in the top menu
3. Try asking questions about AV equipment
4. Test voice interaction by clicking the microphone button

### 3. Test Game Features
1. Complete a level (e.g., Audio Level 1)
2. Test the "Test Setup" challenge after winning
3. Verify AI tutor provides equipment-specific help

## 🔐 Authentication Flow

The system uses JWT tokens for secure API access:

1. **User Registration**: `/api/auth/signup`
2. **User Login**: `/api/auth/login`
3. **Token Refresh**: `/api/auth/refresh`
4. **Protected Routes**: All AI and game endpoints require valid JWT

## 📊 Database Schema

The database includes tables for:
- **Users**: User profiles and authentication
- **Game Sessions**: Active game sessions
- **User Progress**: Level completion and scores
- **AI Conversations**: Chat history and context
- **Voice Sessions**: Voice interaction tracking
- **Equipment Interactions**: Equipment usage analytics
- **API Usage**: OpenAI API cost tracking

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### AI Services
- `POST /api/ai/conversation/start` - Start new conversation
- `POST /api/ai/chat` - Send message to AI
- `POST /api/ai/voice` - Process voice message
- `GET /api/ai/conversation/:id` - Get conversation history

### Game Management
- `POST /api/game/session/start` - Start game session
- `PUT /api/game/session/:id` - Update session
- `POST /api/game/progress` - Save level progress

### Voice Services
- `POST /api/voice/transcribe` - Transcribe audio
- `POST /api/voice/synthesize` - Text-to-speech

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
The frontend is served statically, so any changes to HTML/CSS/JS files will be reflected immediately.

### Database Development
- Use Supabase dashboard for database management
- SQL schema is in `database/schema.sql`
- Row Level Security (RLS) is enabled for all tables

## 🔍 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check Node.js version (18+ required)
   - Verify all environment variables are set
   - Check Supabase connection

2. **AI features not working**
   - Verify OpenAI API key is valid
   - Check API usage limits
   - Ensure backend is running on port 3001

3. **Authentication errors**
   - Verify JWT_SECRET is set
   - Check Supabase auth configuration
   - Ensure CORS settings are correct

4. **Database connection issues**
   - Verify Supabase URL and keys
   - Check if schema has been applied
   - Ensure RLS policies are configured

### Logs
- Backend logs are in `backend/logs/`
- Use `LOG_LEVEL=debug` for detailed logging
- Check browser console for frontend errors

## 🚀 Production Deployment

For production deployment:

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure proper CORS origins

2. **Database**
   - Use production Supabase project
   - Enable database backups
   - Monitor API usage

3. **Security**
   - Enable rate limiting
   - Use HTTPS
   - Implement proper error handling

4. **Monitoring**
   - Set up logging aggregation
   - Monitor API usage and costs
   - Track user engagement metrics

## 📚 API Documentation

For detailed API documentation, see the individual route files in `backend/routes/`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
