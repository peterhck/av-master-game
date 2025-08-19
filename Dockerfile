# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd backend && npm install

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

# Start the robust server
CMD ["node", "backend/robust-server.js"]
