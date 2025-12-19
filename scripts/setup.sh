#!/usr/bin/env bash
set -e

echo "Setting up GWS development environment..."

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 24 ]; then
  echo "Error: Node.js 24 or higher is required"
  exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
  echo "Error: pnpm is not installed. Install it with: npm install -g pnpm"
  exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "Error: Docker is not installed"
  exit 1
fi

echo "✓ Prerequisites checked"

# Copy .env if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠ Please edit .env with your Discord bot token and other credentials"
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Start databases
echo "Starting PostgreSQL and Redis..."
docker compose -f infra/docker-compose.dev.yml up -d

# Wait for PostgreSQL
echo "Waiting for PostgreSQL to be ready..."
until docker compose -f infra/docker-compose.dev.yml exec -T postgres pg_isready -U gws > /dev/null 2>&1; do
  sleep 1
done

echo "✓ Databases are ready"

# Run migrations
echo "Running database migrations..."
pnpm db:migrate

echo ""
echo "✓ Setup complete!"
echo ""
echo "To start development:"
echo "  pnpm dev          # Start all services"
echo "  pnpm bot          # Start only the bot"
echo "  pnpm dashboard    # Start only the dashboard"
echo ""
echo "To stop databases:"
echo "  docker compose -f infra/docker-compose.dev.yml down"
