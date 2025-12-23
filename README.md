# GWS - Bonk System

A Discord bot for VTuber communities to identify and action Twitter links based on blocklists.

## Features

- ID Extraction: Bypasses name changes and link mirrors to identify the true author ID.
- API resolution: Resolution with health-scored rotation between FxTwitter and VxTwitter mirrors.
- Enforcement: Response protocols (React, Delete, Reply) for flagged accounts.
- Dashboard: Interface for server administrators.

## Prerequisites

- Node.js 24.12+
- pnpm 10.26+
- Docker (for PostgreSQL and Redis)

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Initialize Infrastructure:

   ```bash
   pnpm db:start
   pnpm db:migrate
   ```

3. Launch:
   ```bash
   pnpm dev
   ```

## Project Structure

```
gws/
├── packages/
│   ├── core/       # Shared client, schemas, and Twitter parsing
│   ├── bot/        # Discord listener and background workers
│   └── dashboard/  # SvelteKit interface
└── infra/          # Container configurations
```

## Architecture

1. Core: Handles domain parsing and author identification.
2. Bot: Message monitoring and response.
3. Dashboard: Configuration and legal compliance.

## License

0BSD
