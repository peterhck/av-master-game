# 🔧 Authentication System Setup - Quick Fix

## The Issue
You're getting the error `ERROR: 42703: column "role" does not exist` because the existing database schema doesn't have the columns needed for the authentication system.

## ✅ Quick Solution

### Step 1: Run the Migration Script
Copy and paste the contents of `database/migration_auth.sql` into your **Supabase SQL Editor** and execute it.

This script will:
- ✅ Add missing columns to the existing `users` table
- ✅ Create new authentication tables
- ✅ Set up proper indexes and triggers
- ✅ Configure Row Level Security (RLS)
- ✅ Create helper functions
- ✅ Add the default admin user

### Step 2: Verify the Setup
After running the migration, test the authentication system:

```bash
# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### Step 3: Test the Frontend
1. Open the game in your browser
2. You should see **Login** and **Register** buttons in the game header
3. Click **Register** to create a new account
4. Click **Login** to sign in with existing credentials

## 🎯 What the Migration Does

### Updates Existing Tables:
- **`users`**: Adds `first_name`, `last_name`, `role`, `organization`, etc.
- **`game_sessions`**: Adds `session_data`, `completed_levels`, `achievements`
- **`user_progress`**: Adds `status`, `best_time`, `metadata`
- **`ai_conversations`**: Adds `title`, `conversation_type`, `equipment_context`
- **`ai_messages`**: Adds `message_type`, `metadata`

### Creates New Tables:
- **`user_sessions`**: Session management
- **`password_reset_tokens`**: Password recovery
- **`email_verification_tokens`**: Email verification
- **`user_activity_log`**: Activity tracking
- **`user_preferences`**: User settings
- **`api_usage`**: Usage analytics

### Sets Up Security:
- **Row Level Security (RLS)** on all tables
- **Proper access policies** for each table
- **Helper functions** for common operations
- **Automatic timestamps** and logging

## 🚀 After Migration

The authentication system will be fully functional with:

- ✅ **User Registration** with validation
- ✅ **Secure Login** with JWT tokens
- ✅ **Profile Management** with role-based access
- ✅ **Session Persistence** across browser restarts
- ✅ **Activity Logging** for audit trails
- ✅ **AI Integration** with user context
- ✅ **Progress Tracking** per user

## 🔍 Troubleshooting

If you still get errors after running the migration:

1. **Check Supabase Logs**: Look for any SQL errors in the Supabase dashboard
2. **Verify Tables**: Run `SELECT * FROM information_schema.tables WHERE table_schema = 'public';` to see all tables
3. **Check Columns**: Run `SELECT column_name FROM information_schema.columns WHERE table_name = 'users';` to verify user columns
4. **Test Backend**: Ensure the backend is running with `curl http://localhost:3001/health`

## 📞 Support

If you encounter any issues:
1. Check the browser console for frontend errors
2. Check the backend logs for API errors
3. Verify the migration script ran successfully in Supabase
4. Ensure all environment variables are set correctly

The authentication system is now ready to use! 🎉
