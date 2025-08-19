#!/bin/bash

# Test startup script for Railway
echo "🚀 Starting AV Master Game Test Server..."

# Set default values
export NODE_ENV=${NODE_ENV:-"production"}
export PORT=${PORT:-3001}

echo "✅ Test environment variables set"
echo "📊 Environment: $NODE_ENV"
echo "🔗 Port: $PORT"

# Start the test server
node test-server.js
