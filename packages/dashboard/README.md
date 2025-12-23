# @gws/dashboard

SvelteKit dashboard for managing the GWS Bonk System.

## Features

- Management: Interface with server metrics.
- Guild List: Active servers and database caching to minimize Discord API rate limits.
- Configuration: Manage blocklist subscriptions and response protocols (React, Delete, Reply).
- Legal: Privacy Policy, Terms of Service, and Data Deletion Request handling.

## Performance

The dashboard implements:

- Caching: User guild lists are cached in the database for 10 minutes.
- Prerendering: Static legal pages are prerendered.

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

## Remote Functions

The dashboard uses functions for server-side execution from client components (found in \*.remote.ts files).

## Authentication

Uses Discord OAuth2. Users must have "Manage Server" permissions.
