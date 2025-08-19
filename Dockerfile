# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install --production=false
RUN cd backend && npm install --production=false

# Verify express is installed
RUN cd backend && node -e "require('express'); console.log('Express is installed successfully')"

# Copy application files
COPY . .

# Verify frontend files are copied
RUN ls -la /app/
RUN ls -la /app/backend/
RUN echo "Checking for index.html..."
RUN if [ -f /app/index.html ]; then echo "✅ index.html found"; else echo "❌ index.html not found"; fi
RUN if [ -f /app/styles.css ]; then echo "✅ styles.css found"; else echo "❌ styles.css not found"; fi
RUN if [ -d /app/js ]; then echo "✅ js directory found"; else echo "❌ js directory not found"; fi

# Make startup scripts executable
RUN chmod +x start.sh start-test.sh start-minimal.sh start-debug.sh

# Create production environment file
RUN echo "NODE_ENV=production" > backend/.env.production

# Expose ports
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the test server to verify deployment
WORKDIR /app/backend
CMD ["node", "test-startup.js"]
