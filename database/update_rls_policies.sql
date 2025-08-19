-- Update RLS policies to allow anonymous user access
-- This script should be run in your Supabase SQL editor

-- Note: The anonymous user will be created by the backend in auth.users
-- This script updates RLS policies to allow access for any authenticated user

-- Update RLS policies to allow anonymous user access
-- AI conversations policies - Allow any authenticated user
DROP POLICY IF EXISTS "Users can view own conversations" ON public.ai_conversations;
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert own conversations" ON public.ai_conversations;
CREATE POLICY "Users can insert own conversations" ON public.ai_conversations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own conversations" ON public.ai_conversations;
CREATE POLICY "Users can update own conversations" ON public.ai_conversations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- AI messages policies - Allow any authenticated user
DROP POLICY IF EXISTS "Users can view own messages" ON public.ai_messages;
CREATE POLICY "Users can view own messages" ON public.ai_messages
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert own messages" ON public.ai_messages;
CREATE POLICY "Users can insert own messages" ON public.ai_messages
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- API usage policies - Allow any authenticated user
DROP POLICY IF EXISTS "Users can view own api usage" ON public.api_usage;
CREATE POLICY "Users can view own api usage" ON public.api_usage
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert own api usage" ON public.api_usage;
CREATE POLICY "Users can insert own api usage" ON public.api_usage
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users policies - Allow any authenticated user to view profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Enable RLS bypass for service role (if needed)
-- This allows the backend to bypass RLS when using service role key
ALTER TABLE public.ai_conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage FORCE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
