# @gws/core

Shared core for the GWS project.

## What's Included

- Database schemas and migrations (Drizzle ORM)
- Twitter API Client: Resolution using fx/vx mirrors with health scoring and circuit breakers.
- Twitter URL parsing with REDOS protection
- BullMQ job type definitions
- Types for Discord and Twitter entities

## Usage

This package is consumed by the bot and dashboard packages. It is not meant to be run standalone.

```ts
import { blocklistQueries, db } from '@gws/core/db';
import { urlResolutionQueue } from '@gws/core/queue';
import { apiClient } from '@gws/core/twitter';
```

## Database Operations

Generate new migration after schema changes:

```bash
pnpm db:generate
```

Run pending migrations:

```bash
pnpm db:migrate
```

Open database GUI:

```bash
pnpm db:studio
```

## API Client

The apiClient provides:

- Routing: Prioritizes API mirrors (FxTwitter vs VxTwitter) based on success rates and latency.
- Database Fallback: Falls back to cache stored in the database if upstream APIs fail.
- Circuit Breaking: Prevents failures during API outages.

## Twitter URL Parser

The URL parser is designed to:

- Extract Twitter URLs from Discord messages
- Support domains (twitter.com, x.com, fxtwitter.com, vxtwitter.com, nitter, etc.)
- Identify tweet IDs, user IDs, and usernames
- Protect against REDOS attacks
- Process 10,000 character messages
