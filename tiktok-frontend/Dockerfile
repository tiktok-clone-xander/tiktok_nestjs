# =============================================================================
# Build stage - Shared dependencies from monorepo
# =============================================================================
FROM node:20-alpine AS deps

WORKDIR /monorepo

# Copy root workspace package files
COPY package*.json ./

# Copy frontend package files
COPY tiktok-frontend/package*.json ./tiktok-frontend/

# Install dependencies from root (monorepo workspace)
RUN npm ci && npm cache clean --force

# =============================================================================
# Build stage
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /monorepo

# Copy node_modules from deps stage
COPY --from=deps /monorepo/node_modules ./node_modules
COPY --from=deps /monorepo/tiktok-frontend/node_modules ./tiktok-frontend/node_modules

# Copy frontend source
COPY tiktok-frontend ./tiktok-frontend
COPY package*.json ./

# Set working directory to frontend
WORKDIR /monorepo/tiktok-frontend

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN npm run build

# =============================================================================
# Production stage
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy necessary files from builder
COPY --from=builder /monorepo/tiktok-frontend/public ./public
COPY --from=builder /monorepo/tiktok-frontend/.next/standalone/ ./
COPY --from=builder /monorepo/tiktok-frontend/.next/static ./.next/static

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js
CMD ["node", "server.js"]
