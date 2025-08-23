FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean install
RUN npm ci --only=production --no-audit --no-fund

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "server.js"]