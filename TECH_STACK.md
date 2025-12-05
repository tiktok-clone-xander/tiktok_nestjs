# 🚀 Technology Stack - TikTok Clone

## Backend Architecture

### Core Framework

- **NestJS** - Progressive Node.js framework with TypeScript support
- **Microservices Pattern** - 5 independent services with gRPC communication
- **TypeScript** - Static typing for Node.js

### Microservices (5 Services)

1. **API Gateway** (Port 3000) - Request routing & aggregation
2. **Auth Service** (Port 3001) - JWT authentication, user credentials
3. **Video Service** (Port 3002) - Video management, upload, metadata
4. **Interaction Service** (Port 3003) - Likes, comments, shares
5. **Notification Service** (Port 3004) - Real-time notifications

### Communication

- **gRPC** - Service-to-service communication (protocol buffers)
- **Kafka** - Event streaming, message queue
- **Socket.IO** - Real-time WebSocket communication
- **REST API** - HTTP endpoints via gateway

### Data Layer

- **TypeORM** - ORM for database operations
- **PostgreSQL** - Primary relational database
- **Redis** - Caching layer, session storage, rate limiting
- **Database per Service** - Independent schemas for each microservice

### Infrastructure & DevOps

- **Docker & Docker Compose** - Containerization & orchestration
- **PostgreSQL 15** - Database server
- **Redis 7** - Cache & session store
- **Kafka & Zookeeper** - Message streaming
- **Prometheus** - Metrics collection

### Performance & Optimization

- **DataLoader** - Batch loading & N+1 query prevention
- **Redis Caching** - Multi-level caching strategy
- **Request Caching Interceptor** - HTTP response caching
- **Compression** - gzip middleware
- **Rate Limiting** - DDoS protection
- **Connection Pooling** - Database connection optimization

### Testing & Quality

- **Jest** - Unit testing framework
- **Supertest** - HTTP assertion library
- **E2E Tests** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## Frontend Architecture

### Core Framework

- **Next.js 16** - React meta-framework with SSR/SSG
- **TypeScript** - Static typing
- **React 19** - UI library with hooks

### Styling & UI

- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS transformations

### State Management

- **Redux Toolkit** - Centralized state management
- **React Context API** - Local state management

### Data Fetching & Caching

- **SWR (Stale-While-Revalidate)** - Client-side data fetching
- **Axios** - HTTP client with interceptors
- **Query string params** - URL-based filtering

### Real-time Features

- **Socket.IO Client** - WebSocket communication
- **Native Web Sockets** - Fallback support

### Performance Optimization

- **Image Optimization** - Next.js built-in image optimization
- **Code Splitting** - Automatic route-based splitting
- **Lazy Loading** - Dynamic imports for components
- **Production Builds** - Tree-shaking, minification

### Testing

- **Vitest** - Unit testing framework
- **@testing-library/react** - React component testing
- **Mock Service Worker** - API mocking for tests

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Hot Module Replacement** - Live reloading

---

## Key Features Implemented

### User Management

- ✅ User registration & login (JWT-based)
- ✅ Profile management
- ✅ Follow/Unfollow system
- ✅ User discovery

### Video Management

- ✅ Video upload with thumbnail generation
- ✅ Video streaming
- ✅ Video metadata (title, description, tags)
- ✅ Video search & filtering
- ✅ Video recommendations

### Interactions

- ✅ Like/Unlike videos & comments
- ✅ Comment system with nested replies
- ✅ Share functionality
- ✅ View counter tracking

### Real-time Features

- ✅ Notifications (follow, like, comment, share)
- ✅ Real-time updates via WebSocket
- ✅ Online status

### Performance Features

- ✅ Multi-level caching (Redis)
- ✅ DataLoader for batch queries
- ✅ Request compression
- ✅ Rate limiting
- ✅ Database connection pooling
- ✅ Frontend bundle optimization

---

## Development Tools & Scripts

### NPM Scripts

```bash
npm run build          # Build all services
npm run start:auth    # Dev: Auth service
npm run start:video   # Dev: Video service
npm run start:interaction  # Dev: Interaction service
npm run start:notification # Dev: Notification service
npm run start:gateway # Dev: API Gateway
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run lint          # ESLint
npm run format        # Prettier format
npm run db:reset      # Reset database
npm run migration:run # Run migrations
npm run seed:run      # Seed data
```

### Docker Commands

```bash
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose -f docker-compose.infra.yml up -d  # Start infrastructure
```

---

## Project Structure

```
/
├── apps/
│   ├── api-gateway/        # Main API entry point
│   ├── auth-service/       # User authentication
│   ├── video-service/      # Video management
│   ├── interaction-service/ # Likes, comments, shares
│   └── notification-service/ # Notifications
├── libs/
│   ├── common/            # Shared utilities & interceptors
│   ├── database/          # Database connection & config
│   ├── auth-db/           # Auth database schemas
│   ├── video-db/          # Video database schemas
│   ├── interaction-db/    # Interaction database schemas
│   ├── notification-db/   # Notification database schemas
│   ├── kafka/             # Kafka producer/consumer
│   ├── redis/             # Redis client & utilities
│   └── grpc/              # gRPC service definitions
├── proto/                 # Protocol Buffer files
├── tiktok-frontend/       # Next.js frontend
├── docker-compose.yml     # Docker services
├── package.json           # Dependencies
└── nest-cli.json          # NestJS config
```

---

## Environment & Versions

- **Node.js**: 18+
- **NPM**: 9+
- **Docker**: Latest
- **PostgreSQL**: 15
- **Redis**: 7
- **Kafka**: Latest

---

## Performance Metrics

### Backend Optimization Targets

- Query response time: < 100ms
- Cache hit ratio: > 80%
- Database connection pool: 20-50 connections
- Rate limit: 1000 requests/minute per IP

### Frontend Optimization

- Bundle size: < 300KB
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

---

## Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration
- ✅ Input validation with class-validator
- ✅ Environment variable protection
- ✅ SQL injection prevention via TypeORM parameterization

---

## Monitoring & Logging

- **Prometheus** - Metrics collection
- **Winston** - Application logging
- **Console logs** - Development debugging
- **Docker logs** - Service monitoring

---

**Last Updated**: December 5, 2025
**Status**: Production Ready ✅
