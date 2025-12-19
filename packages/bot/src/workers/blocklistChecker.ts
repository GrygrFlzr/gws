import { db, schema } from '@gws/core/db';
import { eq, and, isNull } from 'drizzle-orm';

export async function checkAgainstBlocklists(
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
