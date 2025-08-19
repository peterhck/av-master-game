const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
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
        origin: process.env.CORS_ORIGIN || "http://localhost:8001",
        methods: ["GET", "POST"]
    }
});

// Initialize configurations
initializeSupabase();
initializeOpenAI();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:8001",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Simple health check for Railway
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'AV Master Game Backend is running',
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

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
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
