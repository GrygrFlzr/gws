import { cacheQueries, messageQueries } from '@gws/core';
import type { Match, UserResult } from '@gws/core/twitter';
import { Worker, type Job } from 'bullmq';
import CircuitBreaker from 'opossum';
import { connection } from '../queue/connection';

// Type guards for API responses
interface FxTweetResponse {
  tweet?: {
    author?: {
      id: string;
      screen_name: string;
    };
  };
  user?: {
    id: string;
    screen_name: string;
  };
}

interface VxTweetResponse {
  user_screen_name?: string;
  screen_name?: string;
  id?: number;
}

// Actual API fetch functions
async function fetchFxTwitter(match: Match): Promise<UserResult> {
  let url: string;

  if ('tweetId' in match) {
    url = `https://api.fxtwitter.com/i/status/${match.tweetId}`;
  } else if ('userId' in match) {
    url = `https://api.fxtwitter.com/user_id/${match.userId}`;
  } else {
    url = `https://api.fxtwitter.com/${match.username}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FxTwitter API error: ${response.status}`);
  }

  const data = (await response.json()) as FxTweetResponse;

  // Extract user info based on response type
  if (data.tweet?.author) {
    return {
      userId: data.tweet.author.id,
      username: data.tweet.author.screen_name,
      source: 'fx',
      data
    };
  } else if (data.user) {
    return {
      userId: data.user.id,
      username: data.user.screen_name,
      source: 'fx',
      data
    };
  }

  throw new Error('Unexpected FxTwitter API response format');
}

async function fetchVxTwitter(match: Match): Promise<UserResult> {
  let url: string;

  if ('tweetId' in match) {
    url = `https://api.vxtwitter.com/i/status/${match.tweetId}`;
  } else if ('username' in match) {
    url = `https://api.vxtwitter.com/${match.username}`;
  } else {
    // VxTwitter doesn't support user ID lookups
    throw new Error('VxTwitter does not support user ID lookups');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`VxTwitter API error: ${response.status}`);
  }

  const data = (await response.json()) as VxTweetResponse;

  // VxTwitter returns screen_name but not user ID for tweets
  if (data.user_screen_name) {
    // For tweets, try to get user ID from cache
    const username = data.user_screen_name;
    const cachedUserId = await cacheQueries.getUserIdByUsername(username);

    if (cachedUserId) {
      return {
        userId: cachedUserId,
        username,
        source: 'vx',
        data
      };
    }

    // Return with empty userId - will need resolution later
    return {
      userId: '',
      username,
      source: 'vx',
      data
    };
  } else if (data.screen_name && typeof data.id === 'number') {
    // User profile lookup
    return {
      userId: data.id.toString(),
      username: data.screen_name,
      source: 'vx',
      data
    };
  }

  throw new Error('Unexpected VxTwitter API response format');
}

// Circuit breakers
const fxBreaker = new CircuitBreaker(fetchFxTwitter, {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});

const vxBreaker = new CircuitBreaker(fetchVxTwitter, {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});

type ResolvedUser = {
  userId: string;
  username: string;
  source: 'fx' | 'vx' | 'cache';
  cachedAt?: number;
};

async function resolveTwitterUser(match: Match): Promise<ResolvedUser | null> {
  // 1. Check cache first
  const cached = await cacheQueries.getCachedUser(match);
  if (cached && Date.now() - cached.cachedAt < 24 * 60 * 60 * 1000) {
    return cached as ResolvedUser;
  }

  // 2. Try fx (preferred)
  try {
    if (!fxBreaker.opened) {
      const result = await fxBreaker.fire(match);
      await cacheQueries.cacheUser(result);
      return { ...result, source: 'fx' };
    }
  } catch (err) {
    console.warn('fx failed:', err);
  }

  // 3. Fallback to vx
  try {
    if (!vxBreaker.opened) {
      const result = await vxBreaker.fire(match);

      // vx doesn't give us userId directly for tweets
      // Try to resolve from username
      if ('tweetId' in match && result.username && !result.userId) {
        const userId = await cacheQueries.getUserIdByUsername(result.username);
        if (userId) {
          await cacheQueries.cacheUser({ userId, username: result.username });
          return { userId, username: result.username, source: 'vx' };
        }
      }

      // For username matches or when we have userId
      if (result.userId) {
        await cacheQueries.cacheUser(result);
        return { userId: result.userId, username: result.username, source: 'vx' };
      }

      // Can't get userId from vx - store for later resolution
      return {
        userId: '',
        username: result.username,
        source: 'vx'
      };
    }
  } catch (err) {
    console.warn('vx failed:', err);
  }

  // 4. Use stale cache if available
  if (cached) {
    console.warn('Using stale cache for', match);
    return { ...cached, source: 'cache' } as ResolvedUser;
  }

  // 5. Complete failure - defer for later
  return null;
}

interface UrlResolutionJob {
  messageId: string;
  guildId: string;
  channelId: string;
  authorId: string;
  urls: Match[];
  recoveryAttempt?: boolean;
}

export const urlResolverWorker = new Worker<UrlResolutionJob>(
  'url-resolution',
  async (job: Job<UrlResolutionJob>) => {
    const { urls, messageId, guildId, channelId, authorId } = job.data;

    const resolvedUsers = await Promise.all(urls.map((url) => resolveTwitterUser(url)));

    // Separate resolved from unresolved
    const resolved = resolvedUsers.filter((u): u is ResolvedUser => u !== null && u.userId !== '');
    const unresolved = urls.filter((_, i) => !resolvedUsers[i] || resolvedUsers[i]?.userId === '');

    if (unresolved.length > 0) {
      // Update pending message state
      await messageQueries.updatePendingMessage(BigInt(messageId), {
        state: 'failed',
        resolutionData: {
          resolved: resolved.length,
          unresolved: unresolved.length,
          unresolvedUrls: unresolved
        }
      });
    }

    if (resolved.length > 0) {
      // Queue action decision
      const { actionQueue } = await import('../queue/queues');
      await actionQueue.add('check-blacklist', {
        messageId,
        guildId,
        channelId,
        authorId,
        resolvedUsers: resolved
      });
    }

    return { resolved: resolved.length, unresolved: unresolved.length };
  },
  { connection }
);
