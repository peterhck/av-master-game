-- Create a test user for AI functionality
-- This script should be run in your Supabase SQL editor

-- First, create the user in auth.users (this requires admin privileges)
-- Note: You may need to do this through the Supabase dashboard or use the admin API

-- Then, create the corresponding record in public.users
INSERT INTO public.users (id, email, username, full_name, created_at, updated_at)
VALUES (
    '07a63a2d-2861-4a55-9ef7-41becba6a310',
    'peter.lewis@worldcastlive.com',
    'testuser',
    'Test User',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Update RLS policies to allow this test user
-- AI conversations policies
DROP POLICY IF EXISTS "Users can view own conversations" ON public.ai_conversations;
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id = '07a63a2d-2861-4a55-9ef7-41becba6a310'
    );

DROP POLICY IF EXISTS "Users can insert own conversations" ON public.ai_conversations;
CREATE POLICY "Users can insert own conversations" ON public.ai_conversations
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id = '07a63a2d-2861-4a55-9ef7-41becba6a310'
    );

DROP POLICY IF EXISTS "Users can update own conversations" ON public.ai_conversations;
CREATE POLICY "Users can update own conversations" ON public.ai_conversations
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        user_id = '07a63a2d-2861-4a55-9ef7-41becba6a310'
    );

-- AI messages policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.ai_messages;
CREATE POLICY "Users can view own messages" ON public.ai_messages
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id = '07a63a2d-2861-4a55-9ef7-41becba6a310'
    );

DROP POLICY IF EXISTS "Users can insert own messages" ON public.ai_messages;
CREATE POLICY "Users can insert own messages" ON public.ai_messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id = '07a63a2d-2861-4a55-9ef7-41becba6a310'
    );

-- API usage policies
DROP POLICY IF EXISTS "Users can view own api usage" ON public.api_usage;
CREATE POLICY "Users can view own api usage" ON public.api_usage
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id = '07a63a2d-2861-4a55-9ef7-41becba6a310'
    );

DROP POLICY IF EXISTS "Users can insert own api usage" ON public.api_usage;
CREATE POLICY "Users can insert own api usage" ON public.api_usage
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id = '07a63a2d-2861-4a55-9ef7-41becba6a310'
    );

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR 
        id = '07a63a2d-2861-4a55-9ef7-41becba6a310'
    );
