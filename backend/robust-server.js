const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
    }
});

// Basic middleware
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

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the parent directory (frontend files)
app.use(express.static(path.join(__dirname, '..')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'AV Master Game Backend is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        features: {
            supabase: !!process.env.SUPABASE_URL,
            openai: !!process.env.OPENAI_API_KEY,
            jwt: !!process.env.JWT_SECRET
        }
    });
});

// Serve the main HTML file for root
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).json({
                error: 'Failed to serve frontend',
                message: 'Frontend files not found or inaccessible',
                path: indexPath
            });
        } else {
            console.log('Successfully served index.html');
        }
    });
});

// Try to load optional modules
let logger = null;
let supabase = null;
let openai = null;

try {
    logger = require('./utils/logger');
    console.log('✅ Logger loaded successfully');
} catch (error) {
    console.log('⚠️ Logger not available:', error.message);
    logger = console;
}

// Try to initialize Supabase
try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { initializeSupabase } = require('./config/supabase');
        initializeSupabase();
        console.log('✅ Supabase initialized successfully');
    } else {
        console.log('⚠️ Supabase not configured - skipping initialization');
    }
} catch (error) {
    console.log('⚠️ Supabase initialization failed:', error.message);
}

// Try to initialize OpenAI
try {
    if (process.env.OPENAI_API_KEY) {
        const { initializeOpenAI } = require('./config/openai');
        initializeOpenAI();
        console.log('✅ OpenAI initialized successfully');
    } else {
        console.log('⚠️ OpenAI not configured - skipping initialization');
    }
} catch (error) {
    console.log('⚠️ OpenAI initialization failed:', error.message);
}

// Try to load API routes
try {
    const { router: authRoutes } = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.log('⚠️ Auth routes not available:', error.message);
    app.use('/api/auth', (req, res) => {
        res.status(503).json({ error: 'Authentication service unavailable' });
    });
}

try {
    const aiRoutes = require('./routes/ai');
    app.use('/api/ai', aiRoutes);
    console.log('✅ AI routes loaded');
} catch (error) {
    console.log('⚠️ AI routes not available:', error.message);
    app.use('/api/ai', (req, res) => {
        res.status(503).json({ error: 'AI service unavailable' });
    });
}

try {
    const gameRoutes = require('./routes/game');
    app.use('/api/game', gameRoutes);
    console.log('✅ Game routes loaded');
} catch (error) {
    console.log('⚠️ Game routes not available:', error.message);
    app.use('/api/game', (req, res) => {
        res.status(503).json({ error: 'Game service unavailable' });
    });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Serve the main HTML file for all non-API routes (SPA routing)
app.use('*', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html for SPA route:', err);
            res.status(404).json({
                error: 'Route not found',
                message: 'Frontend not available'
            });
        }
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`🚀 Robust AV Master Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Frontend: http://localhost:${PORT}/`);
    console.log(`📁 Static path: ${path.join(__dirname, '..')}`);
    console.log(`📄 Index path: ${path.join(__dirname, '..', 'index.html')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

module.exports = { app, server, io };
