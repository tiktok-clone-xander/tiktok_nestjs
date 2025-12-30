#!/bin/bash
# Docker PostgreSQL init script
# This script creates all required databases for the TikTok clone microservices

set -e

echo "🚀 Creating TikTok Clone databases..."

# Create databases for each microservice
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create Auth Service Database
    CREATE DATABASE tiktok_auth;
    GRANT ALL PRIVILEGES ON DATABASE tiktok_auth TO postgres;

    -- Create Video Service Database
    CREATE DATABASE tiktok_video;
    GRANT ALL PRIVILEGES ON DATABASE tiktok_video TO postgres;

    -- Create Interaction Service Database
    CREATE DATABASE tiktok_interaction;
    GRANT ALL PRIVILEGES ON DATABASE tiktok_interaction TO postgres;

    -- Create Notification Service Database
    CREATE DATABASE tiktok_notification;
    GRANT ALL PRIVILEGES ON DATABASE tiktok_notification TO postgres;

    -- Enable UUID extension for all databases
    \c tiktok_auth
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    \c tiktok_video
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    \c tiktok_interaction
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    \c tiktok_notification
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL

echo "✅ All databases created successfully!"
echo ""
echo "📋 Created databases:"
echo "   - tiktok_auth"
echo "   - tiktok_video"
echo "   - tiktok_interaction"
echo "   - tiktok_notification"
