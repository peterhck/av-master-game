#!/bin/bash

echo "🔍 Starting debug mode..."
echo "📂 Current directory: $(pwd)"
echo "📂 Directory contents:"
ls -la

echo "📦 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

echo "🔧 Checking backend directory..."
if [ -d "backend" ]; then
    echo "✅ Backend directory exists"
    echo "📂 Backend contents:"
    ls -la backend/
    
    echo "📦 Backend package.json:"
    cat backend/package.json | head -20
    
    echo "🔧 Installing dependencies..."
    npm install --production=false
    cd backend && npm install --production=false && cd ..
    
    echo "🚀 Starting server..."
    cd backend && node server.js
else
    echo "❌ Backend directory not found"
    exit 1
fi
