# Database Seeding Guide

Hướng dẫn setup và seed dữ liệu demo cho TikTok Clone.

## Quick Start

```bash
# 1. Start infrastructure (PostgreSQL, Redis)
docker compose -f docker-compose.infra.yml up -d postgres redis

# 2. Sync database schemas (creates tables)
npm run db:sync

# 3. Seed all databases with demo data
npm run seed:all
```

Hoặc sử dụng script tự động:

```powershell
./scripts/quick-seed.ps1
```

## Available Commands

| Command                    | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `npm run db:sync`          | Synchronize all database schemas (creates tables)            |
| `npm run seed:all`         | Seed all databases (Auth, Video, Interaction)                |
| `npm run seed:auth`        | Seed only Auth database (users)                              |
| `npm run seed:video`       | Seed only Video database (requires auth first)               |
| `npm run seed:interaction` | Seed only Interaction database (requires auth & video first) |
| `npm run db:reset:all`     | Reset and re-seed all databases                              |

## Database Structure

Hệ thống sử dụng kiến trúc Database-per-Service:

### Auth Database (`tiktok_auth`)

- **users**: User accounts
- **refresh_tokens**: JWT refresh tokens

### Video Database (`tiktok_video`)

- **videos**: Video content
- **video_views**: View analytics

### Interaction Database (`tiktok_interaction`)

- **likes**: Video likes
- **comments**: Video comments
- **comment_likes**: Comment likes
- **follows**: User follow relationships
- **shares**: Video shares

### Notification Database (`tiktok_notification`)

- **notifications**: User notifications
- **notification_deliveries**: Delivery status
- **notification_preferences**: User preferences

## Demo Data

### Users (8 users)

All users have password: `Password123!`

| Email                      | Username      |
| -------------------------- | ------------- |
| demo@tiktok.local          | demo          |
| john.doe@example.com       | johndoe       |
| jane.smith@example.com     | janesmith     |
| mike.johnson@example.com   | mikejohnson   |
| sarah.williams@example.com | sarahwilliams |
| david.brown@example.com    | davidbrown    |
| emily.davis@example.com    | emilydavis    |
| alex.wilson@example.com    | alexwilson    |

### Videos (10 videos)

- Sample videos with various titles, descriptions, and tags
- Distributed among users
- Pre-populated view counts, likes, comments

### Interactions

- Follow relationships between users
- Likes on videos
- Comments with replies
- Comment likes

## Environment Variables

Create a `.env` file (or copy from `.env.database-per-service`):

```env
# All databases run on the same PostgreSQL instance
AUTH_DB_HOST=localhost
AUTH_DB_PORT=5432
AUTH_DB_USERNAME=postgres
AUTH_DB_PASSWORD=postgres
AUTH_DB_NAME=tiktok_auth

VIDEO_DB_HOST=localhost
VIDEO_DB_PORT=5432
VIDEO_DB_USERNAME=postgres
VIDEO_DB_PASSWORD=postgres
VIDEO_DB_NAME=tiktok_video

INTERACTION_DB_HOST=localhost
INTERACTION_DB_PORT=5432
INTERACTION_DB_USERNAME=postgres
INTERACTION_DB_PASSWORD=postgres
INTERACTION_DB_NAME=tiktok_interaction

NOTIFICATION_DB_HOST=localhost
NOTIFICATION_DB_PORT=5432
NOTIFICATION_DB_USERNAME=postgres
NOTIFICATION_DB_PASSWORD=postgres
NOTIFICATION_DB_NAME=tiktok_notification

NODE_ENV=development
```

## Accessing Services

After seeding, you can:

1. **Start all services:**

   ```bash
   npm run start:gateway
   npm run start:auth
   npm run start:video
   npm run start:interaction
   npm run start:notification
   ```

2. **Access APIs:**
   - API Gateway: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api

3. **Access pgAdmin:**
   - URL: http://localhost:5050
   - Email: admin@tiktok.com
   - Password: pgadmin123

## Troubleshooting

### Database connection issues

- Ensure PostgreSQL is running: `docker compose -f docker-compose.infra.yml ps`
- Check if databases exist: `docker exec tiktok_postgres psql -U postgres -c "\l"`

### Seeding fails

- Make sure `db:sync` ran successfully first
- Check database connections in `.env`
- For individual services, seed in order: auth → video → interaction

### Re-seeding

To clear and re-seed:

```bash
# Drop and recreate volumes
docker compose -f docker-compose.infra.yml down -v postgres
docker compose -f docker-compose.infra.yml up -d postgres

# Wait for init script to run, then sync and seed
npm run db:sync
npm run seed:all
```
