#!/bin/bash

# AV Master Game Startup Script for Railway
echo "🚀 Starting AV Master Game..."

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: SUPABASE_URL is not set"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY is not set"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Error: JWT_SECRET is not set"
    exit 1
fi

echo "✅ Environment variables check passed"
echo "📊 Environment: $NODE_ENV"
echo "🔗 Port: $PORT"

# Start the application
cd backend && npm start
