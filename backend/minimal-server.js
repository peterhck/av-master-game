const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

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
        message: 'Minimal Server Running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test endpoint
app.get('/test', (req, res) => {
    res.status(200).json({
        message: 'Minimal server is working!',
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

// Serve frontend for root
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    console.log('🌐 Serving frontend from:', indexPath);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('❌ Error serving frontend:', err);
            res.status(200).send(`
                <!DOCTYPE html>
                <html>
                <head><title>AV Master Game - Minimal Server</title></head>
                <body>
                    <h1>AV Master Game</h1>
                    <p>Minimal server is running!</p>
                    <p>Frontend files not found at: ${indexPath}</p>
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
    console.log(`🚀 Minimal server running on port ${PORT}`);
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
