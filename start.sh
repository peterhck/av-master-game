#!/bin/bash

# AV Master Game Startup Script for Railway
echo "🚀 Starting AV Master Game..."

# Set default values if not provided
export NODE_ENV=${NODE_ENV:-"production"}
export PORT=${PORT:-3001}

# Use test values if environment variables are not set
export SUPABASE_URL=${SUPABASE_URL:-"https://test.supabase.co"}
export SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-"test-key"}
export OPENAI_API_KEY=${OPENAI_API_KEY:-"test-key"}
export JWT_SECRET=${JWT_SECRET:-"test-secret"}

echo "✅ Environment variables set"
echo "📊 Environment: $NODE_ENV"
echo "🔗 Port: $PORT"

# Start the application
echo "🔄 Starting backend server..."
cd backend && npm start
