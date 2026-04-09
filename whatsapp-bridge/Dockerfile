# WhatsApp Bridge Dockerfile for Railway
FROM node:20-alpine

# Install Chromium for whatsapp-web.js
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Set environment variables for Puppeteer/Chromium
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV LD_LIBRARY_PATH=/usr/lib

# NOTE: Do NOT set ENV PORT here — Railway injects PORT dynamically at runtime.
# The server defaults to 3001 if PORT is not set (local development only).

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Create directories for auth and cache
RUN mkdir -p sessions .wwebjs_auth .wwebjs_cache

# Run as non-root user for security
RUN chown -R node:node /app
USER node

# Expose default port (Railway overrides this with its own PORT)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "const http=require('http'); const port=process.env.PORT||3001; const req=http.get({host:'127.0.0.1',port,path:'/health',timeout:5000},res=>process.exit(res.statusCode===200?0:1)); req.on('error',()=>process.exit(1)); req.on('timeout',()=>{req.destroy();process.exit(1);});"

# Start the bridge server (bind to 0.0.0.0 for Railway)
CMD ["node", "bridge-server.js"]
