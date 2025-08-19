const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import logger with fallback
let logger;
try {
    logger = require('./utils/logger');
    console.log('✅ Logger loaded');
} catch (error) {
    console.log('⚠️ Logger not available, using console:', error.message);
    logger = console;
}
const { initializeSupabase } = require('./config/supabase');
const { initializeOpenAI } = require('./config/openai');

// Import routes with error handling - only load if environment variables are available
let authRoutes, aiRoutes, gameRoutes, voiceRoutes, userRoutes;
let authenticateToken, errorHandler;

// Load auth routes (with fallback if Supabase not available)
try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        authRoutes = require('./routes/auth').router;
        console.log('✅ Auth routes loaded with Supabase');
    } else {
        throw new Error('Supabase environment variables not configured');
    }
} catch (error) {
    console.log('⚠️ Auth routes not available:', error.message);
    // Create fallback auth routes
    authRoutes = require('express').Router();

    // Login endpoint
    authRoutes.post('/login', (req, res) => {
        res.status(503).json({
            error: 'Authentication service unavailable',
            message: 'Supabase not configured. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
            timestamp: new Date().toISOString()
        });
    });

    // Register endpoint
    authRoutes.post('/register', (req, res) => {
        res.status(503).json({
            error: 'Authentication service unavailable',
            message: 'Supabase not configured. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
            timestamp: new Date().toISOString()
        });
    });

    // Profile endpoint
    authRoutes.get('/profile', (req, res) => {
        res.status(503).json({
            error: 'Authentication service unavailable',
            message: 'Supabase not configured. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
            timestamp: new Date().toISOString()
        });
    });

    // Health check endpoint
    authRoutes.get('/health', (req, res) => {
        res.json({
            status: 'Auth service status',
            message: 'Supabase not configured',
            timestamp: new Date().toISOString()
        });
    });

    console.log('✅ Fallback auth routes created');
}

// Load AI routes (with fallback if OpenAI not available)
try {
    aiRoutes = require('./routes/ai');
    console.log('✅ AI routes loaded');
} catch (error) {
    console.log('⚠️ AI routes not available:', error.message);
    // Create fallback AI routes
    aiRoutes = require('express').Router();
    aiRoutes.post('/conversation/start', (req, res) => {
        res.status(503).json({
            error: 'AI service unavailable',
            message: 'OpenAI API key not configured',
            timestamp: new Date().toISOString()
        });
    });
    aiRoutes.post('/conversation/message', (req, res) => {
        res.status(503).json({
            error: 'AI service unavailable',
            message: 'OpenAI API key not configured',
            timestamp: new Date().toISOString()
        });
    });
    console.log('✅ Fallback AI routes created');
}

// Load game routes (these don't require external APIs)
try {
    gameRoutes = require('./routes/game');
    console.log('✅ Game routes loaded');
} catch (error) {
    console.log('⚠️ Game routes not available:', error.message);
}

// Load voice routes (these don't require external APIs)
try {
    voiceRoutes = require('./routes/voice');
    console.log('✅ Voice routes loaded');
} catch (error) {
    console.log('⚠️ Voice routes not available:', error.message);
}

// Load user routes (these don't require external APIs)
try {
    userRoutes = require('./routes/user');
    console.log('✅ User routes loaded');
} catch (error) {
    console.log('⚠️ User routes not available:', error.message);
}

// Import middleware with error handling
try {
    authenticateToken = require('./middleware/auth').authenticateToken;
    console.log('✅ Auth middleware loaded');
} catch (error) {
    console.log('⚠️ Auth middleware not available:', error.message);
    authenticateToken = (req, res, next) => next(); // Pass-through middleware
}

try {
    errorHandler = require('./middleware/errorHandler').errorHandler;
    console.log('✅ Error handler loaded');
} catch (error) {
    console.log('⚠️ Error handler not available:', error.message);
    errorHandler = (err, req, res, next) => {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    };
}

const app = express();

// Trust proxy for Railway deployment - must be before rate limiting
app.set('trust proxy', 1);
app.enable('trust proxy');

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: true, // Allow all origins
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Initialize configurations only if environment variables are available
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
        initializeSupabase();
        console.log('✅ Supabase initialized');
    } catch (error) {
        console.log('⚠️ Supabase initialization failed:', error.message);
    }
} else {
    console.log('⚠️ Supabase initialization skipped - missing environment variables');
}

if (process.env.OPENAI_API_KEY) {
    try {
        initializeOpenAI();
        console.log('✅ OpenAI initialized');
    } catch (error) {
        console.log('⚠️ OpenAI initialization failed:', error.message);
    }
} else {
    console.log('⚠️ OpenAI initialization skipped - missing environment variables');
}

// CORS configuration - MUST BE FIRST
app.use(cors({
    origin: true, // Allow all origins temporarily for debugging
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// Handle CORS preflight requests
app.options('*', cors());

// Security middleware - Disable CSP for now to avoid CORS conflicts
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Manual CORS headers as backup (simplified)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
    console.log('🧪 CORS test request from:', req.headers.origin);
    res.json({
        message: 'CORS test successful',
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
    });
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
    console.log('🏥 Health check request from:', req.headers.origin);
    res.json({
        status: 'OK',
        message: 'Backend is running',
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
    });
});

// Log CORS requests for debugging
app.use((req, res, next) => {
    console.log('🌐 Request from origin:', req.headers.origin);
    console.log('🌐 Request method:', req.method);
    console.log('🌐 Request URL:', req.url);
    next();
});

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Backend API server - no static file serving
console.log('🚀 Starting backend API server only');

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'AV Master Backend API Server',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        cors: {
            origin: req.headers.origin,
            allowed: true
        }
    });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
    res.status(200).json({
        message: 'CORS is working!',
        origin: req.headers.origin,
        timestamp: new Date().toISOString(),
        headers: req.headers
    });
});

// Simple test endpoint
app.get('/test', (req, res) => {
    res.status(200).json({
        message: 'Backend is working!',
        cors: 'enabled',
        timestamp: new Date().toISOString()
    });
});

// Configuration endpoint for frontend
app.get('/api/config', (req, res) => {
    res.status(200).json({
        BACKEND_URL: process.env.BACKEND_URL || `https://${req.get('host')}`,
        NODE_ENV: process.env.NODE_ENV || 'production',
        CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
        SUPABASE_URL: process.env.SUPABASE_URL || null,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'configured' : null,
        timestamp: new Date().toISOString()
    });
});

// API info endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'AV Master Backend API Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            test: '/test',
            cors: '/cors-test',
            auth: '/api/auth',
            ai: '/api/ai',
            game: '/api/game',
            voice: '/api/voice',
            user: '/api/user'
        },
        timestamp: new Date().toISOString()
    });
});

// API routes - only register if available
if (authRoutes) {
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes registered');
}

if (aiRoutes) {
    app.use('/api/ai', aiRoutes);
    console.log('✅ AI routes registered');
}

if (gameRoutes) {
    app.use('/api/game', authenticateToken, gameRoutes);
    console.log('✅ Game routes registered');
}

if (voiceRoutes) {
    app.use('/api/voice', authenticateToken, voiceRoutes);
    console.log('✅ Voice routes registered');
}

if (userRoutes) {
    app.use('/api/user', authenticateToken, userRoutes);
    console.log('✅ User routes registered');
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Join user to their personal room
    socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        logger.info(`User ${userId} joined their room`);
    });

    // Handle voice chat
    socket.on('voice-message', async (data) => {
        try {
            const { userId, audioData, sessionId } = data;

            // Emit to user's room for real-time processing
            socket.to(`user-${userId}`).emit('voice-message-received', {
                audioData,
                sessionId,
                timestamp: new Date().toISOString()
            });

            logger.info(`Voice message received from user ${userId}`);
        } catch (error) {
            logger.error('Error handling voice message:', error);
            socket.emit('error', { message: 'Error processing voice message' });
        }
    });

    // Handle AI chat messages
    socket.on('ai-message', async (data) => {
        try {
            const { userId, message, conversationId } = data;

            // Process AI message (this would integrate with OpenAI)
            socket.to(`user-${userId}`).emit('ai-response', {
                message: 'AI response via backend API',
                conversationId,
                timestamp: new Date().toISOString()
            });

            logger.info(`AI message processed for user ${userId}`);
        } catch (error) {
            logger.error('Error handling AI message:', error);
            socket.emit('error', { message: 'Error processing AI message' });
        }
    });

    socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.id}`);
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler for unknown routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        message: 'This is a backend API server. Frontend should be served separately.',
        path: req.originalUrl,
        availableEndpoints: ['/health', '/test', '/cors-test', '/api/auth', '/api/ai', '/api/game', '/api/voice', '/api/user']
    });
});

const PORT = process.env.PORT || 3001;

// Start server immediately
server.listen(PORT, () => {
    logger.info(`🚀 AV Master Backend Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🚀 Server started successfully on port ${PORT}`);
}).on('error', (error) => {
    console.error('❌ Server failed to start:', error);
    logger.error(`Server failed to start: ${error.message}`);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    logger.error(`Uncaught Exception: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    logger.error(`Unhandled Rejection: ${reason}`);
    process.exit(1);
});

module.exports = { app, server, io };
