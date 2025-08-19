-- Create authentication helper functions to avoid RLS recursion
-- Run this script in your Supabase SQL editor

-- Function to safely check if a user exists (bypasses RLS)
CREATE OR REPLACE FUNCTION check_user_exists(user_email TEXT)
RETURNS TABLE(id UUID, email TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Temporarily disable RLS for this function
    SET row_security = off;
    
    RETURN QUERY
    SELECT u.id, u.email 
    FROM public.users u 
    WHERE u.email = user_email;
    
    -- Re-enable RLS
    SET row_security = on;
END;
$$;

-- Function to safely create a user profile (bypasses RLS)
CREATE OR REPLACE FUNCTION create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_first_name TEXT,
    user_last_name TEXT,
    user_organization TEXT DEFAULT NULL,
    user_role TEXT DEFAULT 'user'
)
RETURNS TABLE(id UUID, email TEXT, first_name TEXT, last_name TEXT, organization TEXT, role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Temporarily disable RLS for this function
    SET row_security = off;
    
    INSERT INTO public.users (
        id, 
        email, 
        first_name, 
        last_name, 
        organization, 
        role,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        user_email,
        user_first_name,
        user_last_name,
        user_organization,
        user_role,
        NOW(),
        NOW()
    );
    
    -- Return the created user
    RETURN QUERY
    SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.organization, 
        u.role
    FROM public.users u 
    WHERE u.id = user_id;
    
    -- Re-enable RLS
    SET row_security = on;
END;
$$;

-- Function to safely get user by email (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE(
    id UUID, 
    email TEXT, 
    first_name TEXT, 
    last_name TEXT, 
    organization TEXT, 
    role TEXT,
    created_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Temporarily disable RLS for this function
    SET row_security = off;
    
    RETURN QUERY
    SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.organization, 
        u.role,
        u.created_at,
        u.last_login
    FROM public.users u 
    WHERE u.email = user_email;
    
    -- Re-enable RLS
    SET row_security = on;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_user_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_email(TEXT) TO authenticated;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION check_user_exists(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_by_email(TEXT) TO service_role;

-- Success message
SELECT 'Authentication helper functions created successfully!' as status;
