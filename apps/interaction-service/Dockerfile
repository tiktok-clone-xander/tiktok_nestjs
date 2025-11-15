# =============================================================================
# Build stage - Shared dependencies
# =============================================================================
FROM node:20-alpine AS builder

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
COPY apps/interaction-service ./apps/interaction-service

# Build the service
RUN npm run build -- interaction-service

# =============================================================================
# Production stage
# =============================================================================
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy built app and shared node_modules from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/proto ./proto

# Switch to non-root user
USER nestjs

# Expose gRPC and HTTP ports
EXPOSE 3003 50053

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/apps/interaction-service/main.js"]
