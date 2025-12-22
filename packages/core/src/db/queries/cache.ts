import { eq } from 'drizzle-orm';
import type { Match } from '../../twitter/types';
import type { Database } from '../client';
import { twitterUserCache } from '../schema';

export async function getCachedUser(db: Database, match: Match) {
  let userId: bigint | undefined;

  if ('tweetId' in match) {
    // For tweets, we need to fetch from somewhere else
    return null;
  } else if ('userId' in match) {
    userId = BigInt(match.userId);
  } else if ('username' in match) {
    const result = await db.query.twitterUserCache.findFirst({
      where: eq(twitterUserCache.username, match.username)
    });
    return result
      ? {
          userId: result.userId.toString(),
          username: result.username,
          cachedAt: result.cachedAt.getTime()
        }
      : null;
  }

  if (!userId) return null;

  const result = await db.query.twitterUserCache.findFirst({
    where: eq(twitterUserCache.userId, userId)
  });

  return result
    ? {
        userId: result.userId.toString(),
        username: result.username,
        cachedAt: result.cachedAt.getTime()
      }
    : null;
}

export async function cacheUser(
  db: Database,
  data: { userId: string; username: string; data?: unknown }
) {
  return db
    .insert(twitterUserCache)
    .values({
      userId: BigInt(data.userId),
      username: data.username,
      data: data.data
    })
    .onConflictDoUpdate({
      target: twitterUserCache.userId,
      set: {
        username: data.username,
        lastChecked: new Date(),
        data: data.data
      }
    });
}

export async function getUserIdByUsername(db: Database, username: string) {
  const result = await db.query.twitterUserCache.findFirst({
    where: eq(twitterUserCache.username, username)
  });
  return result ? result.userId.toString() : null;
}
