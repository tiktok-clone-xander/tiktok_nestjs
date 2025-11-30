# =============================================================================
# Build stage
# =============================================================================
FROM node:20-alpine AS builder

# Install build dependencies for canvas and other native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

WORKDIR /app

# Copy workspace package files (root package.json and lock)
COPY package*.json ./

# Copy frontend package.json
COPY tiktok-frontend/package*.json ./tiktok-frontend/

# Install dependencies with cache mount (workspace aware)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspace=tiktok-frontend --include-workspace-root --prefer-offline --no-audit --no-fund

# Copy frontend source code
COPY tiktok-frontend/ ./tiktok-frontend/

# Build the application
WORKDIR /app/tiktok-frontend
RUN npm run build

# =============================================================================
# Production stage
# =============================================================================
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/tiktok-frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/tiktok-frontend/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/tiktok-frontend/public ./public

# Switch to non-root user
USER nextjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Expose port
EXPOSE 3000

# Start the application using standalone server
CMD ["node", "server.js"]
