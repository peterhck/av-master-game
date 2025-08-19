-- Migration script to add authentication support to existing AV Master database
-- Run this script in your Supabase SQL editor to update the existing schema

-- Step 1: Add missing columns to existing users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS organization VARCHAR(255),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'instructor', 'student')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Step 2: Update existing users to have proper names
-- Split full_name into first_name and last_name if it exists
UPDATE public.users 
SET 
    first_name = CASE 
        WHEN full_name IS NOT NULL AND full_name != '' THEN 
            SPLIT_PART(full_name, ' ', 1)
        ELSE 
            COALESCE(username, SPLIT_PART(email, '@', 1))
        END,
    last_name = CASE 
        WHEN full_name IS NOT NULL AND full_name != '' AND POSITION(' ' IN full_name) > 0 THEN 
            SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
        ELSE 
            ''
        END
WHERE first_name IS NULL OR last_name IS NULL;

-- Step 3: Create new tables for authentication system

-- User sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity log
CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences (enhanced version)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- Enhanced game sessions table (update existing)
ALTER TABLE public.game_sessions 
ADD COLUMN IF NOT EXISTS session_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS completed_levels TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Enhanced user progress table (update existing)
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS best_time INTEGER,
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Enhanced AI conversations table (update existing)
ALTER TABLE public.ai_conversations 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS conversation_type VARCHAR(50) DEFAULT 'general' CHECK (conversation_type IN ('general', 'equipment_help', 'troubleshooting', 'learning')),
ADD COLUMN IF NOT EXISTS equipment_context JSONB;

-- Enhanced AI messages table (update existing)
ALTER TABLE public.ai_messages 
ADD COLUMN IF NOT EXISTS message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image', 'file')),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- API usage tracking
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON public.email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON public.email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage(created_at);

-- Step 5: Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to existing tables
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON public.user_sessions;
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON public.game_sessions;
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON public.game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON public.ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Create helper functions
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
    INSERT INTO public.user_activity_log (
        user_id, activity_type, description, ip_address, user_agent, metadata
    ) VALUES (
        p_user_id, p_activity_type, p_description, p_ip_address, p_user_agent, p_metadata
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_login(
    p_user_id UUID,
    p_ip_address INET DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
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
        '{"login_count": (SELECT login_count FROM public.users WHERE id = p_user_id)}'
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_user_preferences(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION initialize_user_data(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Create default preferences
    PERFORM create_user_preferences(p_user_id);
    
    -- Create initial game session if none exists
    INSERT INTO public.game_sessions (user_id, session_data)
    VALUES (
        p_user_id,
        '{"unlocked_levels": ["level-1-audio"], "current_level": "level-1-audio", "score": 0, "completed_levels": []}'::jsonb
    )
    ON CONFLICT DO NOTHING;
    
    -- Log user creation
    PERFORM log_user_activity(p_user_id, 'user_created', 'New user account created');
END;
$$ LANGUAGE plpgsql;

-- Step 7: Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User sessions policies
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.user_sessions;
CREATE POLICY "Users can manage own sessions" ON public.user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Password reset tokens policies
DROP POLICY IF EXISTS "Users can manage own reset tokens" ON public.password_reset_tokens;
CREATE POLICY "Users can manage own reset tokens" ON public.password_reset_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Email verification tokens policies
DROP POLICY IF EXISTS "Users can manage own verification tokens" ON public.email_verification_tokens;
CREATE POLICY "Users can manage own verification tokens" ON public.email_verification_tokens
    FOR ALL USING (auth.uid() = user_id);

-- User activity log policies
DROP POLICY IF EXISTS "Users can view own activity" ON public.user_activity_log;
CREATE POLICY "Users can view own activity" ON public.user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_log;
CREATE POLICY "System can insert activity logs" ON public.user_activity_log
    FOR INSERT WITH CHECK (true);

-- User preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Game sessions policies
DROP POLICY IF EXISTS "Users can manage own game sessions" ON public.game_sessions;
CREATE POLICY "Users can manage own game sessions" ON public.game_sessions
    FOR ALL USING (auth.uid() = user_id);

-- User progress policies
DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;
CREATE POLICY "Users can manage own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

-- AI conversations policies
DROP POLICY IF EXISTS "Users can manage own conversations" ON public.ai_conversations;
CREATE POLICY "Users can manage own conversations" ON public.ai_conversations
    FOR ALL USING (auth.uid() = user_id);

-- AI messages policies
DROP POLICY IF EXISTS "Users can manage own messages" ON public.ai_messages;
CREATE POLICY "Users can manage own messages" ON public.ai_messages
    FOR ALL USING (auth.uid() = user_id);

-- API usage policies
DROP POLICY IF EXISTS "Users can view own API usage" ON public.api_usage;
CREATE POLICY "Users can view own API usage" ON public.api_usage
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert API usage" ON public.api_usage;
CREATE POLICY "System can insert API usage" ON public.api_usage
    FOR INSERT WITH CHECK (true);

-- Step 9: Insert or update default admin user
INSERT INTO public.users (
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

-- Step 10: Initialize data for the default user
SELECT initialize_user_data('07a63a2d-2861-4a55-9ef7-41becba6a310');

-- Success message
SELECT 'Migration completed successfully! Authentication system is now ready.' as status;
