const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Static test server running',
        timestamp: new Date().toISOString(),
        staticPath: path.join(__dirname, '..'),
        indexPath: path.join(__dirname, '..', 'index.html')
    });
});

// Serve index.html for root
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).json({
                error: 'Failed to serve index.html',
                path: indexPath,
                message: err.message
            });
        } else {
            console.log('Successfully served index.html');
        }
    });
});

// Catch-all for SPA routing
app.use('*', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html for SPA route:', err);
            res.status(500).json({
                error: 'Failed to serve index.html for SPA route',
                path: indexPath,
                message: err.message
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Static test server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Frontend: http://localhost:${PORT}/`);
    console.log(`📁 Static path: ${path.join(__dirname, '..')}`);
    console.log(`📄 Index path: ${path.join(__dirname, '..', 'index.html')}`);
});
