import dotenv from 'dotenv';
import { defineConfig } from 'tsdown';

dotenv.config({ path: '../../.env' });
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node24',
  sourcemap: true,
  clean: true,
  minify: true,
  plugins: [
    {
      name: 'strip-discord-sharding',
      transform(code, id) {
        if (id.includes('discord.js/src/client/Client.js')) {
          // Strip the _eval method
          let newCode = code.replace(
            /_eval\(script\) \{[\s\S]*?return eval\(script\);[\s\S]*?\}/,
            '_eval(script) { throw new Error("eval disabled") }'
          );
          // Strip ShardClientUtil usage in constructor
          newCode = newCode.replace(
            /this\.shard = ShardClientUtil\.singleton\(this\);/,
            'this.shard = null;'
          );
          return newCode;
        }
        // If it's a sharding related file, make it empty to allow tree-shaking
        if (id.includes('discord.js/src/sharding/')) {
          return 'module.exports = {};';
        }
      }
    }
  ],
  // Don't bundle these - they need to be actual dependencies
  external: ['bufferutil', 'postgres', 'utf-8-validate', 'zlib-sync'],
  // Bundle core logic and libraries that we want to optimize/tree-shake
  noExternal: ['@gws/core', 'drizzle-orm', 'discord.js', 'bullmq', 'ioredis', 'opossum']
});
