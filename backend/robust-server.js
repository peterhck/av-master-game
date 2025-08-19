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

// Health check endpoint
app.get('/health', (req, res) => {
    const fs = require('fs');
    const parentDir = path.join(__dirname, '..');
    let parentDirContents = [];

    try {
        parentDirContents = fs.readdirSync(parentDir);
    } catch (error) {
        console.error('Error reading parent directory:', error);
    }

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
        },
        files: {
            currentDir: __dirname,
            parentDir: parentDir,
            parentDirContents: parentDirContents,
            indexHtmlExists: fs.existsSync(path.join(parentDir, 'index.html'))
        }
    });
});

// Serve static files from the parent directory (frontend files)
app.use(express.static(path.join(__dirname, '..')));

// Serve the main HTML file for root
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    console.log('🌐 Request for root path (/)');
    console.log('📁 Attempting to serve index.html from:', indexPath);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(indexPath)) {
        console.error('❌ index.html file not found at:', indexPath);
        console.log('📂 Current directory:', __dirname);
        console.log('📂 Parent directory contents:', fs.readdirSync(path.join(__dirname, '..')));

        return res.status(500).json({
            error: 'Frontend file not found',
            message: 'index.html not found in expected location',
            path: indexPath,
            currentDir: __dirname,
            parentDirContents: fs.readdirSync(path.join(__dirname, '..'))
        });
    }

    console.log('✅ index.html file found, serving...');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('❌ Error serving index.html:', err);
            res.status(500).json({
                error: 'Failed to serve frontend',
                message: err.message,
                path: indexPath
            });
        } else {
            console.log('✅ Successfully served index.html');
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

// Log startup information
console.log('🚀 Starting robust server...');
console.log('📁 Current directory:', __dirname);
console.log('📁 Parent directory:', path.join(__dirname, '..'));
console.log('📄 Checking for index.html...');

const fs = require('fs');
const indexPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(indexPath)) {
    console.log('✅ index.html found at:', indexPath);
    console.log('📄 File size:', fs.statSync(indexPath).size, 'bytes');
} else {
    console.log('❌ index.html not found at:', indexPath);
    try {
        const parentDir = path.join(__dirname, '..');
        const files = fs.readdirSync(parentDir);
        console.log('📂 Parent directory contents:', files);
    } catch (error) {
        console.error('❌ Error reading parent directory:', error);
    }
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

// Test endpoint to verify server is working
app.get('/test', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>AV Master Test</title></head>
        <body>
            <h1>AV Master Backend is Working!</h1>
            <p>Server is running and serving HTML correctly.</p>
            <p>Current time: ${new Date().toISOString()}</p>
            <p><a href="/">Try the main frontend</a></p>
            <p><a href="/health">Check health endpoint</a></p>
        </body>
        </html>
    `);
});

// Serve the main HTML file for all non-API routes (SPA routing)
app.use('*', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    console.log('🔄 SPA route requested:', req.originalUrl);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('❌ Error serving index.html for SPA route:', err);
            res.status(404).json({
                error: 'Route not found',
                message: 'Frontend not available',
                requestedUrl: req.originalUrl
            });
        } else {
            console.log('✅ SPA route served successfully');
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

    // Log the actual Railway URL if available
    if (process.env.RAILWAY_STATIC_URL) {
        console.log(`🚂 Railway URL: ${process.env.RAILWAY_STATIC_URL}`);
    }
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        console.log(`🌍 Public Domain: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }
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
