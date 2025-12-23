import { apiClient, cacheQueries, messageQueries } from '@gws/core';
import type { Match } from '@gws/core/twitter';
import { Worker, type Job } from 'bullmq';
import { db } from '../db';
import { connection } from '../queue/connection';

type ResolvedUser = {
  userId: string;
  username: string;
  source: 'fx' | 'vx' | 'cache';
  cachedAt?: number;
};

async function resolveTwitterUser(match: Match): Promise<ResolvedUser | null> {
  // 1. Check cache first
  const cached = await cacheQueries.getCachedUser(db, match);
  if (cached && Date.now() - cached.cachedAt < 24 * 60 * 60 * 1000) {
    return cached as ResolvedUser;
  }

  // 2. Use the centralized adaptive API client
  try {
    const result = await apiClient.fetchUser(db, match);

    // If we got a result but no userId (common with vx for tweets), try to resolve from cache
    if (result.username && !result.userId) {
      const userId = await cacheQueries.getUserIdByUsername(db, result.username);
      if (userId) {
        await cacheQueries.cacheUser(db, { userId, username: result.username });
        return { userId, username: result.username, source: result.source };
      }
    }

    if (result.userId) {
      await cacheQueries.cacheUser(db, result);
      return {
        userId: result.userId,
        username: result.username,
        source: result.source
      };
    }

    // Still no userId - return what we have for later resolution
    return {
      userId: '',
      username: result.username,
      source: result.source
    };
  } catch (err) {
    console.error('API resolution failed:', err);
  }

  // 3. Use stale cache if available
  if (cached) {
    console.warn('Using stale cache for', match);
    return { ...cached, source: 'cache' } as ResolvedUser;
  }

  // 4. Complete failure
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
      await messageQueries.updatePendingMessage(db, BigInt(messageId), {
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
