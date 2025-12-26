import { schema, type Database, type BlacklistedUser } from '@gws/core';
import { and, eq, isNull } from 'drizzle-orm';

export interface BlocklistDependencies {
  db: Database;
  enqueueAction: (data: {
    messageId: string;
    guildId: string;
    channelId: string;
    authorId: string;
    isAuthorBot: boolean;
    blacklistedUsers: BlacklistedUser[];
  }) => Promise<void>;
}

export async function processBlocklistJob(
  deps: BlocklistDependencies,
  data: {
    messageId: string;
    guildId: string;
    channelId: string;
    authorId: string;
    isAuthorBot: boolean;
    resolvedUsers: Array<{ userId: string; username: string }>;
  }
) {
  const { messageId, guildId, channelId, authorId, isAuthorBot, resolvedUsers } = data;

  const matches = await checkAgainstBlocklists(
    deps.db,
    BigInt(guildId),
    channelId,
    resolvedUsers.map((u) => ({ userId: BigInt(u.userId), username: u.username }))
  );

  if (matches.length > 0) {
    await deps.enqueueAction({
      messageId,
      guildId,
      channelId,
      authorId,
      isAuthorBot,
      blacklistedUsers: matches.map((m) => ({
        userId: m.userId.toString(),
        username: m.username,
        blocklistName: m.blocklistName,
        publicReason: m.publicReason,
        privateReason: m.privateReason
      }))
    });
  }

  return { matches: matches.length };
}

export async function checkAgainstBlocklists(
  db: Database,
  guildId: bigint,
  channelId: string,
  resolvedUsers: Array<{ userId: bigint; username: string }>
) {
  const { blocklists, guildBlocklistSubscriptions, blocklistEntries } = schema;

  // Get all active blocklists for this guild (including subscribed public ones)
  const _blocklists = await db
    .select({
      id: blocklists.id,
      name: blocklists.name,
      visibility: blocklists.visibility,
      channelOverrides: guildBlocklistSubscriptions.channelOverrides,
      twitterUserId: blocklistEntries.twitterUserId,
      twitterUsername: blocklistEntries.twitterUsername,
      publicReason: blocklistEntries.publicReason,
      privateReason: blocklistEntries.privateReason
    })
    .from(blocklists)
    .innerJoin(
      guildBlocklistSubscriptions,
      eq(guildBlocklistSubscriptions.blocklistId, blocklists.id)
    )
    .innerJoin(blocklistEntries, eq(blocklistEntries.blocklistId, blocklists.id))
    .where(
      and(
        eq(guildBlocklistSubscriptions.guildId, guildId),
        eq(guildBlocklistSubscriptions.enabled, true),
        isNull(blocklistEntries.removedAt)
      )
    );

  const matches = [];

  for (const user of resolvedUsers) {
    const blocked = _blocklists.filter((row) => row.twitterUserId === user.userId);

    for (const block of blocked) {
      // Check channel overrides
      const overrides = block.channelOverrides?.[channelId];
      if (overrides?.enabled === false) continue;

      matches.push({
        userId: user.userId,
        username: user.username,
        blocklistId: block.id,
        blocklistName: block.name,
        publicReason: block.publicReason,
        privateReason: block.privateReason
      });
    }
  }

  return matches;
}
