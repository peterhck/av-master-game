#!/bin/bash

# Minimal startup script for testing
echo "🚀 Starting AV Master Game (Minimal Mode)..."

# Set default values for testing
export SUPABASE_URL=${SUPABASE_URL:-"https://test.supabase.co"}
export SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-"test-key"}
export OPENAI_API_KEY=${OPENAI_API_KEY:-"test-key"}
export JWT_SECRET=${JWT_SECRET:-"test-secret"}
export NODE_ENV=${NODE_ENV:-"production"}
export PORT=${PORT:-3001}

echo "✅ Using test environment variables"
echo "📊 Environment: $NODE_ENV"
echo "🔗 Port: $PORT"

# Start the application
cd backend && npm start
