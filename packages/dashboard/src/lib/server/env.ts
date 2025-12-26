import {
  DATABASE_URL,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  ORIGIN
} from '$env/static/private';

const requiredEnvVars = {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  ORIGIN,
  DATABASE_URL
} as const;

// Validate on module load
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value || value.includes('your_') || value.includes('_here')) {
    throw new Error(
      `Missing or invalid environment variable: ${key}\n` +
        `Please copy .env.example to .env and fill in real values.\n` +
        `The server will automatically reload once fixed.`
    );
  }
}

export { requiredEnvVars };
