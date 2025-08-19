const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

console.log('🚀 Starting frontend server...');

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

// Serve static files from the parent directory (where index.html, styles.css, js/ are located)
app.use(express.static(path.join(__dirname, '..'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Frontend Server Running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root path - serve frontend
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    console.log('🌐 Serving frontend from:', indexPath);

    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
        console.log('✅ index.html exists');
        res.sendFile(indexPath);
    } else {
        console.log('❌ index.html not found');
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>AV Master Game - Frontend</title></head>
            <body>
                <h1>AV Master Game</h1>
                <p>Frontend server is running!</p>
                <p>Directory: ${__dirname}</p>
                <p>Index path: ${indexPath}</p>
                <p><a href="/health">Health Check</a></p>
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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`🚀 Frontend server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: https://av-master-frontend-production.up.railway.app/health`);
    console.log(`🌐 Frontend: https://av-master-frontend-production.up.railway.app/`);
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
