# @gws/dashboard

SvelteKit web dashboard for managing blocklists and viewing analytics.

## Development

Run in development mode:

```bash
pnpm dev
```

The dashboard will be available at http://localhost:5173

## Building

Build for production:

```bash
pnpm build
```

Preview production build:

```bash
pnpm preview
```

## Features

- Guild Management: Configure blocklists, actions, and channel overrides
- Blocklist Management: Create and manage both private and public blocklists
- User Search: Search Twitter users by username or ID, view username history
- Analytics: View frequent offenders and violation patterns
- Audit Logs: Track all blocklist changes with reasons

## Remote Functions

The dashboard uses SvelteKit's experimental remote functions feature for server-side operations. Functions defined in `src/lib/server/functions.ts` can be called from client components.

Example:

```svelte
<script>
  import { getBlocklists } from '$lib/server/functions';

  const blocklists = getBlocklists(guildId);
</script>

{#await blocklists}
  Loading...
{:then data}
  <!-- Display blocklists -->
{/await}
```

## Authentication

The dashboard uses Discord OAuth2 for authentication. Users must have "Manage Server" permission to configure a guild's settings.

## Configuration

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `DISCORD_CLIENT_ID` - Discord OAuth2 client ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth2 client secret
- `ORIGIN` - Base URL of the dashboard (e.g., https://gws.example.com)

`.env.example` (root):

```env
# Database
DATABASE_URL=postgresql://gws:dev_password@localhost:5432/gws

# Redis
REDIS_URL=redis://localhost:6379

# Discord Bot
DISCORD_TOKEN=your_bot_token_here

# Discord OAuth (for dashboard)
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# Dashboard
ORIGIN=http://localhost:5173

# Node environment
NODE_ENV=development
```
