# Port Mapping - TikTok Clone Microservices

## 📋 Overview
Danh sách tất cả các port được sử dụng trong hệ thống.

## 🔌 Infrastructure Ports

| Service    | Port  | Description                |
|------------|-------|----------------------------|
| PostgreSQL | 5432  | Database                   |
| Redis      | 6379  | Cache & Session Store      |
| Kafka      | 9092  | Message Broker (External)  |
| Kafka      | 29092 | Message Broker (Internal)  |
| Zookeeper  | 2181  | Kafka Coordinator          |
| RabbitMQ   | 5672  | AMQP Protocol              |
| RabbitMQ   | 15672 | Management UI              |

## 🚀 Microservices Ports

### gRPC Ports (Internal Communication)
| Service              | Port  | Description          |
|---------------------|-------|----------------------|
| Auth Service        | 50051 | gRPC endpoint        |
| Video Service       | 50052 | gRPC endpoint        |
| Interaction Service | 50053 | gRPC endpoint        |
| Notification Service| 50054 | gRPC endpoint        |

### HTTP Ports (Health Checks & Direct Access)
| Service              | Port | Description               |
|---------------------|------|---------------------------|
| API Gateway         | 4000 | Main entry point (native) |
| Auth Service        | 3001 | HTTP health endpoint      |
| Video Service       | 3002 | HTTP health endpoint      |
| Interaction Service | 3003 | HTTP health endpoint      |
| Notification Service| 3004 | HTTP health endpoint      |
| Frontend (Next.js)  | 3006 | Web application           |

## 📊 Monitoring Ports

| Service    | Port | Description      |
|-----------|------|------------------|
| Prometheus| 9090 | Metrics scraping |
| Grafana   | 3005 | Dashboards UI    |

## ⚙️ Environment Variables

```bash
# API Gateway
PORT=3000  # Internal port (4000 when running native, 3000 in Docker)

# Frontend
FRONTEND_PORT=3006
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000

# Microservices HTTP Ports
AUTH_HTTP_PORT=3001
VIDEO_HTTP_PORT=3002
INTERACTION_HTTP_PORT=3003
NOTIFICATION_HTTP_PORT=3004

# Microservices gRPC Ports
GRPC_AUTH_URL=localhost:50051
GRPC_VIDEO_URL=localhost:50052
GRPC_INTERACTION_URL=localhost:50053
GRPC_NOTIFICATION_URL=localhost:50054

# Infrastructure
DB_PORT=5432
REDIS_PORT=6379
KAFKA_BROKERS=localhost:9092
RABBITMQ_URL=amqp://guest:guest@localhost:5672
PROMETHEUS_PORT=9090
```

## 🔍 Port Conflict Check

**KHÔNG CÓ TRÙNG LẶP PORT** ✅

- Frontend: 3006 (Next.js web app)
- API Gateway: 4000 (native) / 3000 (Docker internal)
- Auth Service: 3001 (HTTP) + 50051 (gRPC)
- Video Service: 3002 (HTTP) + 50052 (gRPC)
- Interaction Service: 3003 (HTTP) + 50053 (gRPC)
- Notification Service: 3004 (HTTP) + 50054 (gRPC)
- Grafana: 3005

## 📝 Notes

1. **Docker vs Native**:
   - Docker: Services sử dụng service names (postgres, redis, kafka)
   - Native: Services sử dụng localhost

2. **Development**:
   - Sử dụng file `.env` cho native development
   - Sử dụng `docker-compose.yml` cho Docker deployment

3. **Production**:
   - Thay đổi tất cả secrets trong `.env`
   - Xem xét sử dụng environment-specific configs
   - Enable SSL/TLS cho production endpoints
