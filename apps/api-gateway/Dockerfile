# =============================================================================
# Build stage - Shared dependencies
# =============================================================================
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy shared libs and proto files
COPY libs ./libs
COPY proto ./proto

# Copy specific service
COPY apps/api-gateway ./apps/api-gateway

# Build the service
RUN npm run build -- api-gateway

# =============================================================================
# Production stage
# =============================================================================
FROM node:20-bullseye-slim

# Create non-root user (Debian)
RUN groupadd -g 1001 nodejs && \
  useradd -m -u 1001 -g nodejs -s /bin/sh nestjs

WORKDIR /app

# Copy built app and shared node_modules from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/proto ./proto

# Create logs and uploads directories and set ownership so non-root user can write
RUN mkdir -p /app/logs /app/uploads/videos /app/uploads/images /app/uploads/thumbnails && \
    chown -R 1001:1001 /app/logs /app/uploads

# Switch to non-root user
USER nestjs

# Expose HTTP port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
CMD ["node", "dist/apps/api-gateway/main.js"]
