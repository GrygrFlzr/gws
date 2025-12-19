import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node24',
  sourcemap: true,
  clean: true,
  // Don't bundle these - they need to be actual dependencies
  external: ['postgres'],
  // Bundle everything else including @gws/core
  noExternal: ['@gws/core', 'drizzle-orm', 'discord.js', 'bullmq', 'ioredis', 'opossum']
});
