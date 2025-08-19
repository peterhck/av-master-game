const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

let supabase = null;

const initializeSupabase = () => {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase configuration. Please check your environment variables.');
        }

        // Create Supabase client
        supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: false,
                detectSessionInUrl: false
            }
        });

        // Create service client for admin operations
        const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: false,
                detectSessionInUrl: false
            }
        });

        logger.info('✅ Supabase client initialized successfully');

        return { supabase, supabaseService };
    } catch (error) {
        logger.error('❌ Failed to initialize Supabase:', error.message);
        throw error;
    }
};

const getSupabase = () => {
    if (!supabase) {
        throw new Error('Supabase client not initialized. Call initializeSupabase() first.');
    }
    return supabase;
};

const getSupabaseService = () => {
    if (!supabase) {
        throw new Error('Supabase service client not initialized. Call initializeSupabase() first.');
    }
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
};

module.exports = {
    initializeSupabase,
    getSupabase,
    getSupabaseService
};
