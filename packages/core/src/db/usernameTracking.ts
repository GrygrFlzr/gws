import { sql, and, eq, ne } from 'drizzle-orm';
import { db } from './client';
import { twitterUsernameHistory, usernameChangeAnalytics } from './schema';

export async function recordUsername(userId: bigint, username: string, source: string) {
  // Try to insert new username
  const result = await db
    .insert(twitterUsernameHistory)
    .values({
      twitterUserId: userId,
      username: username,
      firstSeen: sql`NOW()`,
      lastSeen: sql`NOW()`,
      discoveredVia: source,
      isCurrent: true
    })
    .onConflictDoUpdate({
      target: [twitterUsernameHistory.twitterUserId, twitterUsernameHistory.username],
      set: {
        lastSeen: sql`NOW()`
      }
    })
    .returning();

  const wasNewUsername = result.length > 0;

  if (wasNewUsername) {
    // Mark previous usernames as non-current
    await db
      .update(twitterUsernameHistory)
      .set({
        isCurrent: false
      })
      .where(
        and(
          eq(twitterUsernameHistory.twitterUserId, userId),
          ne(twitterUsernameHistory.username, username)
        )
      );

    await db
      .insert(usernameChangeAnalytics)
      .values({
        twitterUserId: userId,
        totalUsernameChanges: 1,
        lastChangeAt: sql`NOW()`
      })
      .onConflictDoUpdate({
        target: usernameChangeAnalytics.twitterUserId,
        set: {
          totalUsernameChanges: sql`${usernameChangeAnalytics.totalUsernameChanges} + 1`,
          lastChangeAt: sql`NOW()`
        }
      });

    console.log(`Username change detected: ${userId} -> ${username}`);
  }

  return wasNewUsername;
}

// Helper function that combines API fetching with username tracking
// This should be called from the bot package after fetching from APIs
export async function trackUserFromApiResult(
  userId: bigint,
  username: string,
  source: 'fx' | 'vx'
) {
  await recordUsername(userId, username, `${source}_api`);
}
