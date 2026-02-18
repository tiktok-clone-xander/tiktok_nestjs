# Monitoring Stack: NestJS + Prometheus + Grafana + Loki

## Kiến trúc tổng quan

Hệ thống monitoring gồm 2 luồng dữ liệu chính:

### 1. Luồng Metrics (Số liệu) — Prometheus

```
┌─────────────────────────────────────────────────────────────────────┐
│                        METRICS FLOW                                │
│                                                                     │
│  NestJS App (prom-client)                                          │
│    │                                                                │
│    ├── Tạo metrics: request count, duration, errors...             │
│    │                                                                │
│    └── Expose endpoint GET /metrics                                │
│         │         (dạng text/plain, format Prometheus)              │
│         │                                                           │
│         ▼                                                           │
│  Prometheus (port 9090)                                            │
│    │                                                                │
│    ├── Cứ mỗi 15s, Prometheus gọi GET /metrics tới mỗi service    │
│    ├── Lưu dữ liệu vào time-series database (TSDB)                │
│    │                                                                │
│    └── Grafana query từ Prometheus bằng PromQL                     │
│         │                                                           │
│         ▼                                                           │
│  Grafana (port 3005)                                               │
│    └── Hiển thị dashboard: biểu đồ, gauge, table...               │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Luồng Logs (Nhật ký) — Loki

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOG FLOW                                    │
│                                                                     │
│  NestJS App (Winston logger)                                       │
│    │                                                                │
│    ├── Ghi log ra Console (stdout) dạng JSON                       │
│    │     → Docker capture stdout thành container logs              │
│    │                                                                │
│    └── Ghi log ra File (/logs/*.log) dạng JSON                     │
│                                                                     │
│         │                                                           │
│         ▼                                                           │
│  Promtail (log collector)                                          │
│    │                                                                │
│    ├── Đọc Docker container logs (qua /var/lib/docker/containers)  │
│    ├── Đọc log files (qua /logs/*.log)                             │
│    ├── Gắn labels: service name, level, container...               │
│    │                                                                │
│    └── Push logs tới Loki                                          │
│         │                                                           │
│         ▼                                                           │
│  Loki (port 3100)                                                  │
│    │                                                                │
│    ├── Nhận logs từ Promtail                                       │
│    ├── Index theo labels (KHÔNG index nội dung log)                │
│    ├── Lưu trữ compressed chunks                                  │
│    │                                                                │
│    └── Grafana query từ Loki bằng LogQL                            │
│         │                                                           │
│         ▼                                                           │
│  Grafana (port 3005)                                               │
│    └── Hiển thị logs: search, filter by label, live tail...        │
└─────────────────────────────────────────────────────────────────────┘
```

## Các services và ports

| Service    | Port | Mô tả                              |
| ---------- | ---- | ----------------------------------- |
| Prometheus | 9090 | Thu thập & lưu metrics              |
| Grafana    | 3005 | Dashboard UI (admin/admin123)       |
| Loki       | 3100 | Lưu trữ logs (giống Prometheus cho logs) |
| Promtail   | —    | Thu thập logs, push tới Loki        |

## Cách truy cập

- **Grafana**: http://localhost:3005 (user: `admin`, pass: `admin123`)
- **Prometheus**: http://localhost:9090 (query metrics trực tiếp)
- **Loki**: http://localhost:3100 (API only, dùng qua Grafana)

## Cấu trúc file

```
monitoring/
├── README.md                               ← File này
├── prometheus.yml                          ← Cấu hình Prometheus: scrape targets
├── loki-config.yml                         ← Cấu hình Loki: storage, retention
├── promtail-config.yml                     ← Cấu hình Promtail: đọc logs từ đâu
└── grafana/
    ├── provisioning/
    │   ├── datasources/
    │   │   └── datasources.yml             ← Auto-config datasources cho Grafana
    │   └── dashboards/
    │       └── dashboards.yml              ← Auto-load dashboards cho Grafana
    └── dashboards/
        └── nestjs-overview.json            ← Dashboard mẫu
```
