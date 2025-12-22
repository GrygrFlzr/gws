import { loadEnvFile } from 'node:process';
import type { Config } from 'drizzle-kit';

loadEnvFile('../../.env');
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  verbose: true,
  strict: true
} satisfies Config;
