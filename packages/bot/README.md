# @gws/bot

Discord bot that monitors messages for Twitter links and enforces blocklists.

## Architecture

The bot consists of several components:

1. Message Handler: Listens to Discord message events and queues URLs for processing
2. URL Resolver Worker: Fetches Twitter user data from APIs with fallback and retry logic
3. Blocklist Checker Worker: Compares resolved users against guild blocklists
4. Action Executor: Performs moderation actions (react, reply, delete, log)
5. Recovery Worker: Re-queues pending messages after crashes

## Development

Run in development mode with hot reload:

```bash
pnpm dev
```

This uses Node 24's native TypeScript support with the `--watch` flag.

## Building

Build for production:

```bash
pnpm build
```

This creates a bundled `dist/index.js` file with all dependencies except `postgres`.

Run production build:

```bash
pnpm start
```

## Configuration

Required environment variables:

- `DISCORD_TOKEN` - Bot token from Discord Developer Portal
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

## Workers

The bot runs multiple BullMQ workers that process jobs from Redis queues:

- URL Resolution Queue: Resolves Twitter URLs to user IDs
- Blocklist Check Queue: Checks users against blocklists
- Action Queue: Executes moderation actions

Workers automatically retry failed jobs with exponential backoff.

## Job Flow

1. User posts message with Twitter URL
2. Message handler parses URLs and creates pending_message record
3. URL resolver fetches user data from fx/vx APIs
4. Blocklist checker compares against guild configuration
5. Action executor performs configured actions (react/reply/delete/log)
6. All actions are logged for audit purposes

## Failure Recovery

The bot handles various failure scenarios:

- API outages: Falls back to vx API, then stale cache, then defers resolution
- Redis crashes: Recovers pending jobs from PostgreSQL on startup
- Discord API errors: Retries with exponential backoff
- Process crashes: Recovery worker re-queues incomplete jobs
