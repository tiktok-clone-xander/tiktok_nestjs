# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm ci

COPY libs ./libs
COPY proto ./proto
COPY apps/interaction-service ./apps/interaction-service

RUN npm run build interaction-service

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nestjs && \
    adduser -S nestjs -u 1001

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist/apps/interaction-service ./dist
COPY --from=builder /app/proto ./proto

RUN chown -R nestjs:nestjs /app

USER nestjs

EXPOSE 3003 50053

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]
