const express = require('express');
const path = require('path');

const app = express();

console.log('🚀 Starting test server...');
console.log('📂 Current directory:', __dirname);
console.log('📂 Parent directory:', path.join(__dirname, '..'));

// Basic static file serving
app.use(express.static(path.join(__dirname, '..')));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Test Server Running',
        timestamp: new Date().toISOString(),
        directory: __dirname
    });
});

// Root path
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
            <head><title>Test Server</title></head>
            <body>
                <h1>Test Server Running</h1>
                <p>Directory: ${__dirname}</p>
                <p>Index path: ${indexPath}</p>
                <p><a href="/health">Health Check</a></p>
            </body>
            </html>
        `);
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
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
