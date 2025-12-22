import { createDatabase } from '@gws/core/db';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const db = createDatabase(process.env.DATABASE_URL);
