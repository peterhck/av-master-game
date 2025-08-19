const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const logger = require('./utils/logger');
const { initializeSupabase } = require('./config/supabase');
const { initializeOpenAI } = require('./config/openai');

// Import routes
const { router: authRoutes } = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const gameRoutes = require('./routes/game');
const voiceRoutes = require('./routes/voice');
const userRoutes = require('./routes/user');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: true, // Allow all origins
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Initialize configurations
initializeSupabase();
initializeOpenAI();

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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes); // Remove authentication for testing
app.use('/api/game', authenticateToken, gameRoutes);
app.use('/api/voice', authenticateToken, voiceRoutes);
app.use('/api/user', authenticateToken, userRoutes);

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

// 404 handler for API routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        message: 'This is the backend API server. Frontend is served separately.',
        path: req.originalUrl
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    logger.info(`🚀 AV Master Backend Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
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

module.exports = { app, server, io };
