import { type DiscordGuildPartial, type DiscordGuildWithCounts, type Snowflake } from '@gws/core';
import { error } from '@sveltejs/kit';

interface RateLimitHeaders {
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  bucket: string;
}

interface RateLimitState {
  remaining: number;
  reset: number;
  bucket: string;
}

interface DiscordErrorResponse {
  code: number;
  message: string;
  errors?: Record<string, unknown>;
  retry_after?: number;
  global?: boolean;
}

export class DiscordAPIClient {
  private rateLimits = new Map<string, RateLimitState>();
  private globalRateLimit: { reset: number } | null = null;

  private parseRateLimitHeaders(headers: Headers): RateLimitHeaders | null {
    const limit = headers.get('x-ratelimit-limit');
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    const resetAfter = headers.get('x-ratelimit-reset-after');
    const bucket = headers.get('x-ratelimit-bucket');

    if (!limit || !remaining || !reset || !resetAfter || !bucket) {
      return null;
    }

    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseFloat(reset),
      resetAfter: parseFloat(resetAfter),
      bucket
    };
  }

  private updateRateLimits(headers: Headers): void {
    const rateLimitInfo = this.parseRateLimitHeaders(headers);
    if (!rateLimitInfo) return;

    this.rateLimits.set(rateLimitInfo.bucket, {
      remaining: rateLimitInfo.remaining,
      reset: rateLimitInfo.reset,
      bucket: rateLimitInfo.bucket
    });

    // Clean up old entries
    const now = Date.now() / 1000;
    for (const [bucket, state] of this.rateLimits.entries()) {
      if (state.reset < now) {
        this.rateLimits.delete(bucket);
      }
    }
  }

  private async checkRateLimit(bucket?: string): Promise<void> {
    const now = Date.now() / 1000;

    // Check global rate limit
    if (this.globalRateLimit && this.globalRateLimit.reset > now) {
      const waitTime = (this.globalRateLimit.reset - now) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.globalRateLimit = null;
    }

    // Check bucket-specific rate limit
    if (bucket) {
      const state = this.rateLimits.get(bucket);
      if (state && state.remaining === 0 && state.reset > now) {
        const waitTime = (state.reset - now) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        this.rateLimits.delete(bucket);
      }
    }
  }

  async fetch<T>(
    endpoint: string,
    token: string,
    options: Parameters<typeof fetch>[1] = {},
    retries = 3
  ): Promise<T> {
    const url = `https://discord.com/api/v10${endpoint}`;
    const bucket = endpoint.split('/').slice(0, 3).join('/'); // Rough bucket estimation

    await this.checkRateLimit(bucket);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      let response: Response | null = null;

      try {
        response = await fetch(url, {
          ...options,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        // Update rate limit state from headers
        this.updateRateLimits(response.headers);

        // Handle successful response
        if (response.ok) {
          return (await response.json()) as T;
        }

        // Handle error responses - read body first
        const errorData: DiscordErrorResponse = await response.json();

        // Handle rate limiting (429)
        if (response.status === 429) {
          const retryAfter = errorData.retry_after || 1;

          if (errorData.global) {
            this.globalRateLimit = {
              reset: Date.now() / 1000 + retryAfter
            };
            console.warn(`Global rate limit hit, waiting ${retryAfter}s`);
          } else {
            console.warn(`Rate limit hit for ${bucket}, waiting ${retryAfter}s`);
          }

          await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
          continue; // Retry
        }

        // Handle token errors (401, 403) - don't retry
        if (response.status === 401) {
          error(401, 'Discord token expired or invalid');
        }

        if (response.status === 403) {
          error(403, `Discord API access denied: ${errorData.message}`);
        }

        // Handle other client errors (400-499) - don't retry
        if (response.status >= 400 && response.status < 500) {
          error(response.status, errorData.message || 'Discord API client error');
        }

        // Handle server errors (500-599) - retry these
        if (response.status >= 500) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.warn(
            `Discord API server error ${response.status}, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${retries})`
          );

          // Don't retry on last attempt
          if (attempt === retries - 1) {
            error(503, 'Discord API temporarily unavailable');
          }

          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          continue;
        }

        // Unknown error
        error(response.status, `Unexpected Discord API error: ${response.status}`);
      } catch (err) {
        // If error was thrown by our error() calls above, re-throw immediately
        if (err && typeof err === 'object' && 'status' in err) {
          throw err;
        }

        // Network errors or JSON parsing errors - retry these
        lastError = err instanceof Error ? err : new Error(String(err));

        // Don't retry network errors on last attempt
        if (attempt === retries - 1) {
          break;
        }

        // Exponential backoff for network errors
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.warn(
          `Network error, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${retries})`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }

    // All retries exhausted
    console.error('Discord API request failed after all retries:', lastError);
    error(503, 'Discord API temporarily unavailable');
  }
}

// Singleton instance
export const discordAPI = new DiscordAPIClient();

// Helper functions for common operations
export async function fetchUserGuilds(token: string) {
  return discordAPI.fetch<DiscordGuildPartial[]>('/users/@me/guilds', token);
}

export async function fetchGuild(guildId: string, token: string) {
  return discordAPI.fetch<DiscordGuildWithCounts>(`/guilds/${guildId}?with_counts=true`, token);
}

export async function fetchGuildChannels(guildId: string, token: string) {
  return discordAPI.fetch<
    Array<{
      id: Snowflake;
      type: number;
      name: string;
      position: number;
      parent_id: Snowflake | null;
    }>
  >(`/guilds/${guildId}/channels`, token);
}

export function hasPermission(permissions: string, permission: bigint): boolean {
  return (BigInt(permissions) & permission) === permission;
}

// Common permission flags
export const Permissions = {
  ADMINISTRATOR: 1n << 3n,
  MANAGE_GUILD: 1n << 5n,
  MANAGE_CHANNELS: 1n << 4n,
  MANAGE_ROLES: 1n << 28n,
  MANAGE_MESSAGES: 1n << 13n,
  VIEW_CHANNEL: 1n << 10n
} as const;
