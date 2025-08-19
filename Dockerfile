# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install frontend dependencies
RUN cd frontend && npm install --production=false

# Copy application files
COPY . .

# Verify frontend files are copied
RUN ls -la /app/
RUN echo "Checking for index.html..."
RUN if [ -f /app/index.html ]; then echo "✅ index.html found"; else echo "❌ index.html not found"; fi
RUN if [ -f /app/styles.css ]; then echo "✅ styles.css found"; else echo "❌ styles.css not found"; fi
RUN if [ -d /app/js ]; then echo "✅ js directory found"; else echo "❌ js directory not found"; fi

# Create production environment file
RUN echo "NODE_ENV=production" > frontend/.env.production

# Expose ports
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=5 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start the frontend server
WORKDIR /app/frontend
CMD ["sh", "-c", "node server.js"]
