# @gws/core

Shared core functionality for the GWS project.

## What's Included

- Database schemas and migrations (Drizzle ORM)
- Twitter URL parsing with REDOS protection
- Twitter API clients (fx/vx) with circuit breakers and fallback
- BullMQ job type definitions
- Shared TypeScript types

## Usage

This package is consumed by the bot and dashboard packages. It is not meant to be run standalone.

Import from other packages:

```ts
import { blocklistQueries, db } from '@gws/core/db';
import { urlResolutionQueue } from '@gws/core/queue';
import { findUrls } from '@gws/core/twitter';
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

## Testing

Run tests:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test:watch
```

Run performance benchmarks:

```bash
pnpm bench
```

The test suite includes correctness tests and performance benchmarks for the Twitter URL parser, including REDOS attack protection.

## Twitter URL Parser

The URL parser is designed to:

- Extract Twitter/X URLs from Discord messages
- Support multiple Twitter domains (twitter.com, x.com, fxtwitter.com, vxtwitter.com, etc.)
- Identify tweet IDs, user IDs, and usernames
- Protect against catastrophic backtracking (REDOS attacks)
- Process 10,000 character messages efficiently

Performance characteristics:

- Simple URLs: ~800 nanoseconds
- Complex messages: ~6 microseconds
- 1000 URLs in one string: ~3.5 milliseconds
- Protected against REDOS: all pathological cases complete in under 100ms
