# =============================================================================
# Build stage
# =============================================================================
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Copy package files
COPY tiktok-frontend/package*.json ./

# Install dependencies
RUN npm i

# Copy source code
COPY tiktok-frontend/ .

# Build the application
RUN npm run build

# =============================================================================
# Production stage
# =============================================================================
FROM node:20-bullseye-slim

# Create non-root user
RUN groupadd -g 1001 nodejs && \
  useradd -m -u 1001 -g nodejs -s /bin/sh nextjs

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
