const express = require('express');
const app = express();

// Simple health check
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'AV Master Game Test Server is running',
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 3001
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
