import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../../.env');

if (!existsSync(envPath)) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Missing .env file!');
  console.log(
    '\x1b[33m%s\x1b[0m',
    '→ Copy .env.example to .env and fill in your Discord credentials'
  );
  console.log('\x1b[36m%s\x1b[0m', '  cp .env.example .env\n');
  process.exit(1);
}

const envContent = readFileSync(envPath, 'utf-8');
const hasPlaceholders = envContent.includes('your_') || envContent.includes('_here');

if (hasPlaceholders) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  Warning: .env contains placeholder values');
  console.log('\x1b[36m%s\x1b[0m', '→ Update .env with real Discord OAuth credentials\n');
}
