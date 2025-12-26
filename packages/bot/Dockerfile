# Stage 1: Build
FROM node:24-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace configuration and all package manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/bot/package.json ./packages/bot/
COPY packages/core/package.json ./packages/core/
COPY packages/dashboard/package.json ./packages/dashboard/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the bot
RUN pnpm --filter @gws/bot build

# Stage 2: Runtime
FROM node:24-alpine AS runtime

RUN apk add --no-cache libc6-compat python3 make g++
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy ONLY the built bundle directory (contains generated package.json)
COPY --from=builder /app/packages/bot/dist ./dist

WORKDIR /app/dist

# Install production dependencies for the standalone bundle
# This will re-compile native modules specifically for the bundle
RUN pnpm install

# Singular optimized bundle
CMD ["node", "index.js"]