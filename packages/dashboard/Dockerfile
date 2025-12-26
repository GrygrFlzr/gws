# Stage 1: Build
FROM node:24-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/bot/package.json ./packages/bot/
COPY packages/core/package.json ./packages/core/
COPY packages/dashboard/package.json ./packages/dashboard/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the dashboard
RUN pnpm --filter @gws/dashboard build

# Stage 2: Runtime
FROM node:24-alpine AS runtime

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy manifests and built files
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=builder /app/packages/dashboard/package.json ./packages/dashboard/
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/bot/package.json ./packages/bot/
COPY --from=builder /app/packages/dashboard/build ./packages/dashboard/build

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod --filter @gws/dashboard

WORKDIR /app/packages/dashboard

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]