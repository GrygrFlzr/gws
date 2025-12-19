# GWS - Message Filtering Discord Bot

A Discord bot that filters messages containing Twitter/X links based on configurable blocklists.

## Prerequisites

- Node.js 24.12+
- pnpm 10.26+
- Docker (for local PostgreSQL and Redis)

## Quick Start

Install dependencies:

```bash
pnpm install --recursive
```

Start development databases:

```bash
docker compose -f infra/docker-compose.dev.yml up -d
```

Set up environment:

```bash
cp .env.example .env
# Edit .env with your configuration
```

Generate and run database migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

Start development servers:

```bash
pnpm dev
```

This starts both the Discord bot and the web dashboard in parallel.

## Project Structure

```
gws/
├── packages/
│   ├── core/       # Shared business logic, database schemas, Twitter parsing
│   ├── bot/        # Discord bot and background workers
│   └── dashboard/  # SvelteKit web interface for management
├── infra/          # Docker configurations
└── scripts/        # Utility scripts
```

## Available Commands

Development:

- `pnpm dev` - Start all services in development mode
- `pnpm bot` - Start only the Discord bot
- `pnpm dashboard` - Start only the web dashboard

Database:

- `pnpm db:generate` - Generate new migrations from schema changes
- `pnpm db:migrate` - Run pending migrations
- `pnpm db:studio` - Open Drizzle Studio (database GUI)

Testing:

- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm bench` - Run performance benchmarks

Code quality:

- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm check` - Type-check all packages

Build:

- `pnpm build` - Build all packages for production

## Configuration

Environment variables are defined in `.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `DISCORD_TOKEN` - Discord bot token
- `DISCORD_CLIENT_ID` - Discord application client ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth2 client secret

## Architecture

The system consists of three main components:

1. Core Package: Shared logic
   - Database schemas (Drizzle ORM)
   - Twitter URL parsing
   - API clients for fetching Twitter user data
2. Discord Bot
   - Listens for messages
   - Queues Twitter URLs for resolution
   - Executes moderation actions based on blocklist configuration
3. Web Dashboard
   - SvelteKit application for managing blocklists, viewing analytics, and configuring guild settings

Jobs are queued using BullMQ with Redis for persistence and automatic retries.

## License

0BSD
