# TikTok Clone - Credentials & Access Information

Tài liệu này tổng hợp tất cả các thông tin đăng nhập và truy cập cho các thành phần trong hệ thống.

---

## 📊 DATABASE & STORAGE

### PostgreSQL (Primary Database)

- **Host:** `postgres` (Docker) / `localhost` (Host)
- **Port:** `5432`
- **Username:** `postgres`
- **Password:** `postgres`
- **Database:** `tiktok_clone`
- **Container:** `tiktok_postgres`
- **Reference:** `docker-compose.yml` - Line 4-20
- **Access URL (pgAdmin):** http://localhost:5050

### pgAdmin (Database Management UI)

- **URL:** http://localhost:5050
- **Email:** `admin@tiktok.com`
- **Password:** `pgadmin123`
- **Container:** `tiktok_pgadmin`
- **Reference:** `docker-compose.yml` - Line 39-56

### Redis (Cache & Session Store)

- **Host:** `redis`
- **Database Alias:** `TikTok Redis`
- **Port:** `6379`

- **Password:** _(no password)_
- **Container:** `tiktok_redis`
- **Reference:** `docker-compose.yml` - Line 22-35

---

## 🔐 AUTHENTICATION & SERVICES

### JWT Secrets

- **File Reference:** `.env.example` Line 23-25
- **Access Token Secret:** `your-access-token-secret-key-change-this-in-production`
  - Location: `docker-compose.yml` - Line 278
  - Env: `JWT_ACCESS_SECRET`
  - Expiration: `15m`
- **Refresh Token Secret:** `your-refresh-token-secret-key-change-this-in-production`
  - Location: `docker-compose.yml` - Line 279
  - Env: `JWT_REFRESH_SECRET`
  - Expiration: `7d`

---

## 📨 MESSAGE QUEUE & EVENTS

### Kafka (Event Streaming)

- **Broker Host:** `kafka:29092` (internal) / `localhost:9092` (external)
- **Port:** `9092` (external), `29092` (internal), `9093` (controller)
- **Container:** `tiktok_kafka`
- **Mode:** KRaft (no ZooKeeper)
- **Reference:** `docker-compose.yml` - Line 57-87
- **Client ID:** `tiktok-service`
- **Group ID:** `tiktok-group`
- **Env File:** `.env.example` - Line 19-21

---

## 🔍 MONITORING & OBSERVABILITY

### Prometheus (Metrics Collection)

- **URL:** http://localhost:9090
- **Config File:** `./monitoring/prometheus.yml`
- **Container:** `tiktok_prometheus`
- **Port:** `9090`
- **Reference:** `docker-compose.yml` - Line 163-186
- **No authentication required**

### Grafana (Dashboards & Visualization)

- **URL:** http://localhost:3005
- **Username:** `admin`
- **Password:** `admin123`
- **Container:** `tiktok_grafana`
- **Port:** `3005` (mapped to 3000)
- **Reference:** `docker-compose.yml` - Line 195-212
- **Data Sources:**
  - Prometheus: http://prometheus:9090
  - Elasticsearch: http://elasticsearch:9200
  - Loki: http://loki:3100

### Alertmanager (Alert Management)

- **URL:** http://localhost:19093
- **Config File:** `./monitoring/alertmanager.yml`
- **Container:** `tiktok_alertmanager`
- **Port:** `19093` (mapped to 9093)
- **Reference:** `docker-compose.yml` - Line 188-193
- **Note:** Port changed from 9093 to 19093 to avoid conflicts
- **Webhook Configuration:**
  - Slack Webhook: Configure via env variable `SLACK_WEBHOOK_URL`
  - PagerDuty Key: Configure via env variable `PAGERDUTY_SERVICE_KEY`

### Loki (Log Aggregation)

- **URL:** http://localhost:3100
- **Config File:** `./monitoring/loki-config.yml`
- **Container:** `tiktok_loki`
- **Port:** `3100`
- **Reference:** `docker-compose.yml` - Line 214-225
- **Storage:** BoltDB + Filesystem (`/loki/chunks`)
- **Note:** No UI - access logs via Grafana
- **Env File:** `.env.monitoring` - Line 2

### Promtail (Log Collection Agent)

- **Config File:** `./monitoring/promtail-config.yml`
- **Container:** `tiktok_promtail`
- **Reference:** `docker-compose.yml` - Line 227-239
- **Sends logs to:** Loki (localhost:3100)

### Prometheus Exporters

#### Postgres Exporter

- **URL:** http://localhost:9187
- **Container:** `tiktok_postgres_exporter`
- **Reference:** `docker-compose.yml` - Line 241-251
- **Connection String:** `postgresql://postgres:postgres@postgres:5432/tiktok_clone?sslmode=disable`

#### Redis Exporter

- **URL:** http://localhost:9121
- **Container:** `tiktok_redis_exporter`
- **Reference:** `docker-compose.yml` - Line 253-262

---

## 📦 ELASTICSEARCH & LOGGING

### Elasticsearch (Search & Analytics)

- **URL:** http://localhost:9200
- **Container:** `tiktok_elasticsearch`
- **Port:** `9200`
- **Authentication:** Disabled (`xpack.security.enabled=false`)
- **Reference:** `docker-compose.yml` - Line 89-108
- **Java Heap:** `-Xms512m -Xmx512m`

### Kibana (Elasticsearch UI)

- **URL:** http://localhost:5601
- **Container:** `tiktok_kibana`
- **Port:** `5601`
- **Reference:** `docker-compose.yml` - Line 110-122
- **Connected to Elasticsearch:** http://elasticsearch:9200
- **No authentication required**

### Logstash (Log Processing)

- **Config File:** `./monitoring/logstash.conf`
- **Container:** `tiktok_logstash`
- **Ports:** `5000` (input), `9600` (API)
- **Reference:** `docker-compose.yml` - Line 124-139
- **Java Heap:** `-Xmx256m -Xms256m`

---

## 🛠️ MICROSERVICES

### Auth Service

- **HTTP Port:** `4001`
- **gRPC Port:** `50051`
- **Container:** `tiktok_auth_service`
- **Database:** PostgreSQL (same instance, `tiktok_clone`)
- **Internal gRPC URL:** `auth-service:50051`
- **Reference:** `docker-compose.yml` - Line 264-296
- **Dependencies:** PostgreSQL, Redis, Kafka

### Video Service

- **HTTP Port:** `4002`
- **gRPC Port:** `50052`
- **Container:** `tiktok_video_service`
- **Database:** PostgreSQL (same instance, `tiktok_clone`)
- **Internal gRPC URL:** `video-service:50052`
- **Reference:** `docker-compose.yml` - Line 298-324
- **Dependencies:** PostgreSQL, Redis, Kafka
- **Uploads Volume:** `/app/uploads`

### Interaction Service

- **HTTP Port:** `4003`
- **gRPC Port:** `50053`
- **Container:** `tiktok_interaction_service`
- **Database:** PostgreSQL (same instance, `tiktok_clone`)
- **Internal gRPC URL:** `interaction-service:50053`
- **Reference:** `docker-compose.yml` - Line 326-349
- **Dependencies:** PostgreSQL, Redis, Kafka

### Notification Service

- **HTTP Port:** `4004`
- **gRPC Port:** `50054`
- **Container:** `tiktok_notification_service`
- **Database:** PostgreSQL (same instance, `tiktok_clone`)
- **Internal gRPC URL:** `notification-service:50054`
- **Dependencies:** PostgreSQL, Redis, Kafka

### API Gateway

- **HTTP Port:** `4000`
- **Container:** `tiktok_api_gateway`
- **Reference:** `docker-compose.yml` - Line 351-378
- **Dependencies:** Auth Service, Video Service, Interaction Service, Redis
- **CORS Origins:** `http://localhost:3006`, `http://localhost:4000`

---

## 📝 ENVIRONMENT FILES

### `.env.example`

- **Location:** Root directory
- **Purpose:** Default environment variables for all services
- **Modification:** Copy to `.env` and update values
- **Contains:** Database, Redis, Kafka, JWT secrets, Service URLs, gRPC endpoints

### `.env.monitoring`

- **Location:** Root directory
- **Purpose:** Monitoring-specific environment variables
- **Contains:** Elasticsearch, Sentry, Prometheus, Alert configuration

### `.env.database-per-service`

- **Location:** Root directory
- **Purpose:** Alternative database configuration (one DB per service)
- **Note:** Currently using shared PostgreSQL instance

---

## 🔗 IMPORTANT REFERENCES

### Configuration Files

| File                             | Purpose                     | Location      |
| -------------------------------- | --------------------------- | ------------- |
| `docker-compose.yml`             | Service orchestration       | Root          |
| `monitoring/prometheus.yml`      | Prometheus configuration    | `monitoring/` |
| `monitoring/loki-config.yml`     | Loki configuration          | `monitoring/` |
| `monitoring/promtail-config.yml` | Log collection              | `monitoring/` |
| `monitoring/alertmanager.yml`    | Alert routing               | `monitoring/` |
| `monitoring/logstash.conf`       | Log processing              | `monitoring/` |
| `.env.example`                   | Service environment vars    | Root          |
| `.env.monitoring`                | Monitoring environment vars | Root          |

### Volume Mappings

- PostgreSQL: `postgres_data`
- Redis: `redis_data`
- Kafka: `kafka_data`
- Elasticsearch: `elasticsearch_data`
- Grafana: `grafana_data`
- Prometheus: `prometheus_data`
- Alertmanager: `alertmanager_data`
- Loki: `loki_data`
- pgAdmin: `pgadmin_data`
- Uploads: `upload_data`

---

## 🔒 SECURITY NOTES

⚠️ **IMPORTANT FOR PRODUCTION:**

1. **Change default passwords:**
   - PostgreSQL: Change from `postgres`
   - pgAdmin: Change from `pgadmin123`
   - Grafana: Change from `admin123`

2. **Update JWT Secrets:**
   - Set strong, unique values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
   - Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **Configure Webhooks:**
   - Set `SLACK_WEBHOOK_URL` for Slack alerts
   - Set `PAGERDUTY_SERVICE_KEY` for PagerDuty integration

4. **Enable Authentication:**
   - Enable Elasticsearch security: `xpack.security.enabled=true`
   - Set Elasticsearch credentials

5. **Network Security:**
   - Change network from `tiktok_network` to restricted networks
   - Use firewall rules to restrict external access to ports

---

## 📞 QUICK ACCESS LINKS

| Service              | URL                    | Notes                                     |
| -------------------- | ---------------------- | ----------------------------------------- |
| API Gateway          | http://localhost:4000  | Main API entry point                      |
| Auth Service         | http://localhost:4001  | HTTP endpoint                             |
| Video Service        | http://localhost:4002  | HTTP endpoint                             |
| Interaction Service  | http://localhost:4003  | HTTP endpoint                             |
| Notification Service | http://localhost:4004  | HTTP endpoint                             |
| Prometheus           | http://localhost:9090  | Metrics                                   |
| Grafana              | http://localhost:3005  | Dashboards (admin/admin123)               |
| Alertmanager         | http://localhost:19093 | Alerts                                    |
| Loki                 | http://localhost:3100  | Logs API (no UI)                          |
| Elasticsearch        | http://localhost:9200  | Search engine                             |
| Kibana               | http://localhost:5601  | Elasticsearch UI                          |
| pgAdmin              | http://localhost:5050  | Database UI (admin@tiktok.com/pgadmin123) |

---

**Last Updated:** December 7, 2025
**Document Version:** 1.0
