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

// Import routes with error handling
let authRoutes, aiRoutes, gameRoutes, voiceRoutes, userRoutes;
let authenticateToken, errorHandler;

try {
    authRoutes = require('./routes/auth').router;
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.log('⚠️ Auth routes not available:', error.message);
}

try {
    aiRoutes = require('./routes/ai');
    console.log('✅ AI routes loaded');
} catch (error) {
    console.log('⚠️ AI routes not available:', error.message);
}

try {
    gameRoutes = require('./routes/game');
    console.log('✅ Game routes loaded');
} catch (error) {
    console.log('⚠️ Game routes not available:', error.message);
}

try {
    voiceRoutes = require('./routes/voice');
    console.log('✅ Voice routes loaded');
} catch (error) {
    console.log('⚠️ Voice routes not available:', error.message);
}

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
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: true, // Allow all origins
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Initialize configurations with error handling
try {
    initializeSupabase();
    console.log('✅ Supabase initialized');
} catch (error) {
    console.log('⚠️ Supabase initialization failed:', error.message);
}

try {
    initializeOpenAI();
    console.log('✅ OpenAI initialized');
} catch (error) {
    console.log('⚠️ OpenAI initialization failed:', error.message);
}

// CORS configuration - MUST BE FIRST
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Requested-With']
}));

// Handle CORS preflight requests
app.options('*', cors());

// Security middleware - Disable CSP for now to avoid CORS conflicts
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Manual CORS headers as backup
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
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

// Serve static files from the parent directory (frontend files)
const staticPath = path.join(__dirname, '..');
console.log('📁 Serving static files from:', staticPath);

// Check if frontend files exist
const fs = require('fs');
const indexPath = path.join(staticPath, 'index.html');
if (fs.existsSync(indexPath)) {
    console.log('✅ index.html found at:', indexPath);
    console.log('📄 File size:', fs.statSync(indexPath).size, 'bytes');
} else {
    console.log('❌ index.html not found at:', indexPath);
    console.log('📂 Parent directory contents:', fs.readdirSync(staticPath));
}

app.use(express.static(staticPath));

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

// Frontend test endpoint
app.get('/frontend-test', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Frontend Test</title></head>
        <body>
            <h1>Frontend Test Page</h1>
            <p>If you can see this, the server is serving HTML correctly.</p>
            <p><a href="/">Try the main frontend</a></p>
            <p><a href="/health">Health Check</a></p>
            <p><a href="/test">Backend Test</a></p>
        </body>
        </html>
    `);
});

// Serve frontend for root path
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    console.log('🌐 Serving frontend for root path:', indexPath);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('❌ Error serving frontend:', err);
            console.log('📂 Current directory:', __dirname);
            console.log('📂 Parent directory contents:', fs.readdirSync(path.join(__dirname, '..')));

            // Fallback HTML response
            res.status(200).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>AV Master Game</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .error { color: red; }
                        .success { color: green; }
                    </style>
                </head>
                <body>
                    <h1>AV Master Game</h1>
                    <p class="error">Frontend files not found at: ${indexPath}</p>
                    <p>Backend is running successfully!</p>
                    <p><a href="/health">Health Check</a></p>
                    <p><a href="/test">Test Endpoint</a></p>
                    <p><a href="/cors-test">CORS Test</a></p>
                </body>
                </html>
            `);
        } else {
            console.log('✅ Frontend served successfully');
        }
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

// Serve the main HTML file for all non-API routes (SPA routing)
app.use('*', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(404).json({
                error: 'Frontend not available',
                message: 'index.html not found',
                path: req.originalUrl
            });
        }
    });
});

const PORT = process.env.PORT || 3001;

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
