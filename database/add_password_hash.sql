-- Add password_hash column to users table
-- This migration adds the password_hash column needed for our custom authentication

-- Add password_hash column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.users.password_hash IS 'Hashed password for custom authentication';

-- Update RLS policy to allow users to read their own password_hash
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Update RLS policy to allow service role to manage password_hash
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO service_role;
GRANT SELECT ON public.users TO authenticated;
