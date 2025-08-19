-- Enhanced Authentication and User Management Schema
-- This schema provides a complete user authentication and management system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (enhanced)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    organization VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'instructor', 'student')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500),
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity log
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(50) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    ai_tutor_enabled BOOLEAN DEFAULT true,
    voice_enabled BOOLEAN DEFAULT false,
    accessibility_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_data JSONB NOT NULL DEFAULT '{}',
    current_level VARCHAR(100),
    score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    completed_levels TEXT[] DEFAULT '{}',
    achievements TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
    score INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    best_time INTEGER, -- in seconds
    completion_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, level_id)
);

-- Enhanced AI conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
    title VARCHAR(255),
    conversation_type VARCHAR(50) DEFAULT 'general' CHECK (conversation_type IN ('general', 'equipment_help', 'troubleshooting', 'learning')),
    equipment_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced AI messages table
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image', 'file')),
    tokens_used INTEGER,
    response_time INTEGER, -- in milliseconds
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced API usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_type VARCHAR(50) NOT NULL CHECK (api_type IN ('openai_chat', 'openai_voice', 'web_search', 'link_preview')),
    endpoint VARCHAR(100),
    tokens_used INTEGER DEFAULT 0,
    cost_usd DECIMAL(10,6) DEFAULT 0,
    request_count INTEGER DEFAULT 1,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    response_time INTEGER, -- in milliseconds
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_level_id ON user_progress(level_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id ON ai_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type VARCHAR(100),
    p_description TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_activity_log (
        user_id, activity_type, description, ip_address, user_agent, metadata
    ) VALUES (
        p_user_id, p_activity_type, p_description, p_ip_address, p_user_agent, p_metadata
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update user login count and last login
CREATE OR REPLACE FUNCTION update_user_login(
    p_user_id UUID,
    p_ip_address INET DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET 
        last_login = NOW(),
        login_count = login_count + 1,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Log the login activity
    PERFORM log_user_activity(
        p_user_id, 
        'login', 
        'User logged in successfully',
        p_ip_address,
        NULL,
        '{"login_count": (SELECT login_count FROM users WHERE id = p_user_id)}'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create default user preferences
CREATE OR REPLACE FUNCTION create_user_preferences(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_preferences (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize user data
CREATE OR REPLACE FUNCTION initialize_user_data(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Create default preferences
    PERFORM create_user_preferences(p_user_id);
    
    -- Create initial game session
    INSERT INTO game_sessions (user_id, session_data)
    VALUES (
        p_user_id,
        '{"unlocked_levels": ["level-1-audio"], "current_level": "level-1-audio", "score": 0, "completed_levels": []}'::jsonb
    )
    ON CONFLICT DO NOTHING;
    
    -- Log user creation
    PERFORM log_user_activity(p_user_id, 'user_created', 'New user account created');
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User sessions policies
CREATE POLICY "Users can manage own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Password reset tokens policies
CREATE POLICY "Users can manage own reset tokens" ON password_reset_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Email verification tokens policies
CREATE POLICY "Users can manage own verification tokens" ON email_verification_tokens
    FOR ALL USING (auth.uid() = user_id);

-- User activity log policies
CREATE POLICY "Users can view own activity" ON user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON user_activity_log
    FOR INSERT WITH CHECK (true);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Game sessions policies
CREATE POLICY "Users can manage own game sessions" ON game_sessions
    FOR ALL USING (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can manage own progress" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

-- AI conversations policies
CREATE POLICY "Users can manage own conversations" ON ai_conversations
    FOR ALL USING (auth.uid() = user_id);

-- AI messages policies
CREATE POLICY "Users can manage own messages" ON ai_messages
    FOR ALL USING (auth.uid() = user_id);

-- API usage policies
CREATE POLICY "Users can view own API usage" ON api_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert API usage" ON api_usage
    FOR INSERT WITH CHECK (true);

-- Insert default admin user (for development)
INSERT INTO users (
    id, email, first_name, last_name, role, is_active, is_verified, email_verified_at
) VALUES (
    '07a63a2d-2861-4a55-9ef7-41becba6a310',
    'peter.lewis@worldcastlive.com',
    'Peter',
    'Lewis',
    'admin',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    is_verified = EXCLUDED.is_verified,
    email_verified_at = EXCLUDED.email_verified_at,
    updated_at = NOW();

-- Initialize data for the default user
SELECT initialize_user_data('07a63a2d-2861-4a55-9ef7-41becba6a310');
