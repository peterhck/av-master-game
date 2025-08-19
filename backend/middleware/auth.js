const jwt = require('jsonwebtoken');
const { getSupabase } = require('../config/supabase');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Access token required',
                message: 'Please provide a valid authentication token'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from Supabase
        const supabase = getSupabase();
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Authentication token is invalid or expired'
            });
        }

        // Add user info to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role || 'user'
        };

        logger.info(`User authenticated: ${user.email}`);
        next();
    } catch (error) {
        logger.error('Authentication error:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Authentication token has expired'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Authentication token is malformed'
            });
        }

        return res.status(500).json({
            error: 'Authentication failed',
            message: 'Internal server error during authentication'
        });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const supabase = getSupabase();
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (!error && user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role || 'user'
                };
            }
        }

        next();
    } catch (error) {
        // Continue without authentication for optional routes
        next();
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated'
            });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: 'User does not have required permissions'
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireRole
};
