#!/bin/bash

# AV Master Game Startup Script for Railway
echo "🚀 Starting AV Master Game..."

# Set default values if not provided
export NODE_ENV=${NODE_ENV:-"production"}
export PORT=${PORT:-3001}

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "https://test.supabase.co" ]; then
    echo "⚠️  Warning: SUPABASE_URL not set or using test value"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ "$SUPABASE_SERVICE_ROLE_KEY" = "test-key" ]; then
    echo "⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not set or using test value"
fi

if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "test-key" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY not set or using test value"
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "test-secret" ]; then
    echo "⚠️  Warning: JWT_SECRET not set or using test value"
fi

echo "✅ Environment variables set"
echo "📊 Environment: $NODE_ENV"
echo "🔗 Port: $PORT"

# Start the application
echo "🔄 Starting backend server..."
cd backend && npm start
