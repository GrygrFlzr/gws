import { and, eq, inArray, isNull } from 'drizzle-orm';
import type { Database } from '../client';
import { blocklistEntries, blocklists, guildBlocklistSubscriptions } from '../schema';

export async function getGuildBlocklists(db: Database, guildId: bigint) {
  return db.query.guildBlocklistSubscriptions.findMany({
    where: eq(guildBlocklistSubscriptions.guildId, guildId),
    with: {
      blocklist: {
        with: {
          entries: {
            where: isNull(blocklistEntries.removedAt)
          }
        }
      }
    }
  });
}

export async function checkAgainstBlocklists(
  db: Database,
  guildId: bigint,
  channelId: bigint,
  twitterUserIds: bigint[]
) {
  const result = await db
    .select({
      blocklistId: blocklists.id,
      blocklistName: blocklists.name,
      twitterUserId: blocklistEntries.twitterUserId,
      twitterUsername: blocklistEntries.twitterUsername,
      publicReason: blocklistEntries.publicReason,
      privateReason: blocklistEntries.privateReason,
      channelOverrides: guildBlocklistSubscriptions.channelOverrides
    })
    .from(guildBlocklistSubscriptions)
    .innerJoin(blocklists, eq(guildBlocklistSubscriptions.blocklistId, blocklists.id))
    .innerJoin(blocklistEntries, eq(blocklistEntries.blocklistId, blocklists.id))
    .where(
      and(
        eq(guildBlocklistSubscriptions.guildId, guildId),
        eq(guildBlocklistSubscriptions.enabled, true),
        inArray(blocklistEntries.twitterUserId, twitterUserIds),
        isNull(blocklistEntries.removedAt)
      )
    );

  return result.filter((row) => {
    const overrides = row.channelOverrides?.[channelId.toString()];
    return overrides?.enabled !== false;
  });
}

export async function addBlocklistEntry(
  db: Database,
  data: {
    blocklistId: number;
    twitterUserId: bigint;
    twitterUsername: string;
    publicReason?: string;
    privateReason?: string;
    evidenceUrls?: string[];
    addedByUserId: bigint;
  }
) {
  return db.insert(blocklistEntries).values(data).returning();
}
