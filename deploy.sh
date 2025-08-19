#!/bin/bash

# AV Master Game Deployment Script
# This script deploys the game to production

set -e  # Exit on any error

echo "🚀 Starting AV Master Game Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from example..."
    if [ -f "backend/.env" ]; then
        cp backend/.env .env
        print_success "Created .env file from backend/.env"
    else
        print_error "No .env file found. Please create one with your environment variables."
        exit 1
    fi
fi

# Create static directory for nginx
print_status "Creating static directory for nginx..."
mkdir -p static

# Copy frontend files to static directory
print_status "Copying frontend files to static directory..."
cp index.html static/
cp styles.css static/
cp -r js static/
cp -r database static/

# Remove any existing containers
print_status "Stopping any existing containers..."
docker-compose down --remove-orphans

# Build and start containers
print_status "Building and starting containers..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check if backend is healthy
print_status "Checking backend health..."
for i in {1..30}; do
    if curl -f http://localhost:3001/health &> /dev/null; then
        print_success "Backend is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend health check failed after 30 attempts"
        docker-compose logs av-master-backend
        exit 1
    fi
    print_status "Waiting for backend to be ready... (attempt $i/30)"
    sleep 2
done

# Check if nginx is serving the frontend
print_status "Checking frontend accessibility..."
if curl -f http://localhost &> /dev/null; then
    print_success "Frontend is accessible!"
else
    print_error "Frontend is not accessible"
    docker-compose logs nginx
    exit 1
fi

# Show deployment information
print_success "Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:3001"
echo "   Health Check: http://localhost/health"
echo ""
echo "📊 Container Status:"
docker-compose ps
echo ""
echo "📝 Logs:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""
print_success "AV Master Game is now live! 🎉"
