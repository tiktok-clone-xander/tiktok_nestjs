# =============================================================================
# Build stage - Shared dependencies from monorepo
# =============================================================================
FROM node:20-bullseye-slim AS deps

WORKDIR /monorepo

# No build dependencies needed in deps stage; only in builder

# Copy root workspace package files
COPY package*.json ./

# Copy frontend package files
COPY tiktok-frontend/package*.json ./tiktok-frontend/

# Install dependencies from root (monorepo workspace)
RUN npm ci && npm cache clean --force

# =============================================================================
# Build stage
# =============================================================================
FROM node:20-bullseye AS builder

WORKDIR /monorepo

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy frontend source and package files
COPY tiktok-frontend ./tiktok-frontend
COPY tiktok-frontend/package*.json ./tiktok-frontend/
COPY package*.json ./

# Set working directory to frontend
WORKDIR /monorepo

# Install all workspace dependencies (include dev) at the monorepo root so
# Turbopack and PostCSS plugins that may be hoisted are available.
RUN npm ci --workspaces --include=dev --ignore-scripts=false --no-audit --no-fund

# Rebuild native bindings for the frontend workspace (ensures lightningcss binary exists)
WORKDIR /monorepo/tiktok-frontend
# Install frontend workspace-specific deps so frontend `node_modules` exists
# (this ensures `tailwindcss`, PostCSS plugins, and other dev deps are resolvable
# when Turbopack's root is set to the frontend folder).
RUN npm ci --workspace=tiktok-frontend --include=dev --ignore-scripts=false --no-audit --no-fund
# Rebuild native bindings for the frontend workspace (ensures lightningcss binary exists)
RUN npm rebuild lightningcss --workspace=tiktok-frontend || true
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

WORKDIR /monorepo/tiktok-frontend
# Ensure the platform-specific prebuilt LightningCSS binary package is installed
# (this package provides the native `.node` binary required by @tailwindcss/node).
RUN npm install lightningcss-linux-x64-gnu@1.30.2 --workspace=tiktok-frontend --no-audit --no-fund || true
RUN npm install @tailwindcss/oxide-linux-x64-gnu@4.1.17 --workspace=tiktok-frontend --no-audit --no-fund || true

RUN npm run build

# =============================================================================
# Production stage
# =============================================================================
FROM node:20-bullseye-slim AS runner

WORKDIR /app

# Create non-root user (Debian)
RUN groupadd -g 1001 nodejs && \
  useradd -m -u 1001 -g nodejs -s /bin/sh nextjs

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy necessary files from builder
COPY --from=builder /monorepo/tiktok-frontend/public ./public

# Copy the built Next.js app and node_modules from the builder so we can
# run `next start` in the runner. Using the full `.next` output avoids
# requiring the `standalone` output which may not be produced in all setups.
COPY --from=builder /monorepo/tiktok-frontend/.next ./.next
COPY --from=builder /monorepo/tiktok-frontend/node_modules ./node_modules
COPY --from=builder /monorepo/tiktok-frontend/package*.json ./

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
CMD ["npm", "run", "start"]
