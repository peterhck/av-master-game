# AV Master Authentication System Setup Guide

## Overview

The AV Master game now includes a complete authentication system with user registration, login, profile management, and session handling. This system integrates with Supabase for secure user management and provides a seamless experience for tracking user progress and AI interactions.

## Features

### 🔐 Authentication Features
- **User Registration**: Complete registration with email, password, and profile information
- **User Login**: Secure login with JWT token authentication
- **Profile Management**: Update user information and change passwords
- **Session Management**: Automatic token validation and session persistence
- **Logout**: Secure logout with token cleanup

### 📊 User Management
- **Role-Based Access**: Support for admin, instructor, student, and general user roles
- **Organization Support**: Track user organizations for institutional use
- **Activity Logging**: Comprehensive audit trail of user actions
- **User Preferences**: Personalized settings for each user

### 🎮 Game Integration
- **Progress Tracking**: Individual user progress across all levels
- **Game Sessions**: Persistent game state and achievements
- **AI Conversations**: User-specific AI chat history and preferences
- **API Usage Tracking**: Monitor and analyze user interactions with AI

## Database Setup

### 1. Run the Database Schema

Copy and paste the contents of `database/run_schema.sql` into your Supabase SQL editor and execute it. This will create:

- **Users table**: Core user information and authentication data
- **User sessions**: Session management and token tracking
- **Password reset tokens**: Secure password recovery
- **Email verification tokens**: Email verification system
- **User activity log**: Comprehensive audit trail
- **User preferences**: Personalized user settings
- **Game sessions**: Persistent game state
- **User progress**: Level completion tracking
- **AI conversations**: Chat history and context
- **AI messages**: Individual message tracking
- **API usage**: Usage analytics and monitoring

### 2. Verify Setup

After running the schema, you should see:
- All tables created successfully
- Default admin user created (Peter Lewis)
- Indexes and triggers configured
- Helper functions available

## Backend Setup

### 1. Dependencies

The authentication system requires these additional packages:

```bash
npm install bcryptjs jsonwebtoken
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Supabase Configuration (already configured)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. API Endpoints

The authentication system provides these endpoints:

#### Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "organization": "Example University",
  "role": "student"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "organization": "New University",
  "role": "instructor"
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <jwt-token>
```

## Frontend Integration

### 1. Authentication UI

The authentication UI is automatically integrated into the game header with:

- **Login/Register buttons** for unauthenticated users
- **User name display** and profile/logout buttons for authenticated users
- **Modal forms** for registration, login, and profile management
- **Real-time notifications** for success/error feedback

### 2. Authentication Manager

The `AuthManager` class provides:

```javascript
// Check authentication status
if (window.authManager.isUserAuthenticated()) {
    const user = window.authManager.getCurrentUser();
    console.log('User:', user.firstName, user.lastName);
}

// Get auth headers for API calls
const headers = window.authManager.getAuthHeaders();

// Manual authentication
const result = await window.authManager.login({
    email: 'user@example.com',
    password: 'password123'
});
```

### 3. Automatic Integration

The authentication system automatically:

- **Validates tokens** on page load
- **Updates UI** based on authentication status
- **Persists sessions** across browser sessions
- **Handles token expiration** gracefully

## User Roles and Permissions

### Available Roles

1. **admin**: Full system access, can view all users and data
2. **instructor**: Can manage students and view progress
3. **student**: Standard user with learning features
4. **user**: General user with basic access

### Role-Based Features

- **Admin**: User management, system analytics, full AI access
- **Instructor**: Student progress tracking, assignment management
- **Student**: Learning progress, AI tutor access, achievement tracking
- **User**: Basic game access, limited AI features

## Security Features

### 🔒 Security Measures

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **JWT Tokens**: Secure token-based authentication
3. **Row Level Security**: Database-level access control
4. **Input Validation**: Comprehensive request validation
5. **Rate Limiting**: API endpoint protection
6. **Activity Logging**: Complete audit trail
7. **Session Management**: Secure session handling

### 🛡️ Best Practices

- **Strong Passwords**: Minimum 8 characters required
- **Token Expiration**: 7-day token lifetime
- **Secure Headers**: CORS and security headers configured
- **Input Sanitization**: All user inputs validated and sanitized
- **Error Handling**: Secure error messages without information leakage

## Testing the System

### 1. Test Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "organization": "Test Org",
    "role": "student"
  }'
```

### 2. Test Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Profile Access

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Integration with AI System

### Enhanced AI Features

The authentication system enhances the AI tutor with:

1. **User-Specific Context**: AI remembers user preferences and history
2. **Progress-Aware Responses**: AI considers user's learning progress
3. **Personalized Recommendations**: Tailored suggestions based on role
4. **Usage Analytics**: Track AI interaction patterns
5. **Conversation History**: Persistent chat history per user

### AI Integration Points

```javascript
// AI system automatically uses authenticated user context
if (window.authManager.isUserAuthenticated()) {
    const user = window.authManager.getCurrentUser();
    // AI responses are personalized for this user
    await aiTutor.generateResponse(message, {
        userId: user.id,
        role: user.role,
        organization: user.organization
    });
}
```

## Monitoring and Analytics

### Available Metrics

1. **User Activity**: Login patterns, session duration
2. **Game Progress**: Level completion, scores, achievements
3. **AI Usage**: Conversation frequency, topic preferences
4. **API Performance**: Response times, error rates
5. **User Engagement**: Feature usage, retention metrics

### Database Queries

```sql
-- Active users in last 30 days
SELECT COUNT(DISTINCT user_id) FROM user_activity_log 
WHERE activity_type = 'login' 
AND created_at > NOW() - INTERVAL '30 days';

-- Most active AI users
SELECT u.first_name, u.last_name, COUNT(*) as ai_interactions
FROM ai_messages am
JOIN users u ON am.user_id = u.id
WHERE am.role = 'user'
GROUP BY u.id, u.first_name, u.last_name
ORDER BY ai_interactions DESC
LIMIT 10;

-- Game completion rates
SELECT 
    up.level_id,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completions,
    ROUND(COUNT(CASE WHEN up.status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate
FROM user_progress up
GROUP BY up.level_id
ORDER BY completion_rate DESC;
```

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure Supabase is properly configured
2. **JWT Secret**: Verify JWT_SECRET is set in environment variables
3. **CORS Issues**: Check CORS configuration for frontend domain
4. **Token Expiration**: Handle token refresh or re-authentication
5. **Password Requirements**: Ensure passwords meet minimum requirements

### Debug Commands

```bash
# Check backend health
curl http://localhost:3001/health

# Test database connection
curl http://localhost:3001/api/auth/profile

# Check authentication status
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/auth/profile
```

## Next Steps

### Future Enhancements

1. **Email Verification**: Implement email verification workflow
2. **Password Reset**: Add password reset functionality
3. **Social Login**: Integrate Google, GitHub, or Microsoft login
4. **Two-Factor Authentication**: Add 2FA for enhanced security
5. **Bulk User Import**: Support for institutional user onboarding
6. **Advanced Analytics**: Enhanced reporting and insights
7. **API Rate Limiting**: Per-user rate limiting for AI features

### Deployment Considerations

1. **Environment Variables**: Secure configuration management
2. **Database Backups**: Regular backup strategy
3. **Monitoring**: Application performance monitoring
4. **SSL/TLS**: Secure communication protocols
5. **CDN**: Content delivery for static assets

## Support

For issues or questions about the authentication system:

1. Check the browser console for error messages
2. Review the backend logs for detailed error information
3. Verify database schema is properly applied
4. Test individual API endpoints for functionality
5. Ensure all environment variables are correctly set

The authentication system is now fully integrated and ready for production use! 🚀
