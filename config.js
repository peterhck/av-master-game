// Frontend Configuration
const config = {
    // Backend API URL - will be replaced during deployment
    backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Feature flags
    features: {
        ai: true,
        auth: true,
        voice: true,
        game: true
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    // Browser environment
    window.AV_CONFIG = config;
}
