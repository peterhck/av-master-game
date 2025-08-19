// Configuration for AV Master Game
// Environment variables for frontend

// Configuration object
const config = {
    BACKEND_URL: 'https://wcllmsgames-backend-production.up.railway.app',
    NODE_ENV: 'production',
    CORS_ORIGIN: '*'
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.AV_MASTER_CONFIG = config;
    console.log('🔧 AV Master Config loaded:', config);
}

// Export configuration
export { config };
