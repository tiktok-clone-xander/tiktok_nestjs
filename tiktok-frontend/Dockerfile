# ============================================
# 1) BASE IMAGE
# ============================================
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ============================================
# 2) DEPENDENCIES (tối ưu cache)
# ============================================
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ============================================
# 3) BUILDER (build .next)
# ============================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================================
# 4) RUNNER (chỉ giữ production artifacts)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat && \
    addgroup -S nextjs && adduser -S nextjs -G nextjs

# output build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# copy production modules
COPY --from=deps /app/node_modules ./node_modules

RUN chown -R nextjs:nextjs /app
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
