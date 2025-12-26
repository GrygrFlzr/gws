import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(import.meta.dirname, '../../.env');

const REQUIRED_VARS = ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'ORIGIN', 'DATABASE_URL'];

const missingInEnv = REQUIRED_VARS.filter((v) => !process.env[v]);

if (missingInEnv.length > 0 && !existsSync(envPath)) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Missing required environment variables!');
  console.log('\x1b[33m%s\x1b[0m', '→ For local development, copy .env.example to .env:');
  console.log('\x1b[36m%s\x1b[0m', '  cp .env.example .env\n');
  console.log(
    '\x1b[33m%s\x1b[0m',
    '→ In production, ensure these variables are set in your environment:'
  );
  console.log('\x1b[36m%s\x1b[0m', `  ${missingInEnv.join(', ')}\n`);
  process.exit(1);
}

if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  const hasPlaceholders = envContent.includes('your_') || envContent.includes('_here');

  if (hasPlaceholders) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  Warning: .env contains placeholder values');
    console.log('\x1b[36m%s\x1b[0m', '→ Update .env with real Discord OAuth credentials\n');
  }
}
