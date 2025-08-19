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

# Create production environment file
RUN echo "NODE_ENV=production" > backend/.env.production

# Expose ports
EXPOSE 3001
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "start"]
