# @gws/bot

Discord bot that monitors messages for Twitter links and enforces blocklists.

## Architecture

The bot consists of:

1. Message Handler: Listens to Discord message events, parses Twitter links, and creates pending_message records.
2. URL Resolver Worker: Uses the apiClient to resolve Twitter links to User IDs.
3. Blocklist Checker Worker: Compares resolved users against guild blocklist subscriptions.
4. Action Executor: Performs moderation actions (react, reply, delete, log).
5. Recovery Worker: Re-queues pending messages from the database after system restarts.

## Development

Run in development mode:

```bash
pnpm dev
```

## Building

Build for production:

```bash
pnpm build
```

## Job Flow

1. Detection: Message handler identifies Twitter links.
2. Resolution: URL resolver identifies the author ID.
3. Validation: Blocklist checker validates ID against active lists.
4. Enforcement: Action executor applies response protocols.
5. Analytics: Actions are logged for review.

## Failure Recovery

- API Outages: Client rotates mirrors and falls back to database cache.
- Redis Resilience: Pending jobs are tracked in PostgreSQL and re-queued on startup.
- Process Protection: Recovery worker ensures violations are handled after a crash.
