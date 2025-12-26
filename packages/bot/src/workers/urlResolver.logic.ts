import { apiClient, cacheQueries, messageQueries, type Database } from '@gws/core';
import type { Match } from '@gws/core/twitter';

export interface ResolverDependencies {
  db: Database;
  enqueueBlacklistCheck: (data: {
    messageId: string;
    guildId: string;
    channelId: string;
    authorId: string;
    isAuthorBot: boolean;
    resolvedUsers: Array<{ userId: string; username: string; source: string; hashtags?: string[] }>;
  }) => Promise<void>;
}

type ResolvedUser = {
  userId: string;
  username: string;
  source: 'fx' | 'vx' | 'cache';
  cachedAt?: number;
  hashtags?: string[];
};

async function resolveTwitterUser(db: Database, match: Match): Promise<ResolvedUser | null> {
  // 1. Check cache first
  const cached = await cacheQueries.getCachedUser(db, match);
  if (cached && Date.now() - (cached.cachedAt as number) < 24 * 60 * 60 * 1000) {
    return cached as ResolvedUser;
  }

  // 2. Use the centralized adaptive API client
  try {
    const result = await apiClient.fetchUser(db, match);

    // If we got a result but no userId (common with vx for tweets), try to resolve from cache
    if (result.username && !result.userId) {
      const userId = await cacheQueries.getUserIdByUsername(db, result.username);
      if (userId) {
        await cacheQueries.cacheUser(db, {
          userId,
          username: result.username,
          hashtags: result.hashtags
        });
        return {
          userId,
          username: result.username,
          source: result.source,
          hashtags: result.hashtags
        };
      }
    }

    if (result.userId) {
      await cacheQueries.cacheUser(db, result);
      return {
        userId: result.userId,
        username: result.username,
        source: result.source,
        hashtags: result.hashtags
      };
    }

    // Still no userId - return what we have for later resolution
    return {
      userId: '',
      username: result.username,
      source: result.source,
      hashtags: result.hashtags
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

export async function processUrlResolutionJob(
  deps: ResolverDependencies,
  data: {
    messageId: string;
    guildId: string;
    channelId: string;
    authorId: string;
    isAuthorBot: boolean;
    urls: Match[];
  }
) {
  const { urls, messageId, guildId, channelId, authorId, isAuthorBot } = data;

  const resolvedUsers = await Promise.all(urls.map((url) => resolveTwitterUser(deps.db, url)));

  // Separate resolved from unresolved
  const resolved = resolvedUsers.filter((u): u is ResolvedUser => u !== null && u.userId !== '');
  const unresolved = urls.filter((_, i) => !resolvedUsers[i] || resolvedUsers[i]?.userId === '');

  if (unresolved.length > 0) {
    // Update pending message state
    await messageQueries.updatePendingMessage(deps.db, BigInt(messageId), {
      state: 'failed',
      resolutionData: {
        resolved: resolved.length,
        unresolved: unresolved.length,
        unresolvedUrls: unresolved
      }
    });
  }

  if (resolved.length > 0) {
    await deps.enqueueBlacklistCheck({
      messageId,
      guildId,
      channelId,
      authorId,
      isAuthorBot,
      resolvedUsers: resolved.map((u) => ({
        userId: u.userId,
        username: u.username,
        source: u.source,
        hashtags: u.hashtags
      }))
    });
  }

  return { resolved: resolved.length, unresolved: unresolved.length };
}
