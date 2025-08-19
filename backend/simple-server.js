const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

console.log('🚀 Starting simple server...');
console.log('📂 Current directory:', __dirname);
console.log('📂 Parent directory:', path.join(__dirname, '..'));

// CORS - allow all origins
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));

// Handle CORS preflight
app.options('*', cors());

// Manual CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Simple Server Running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test endpoint
app.get('/test', (req, res) => {
    res.status(200).json({
        message: 'Simple server is working!',
        cors: 'enabled',
        timestamp: new Date().toISOString()
    });
});

// CORS test
app.get('/cors-test', (req, res) => {
    res.status(200).json({
        message: 'CORS is working!',
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
    });
});

// Root path - serve frontend
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    console.log('🌐 Trying to serve:', indexPath);
    
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
        console.log('✅ index.html exists');
        res.sendFile(indexPath);
    } else {
        console.log('❌ index.html not found');
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>AV Master Game - Simple Server</title></head>
            <body>
                <h1>AV Master Game</h1>
                <p>Simple server is running!</p>
                <p>Directory: ${__dirname}</p>
                <p>Index path: ${indexPath}</p>
                <p><a href="/health">Health Check</a></p>
                <p><a href="/test">Test Endpoint</a></p>
                <p><a href="/cors-test">CORS Test</a></p>
            </body>
            </html>
        `);
    }
});

// SPA routing - serve index.html for all non-API routes
app.use('*', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.status(404).json({
                error: 'Frontend not available',
                message: 'index.html not found',
                path: req.originalUrl
            });
        }
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Simple server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Frontend: http://localhost:${PORT}/`);
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
