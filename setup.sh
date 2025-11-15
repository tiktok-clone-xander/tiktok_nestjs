#!/bin/bash

# TikTok Clone - Setup Script
# This script helps you set up the development environment

set -e

echo "🚀 TikTok Clone - Setup Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20.x or higher from https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm ${NPM_VERSION}${NC}"
fi

if ! command_exists docker; then
    echo -e "${YELLOW}⚠️  Docker is not installed (optional but recommended)${NC}"
    echo "Install from https://www.docker.com/"
else
    DOCKER_VERSION=$(docker -v)
    echo -e "${GREEN}✅ Docker ${DOCKER_VERSION}${NC}"
fi

if command_exists docker-compose || command_exists docker compose; then
    echo -e "${GREEN}✅ Docker Compose is available${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Setting up environment..."

if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    
    # Generate JWT secrets
    echo ""
    echo "🔐 Generating JWT secrets..."
    JWT_ACCESS_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    
    # Update .env file
    sed -i "s|JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}|g" .env
    sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}|g" .env
    
    echo -e "${GREEN}✅ JWT secrets generated and saved to .env${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping...${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Start infrastructure (PostgreSQL, Redis, RabbitMQ):"
echo "   docker-compose up -d postgres redis rabbitmq"
echo ""
echo "2. Start services (in separate terminals):"
echo "   npm run start:auth"
echo "   npm run start:video"
echo "   npm run start:interaction"
echo "   npm run start:gateway"
echo ""
echo "OR run everything with Docker:"
echo "   docker-compose up -d"
echo ""
echo "3. Check health:"
echo "   curl http://localhost:3000/health"
echo ""
echo "4. Access Swagger docs:"
echo "   http://localhost:3000/api/docs"
echo ""
echo "Happy coding! 🎉"
