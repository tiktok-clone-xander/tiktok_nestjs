#!/bin/bash

# Development Helper Scripts

function start_infra() {
    echo "🚀 Starting infrastructure (PostgreSQL, Redis, RabbitMQ)..."
    docker-compose up -d postgres redis rabbitmq
    echo "✅ Infrastructure started!"
    echo ""
    echo "Services:"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - RabbitMQ: localhost:5672"
    echo "  - RabbitMQ Management: http://localhost:15672"
}

function stop_infra() {
    echo "🛑 Stopping infrastructure..."
    docker-compose stop postgres redis rabbitmq
    echo "✅ Infrastructure stopped!"
}

function clean() {
    echo "🧹 Cleaning up..."
    rm -rf dist
    rm -rf node_modules
    rm -rf uploads
    rm -rf logs
    echo "✅ Clean completed!"
}

function reset_db() {
    echo "⚠️  WARNING: This will delete all data!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        docker-compose down -v
        docker-compose up -d postgres redis rabbitmq
        echo "✅ Database reset completed!"
    else
        echo "❌ Cancelled"
    fi
}

function logs() {
    service=${1:-""}
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f $service
    fi
}

function health() {
    echo "🏥 Checking service health..."
    echo ""
    
    echo "API Gateway:"
    curl -s http://localhost:3000/health | jq '.' || echo "❌ Not running"
    echo ""
    
    echo "Auth Service:"
    curl -s http://localhost:3001/health | jq '.' || echo "❌ Not running"
    echo ""
    
    echo "PostgreSQL:"
    docker-compose exec postgres pg_isready -U postgres || echo "❌ Not running"
    echo ""
    
    echo "Redis:"
    docker-compose exec redis redis-cli ping || echo "❌ Not running"
    echo ""
}

function test_api() {
    echo "🧪 Testing API..."
    echo ""
    
    echo "1. Register user..."
    curl -X POST http://localhost:3000/api/auth/register \
        -H "Content-Type: application/json" \
        -c cookies.txt \
        -d '{
            "email": "test@example.com",
            "username": "testuser",
            "password": "Password123!",
            "fullName": "Test User"
        }' | jq '.'
    
    echo ""
    echo "2. Login..."
    curl -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -b cookies.txt -c cookies.txt \
        -d '{
            "emailOrUsername": "test@example.com",
            "password": "Password123!"
        }' | jq '.'
    
    echo ""
    echo "3. Get current user..."
    curl -X GET http://localhost:3000/api/auth/me \
        -b cookies.txt | jq '.'
}

function show_help() {
    echo "TikTok Clone - Development Helper"
    echo ""
    echo "Usage: ./scripts.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start-infra    Start infrastructure services"
    echo "  stop-infra     Stop infrastructure services"
    echo "  clean          Clean build artifacts"
    echo "  reset-db       Reset database (WARNING: deletes all data)"
    echo "  logs [service] Show logs (all or specific service)"
    echo "  health         Check service health"
    echo "  test-api       Test API endpoints"
    echo "  help           Show this help message"
}

# Main
case "$1" in
    start-infra)
        start_infra
        ;;
    stop-infra)
        stop_infra
        ;;
    clean)
        clean
        ;;
    reset-db)
        reset_db
        ;;
    logs)
        logs $2
        ;;
    health)
        health
        ;;
    test-api)
        test_api
        ;;
    help|*)
        show_help
        ;;
esac
