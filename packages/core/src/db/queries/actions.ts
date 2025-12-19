import { eq, and, sql } from 'drizzle-orm';
import { db } from '../client';
import { actionLog, offenderAnalytics, violationLog } from '../schema';

export async function recordAction(data: {
  messageId: bigint;
  guildId: bigint;
  channelId: bigint;
  authorId: bigint;
  matchedUserIds: bigint[];
  actionsTaken: unknown;
}) {
  return db.insert(actionLog).values({
    ...data,
    createdAt: sql`NOW()`
  });
}

export async function recordOffender(data: {
  guildId: bigint;
  authorId: bigint;
  blacklistedUserIds: bigint[];
  timestamp: Date;
}) {
  // Insert violation log entry
  await db.insert(violationLog).values({
    guildId: data.guildId,
    discordUserId: data.authorId,
    channelId: 0n, // Will be set by caller
    messageId: 0n, // Will be set by caller
    blockedTwitterUserIds: data.blacklistedUserIds,
    blocklistNames: [], // Will be set by caller
    timestamp: data.timestamp
  });

  // Update offender analytics
  const existing = await db.query.offenderAnalytics.findFirst({
    where: (fields, { and, eq }) =>
      and(eq(fields.guildId, data.guildId), eq(fields.discordUserId, data.authorId))
  });

  if (existing) {
    // Update existing record
    const newFrequency = { ...existing.blockedUserFrequency };
    for (const userId of data.blacklistedUserIds) {
      const key = userId.toString();
      newFrequency[key] = (newFrequency[key] || 0) + 1;
    }

    await db
      .update(offenderAnalytics)
      .set({
        totalViolations: existing.totalViolations + 1,
        lastViolationAt: data.timestamp,
        blockedUserFrequency: newFrequency,
        updatedAt: sql`NOW()`
      })
      .where(
        and(
          eq(offenderAnalytics.guildId, data.guildId),
          eq(offenderAnalytics.discordUserId, data.authorId)
        )
      );
  } else {
    // Create new record
    const frequency: Record<string, number> = {};
    for (const userId of data.blacklistedUserIds) {
      frequency[userId.toString()] = 1;
    }

    await db.insert(offenderAnalytics).values({
      guildId: data.guildId,
      discordUserId: data.authorId,
      totalViolations: 1,
      lastViolationAt: data.timestamp,
      firstViolationAt: data.timestamp,
      blockedUserFrequency: frequency,
      updatedAt: sql`NOW()`
    });
  }
}
