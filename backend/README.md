# AV Master Game Backend API

A secure Node.js backend API for the AV Master educational game, featuring OpenAI integration, real-time voice chat, and comprehensive user management.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with Supabase Auth
- **OpenAI Integration**: GPT-4o chat and Whisper voice transcription
- **Real-time Communication**: Socket.IO for live voice chat
- **Game Progress Tracking**: Comprehensive session and progress management
- **User Analytics**: Detailed usage statistics and achievements
- **Database**: PostgreSQL with Supabase (Row Level Security)
- **API Security**: Rate limiting, input validation, and error handling

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account and project
- OpenAI API key
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
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

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # CORS Configuration
   CORS_ORIGIN=http://localhost:8001

   # Logging
   LOG_LEVEL=info

   # Security
   BCRYPT_ROUNDS=12
   ```

4. **Set up Supabase Database**
   - Create a new Supabase project
   - Run the SQL schema from `../database/schema.sql` in your Supabase SQL editor
   - Copy your project URL and API keys to the `.env` file

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🗄️ Database Schema

The backend uses the following main tables:

- **users**: User profiles and authentication
- **game_sessions**: Active game sessions
- **user_progress**: Level completion and scores
- **ai_conversations**: AI chat sessions
- **ai_messages**: Individual chat messages
- **voice_sessions**: Voice interaction sessions
- **equipment_interactions**: Equipment usage tracking
- **user_achievements**: Achievement system
- **api_usage**: OpenAI API usage tracking
- **user_settings**: User preferences

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - User registration
- `POST /login` - User login
- `POST /refresh` - Refresh JWT token
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### AI Services (`/api/ai`)
- `POST /conversation/start` - Start AI conversation
- `POST /chat` - Send message to AI
- `POST /voice` - Process voice message
- `GET /conversation/:id` - Get conversation history
- `PUT /conversation/:id/end` - End conversation

### Game Management (`/api/game`)
- `POST /session/start` - Start game session
- `PUT /session/:id` - Update game session
- `PUT /session/:id/end` - End game session
- `POST /progress` - Save level progress
- `GET /progress` - Get user progress
- `GET /session/active` - Get active session
- `POST /equipment/interaction` - Track equipment usage

### Voice Services (`/api/voice`)
- `POST /session/start` - Start voice session
- `PUT /session/:id` - Update voice session
- `PUT /session/:id/end` - End voice session
- `GET /session/active` - Get active voice session
- `GET /sessions` - Get voice session history

### User Management (`/api/user`)
- `GET /settings` - Get user settings
- `PUT /settings` - Update user settings
- `GET /achievements` - Get user achievements
- `POST /achievements` - Award achievement
- `GET /api-usage` - Get API usage statistics
- `GET /stats` - Get user statistics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Row Level Security**: Database-level access control
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin request security
- **Helmet**: Security headers middleware
- **Error Handling**: Secure error responses

## 🤖 OpenAI Integration

The backend integrates with OpenAI's API for:

- **Chat Completions**: GPT-4o for intelligent responses
- **Voice Transcription**: Whisper for speech-to-text
- **Cost Tracking**: Automatic usage and cost monitoring
- **Context Awareness**: Equipment-specific responses

### System Prompt
The AI is configured with an AV-specific system prompt that includes:
- Professional audio-visual equipment knowledge
- Live event production expertise
- Troubleshooting guidance
- Educational content delivery

## 📊 Real-time Features

### Socket.IO Events
- `join-user-room` - Join user-specific room
- `voice-message` - Process voice messages
- `ai-message` - Handle AI chat messages

### Voice Processing
- Real-time audio streaming
- Automatic transcription
- Response generation
- Session management

## 📈 Analytics & Monitoring

### Usage Tracking
- API call monitoring
- Token usage statistics
- Cost tracking
- Performance metrics

### User Analytics
- Game progress tracking
- Session duration
- Achievement system
- Equipment interaction patterns

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Logging

The application uses Winston for structured logging:
- File-based logging (error and combined logs)
- Console logging in development
- Request/response logging
- Error tracking

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production.

### Database Migration
Run the SQL schema in your production Supabase instance.

### Process Management
Use PM2 or similar for production process management:
```bash
npm install -g pm2
pm2 start server.js --name "av-master-backend"
```

## 🔧 Development

### Code Structure
```
backend/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── utils/           # Utility functions
├── logs/            # Application logs
├── server.js        # Main server file
└── package.json     # Dependencies
```

### Adding New Routes
1. Create route file in `routes/`
2. Add validation using `express-validator`
3. Implement error handling
4. Add to main server file
5. Update documentation

## 📞 Support

For issues and questions:
1. Check the logs in `logs/` directory
2. Verify environment variables
3. Test database connectivity
4. Review API documentation

## 📄 License

MIT License - see LICENSE file for details.
