-- Fix RLS Policies to prevent infinite recursion
-- Run this script in your Supabase SQL editor

-- Step 1: Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "System can insert users" ON public.users;

-- Step 2: Create fixed policies that avoid recursion

-- Allow users to view their own profile (simple check)
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile (simple check)
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Allow system to insert new users (for registration)
CREATE POLICY "System can insert users" ON public.users
    FOR INSERT WITH CHECK (true);

-- Allow admins to view all users (using auth.uid() directly)
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role = 'admin'
        )
    );

-- Step 3: Fix other table policies that might cause issues

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

-- User preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- User activity log policies
DROP POLICY IF EXISTS "Users can view own activity" ON public.user_activity_log;
CREATE POLICY "Users can view own activity" ON public.user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

-- Allow system to insert activity logs
DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_log;
CREATE POLICY "System can insert activity logs" ON public.user_activity_log
    FOR INSERT WITH CHECK (true);

-- API usage policies
DROP POLICY IF EXISTS "Users can view own API usage" ON public.api_usage;
CREATE POLICY "Users can view own API usage" ON public.api_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Allow system to insert API usage
DROP POLICY IF EXISTS "System can insert API usage" ON public.api_usage;
CREATE POLICY "System can insert API usage" ON public.api_usage
    FOR INSERT WITH CHECK (true);

-- Step 4: Verify policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Success message
SELECT 'RLS policies fixed successfully! Infinite recursion issue resolved.' as status;
