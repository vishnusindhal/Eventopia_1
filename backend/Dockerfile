FROM node:20-alpine

# Set directory
WORKDIR /app

# Copy package files first for efficient layering/caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

# Set non-root user for security
USER node

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
