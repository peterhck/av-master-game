# Use Node.js 18 LTS as base image
FROM node:18-alpine

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

# Make startup scripts executable
RUN chmod +x start.sh start-test.sh start-minimal.sh

# Create production environment file
RUN echo "NODE_ENV=production" > backend/.env.production

# Expose ports
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the backend API server only
CMD ["npm", "run", "start:backend"]
