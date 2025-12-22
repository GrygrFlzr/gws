import { eq } from 'drizzle-orm';
import type { Database } from '../client';
import { guilds } from '../schema';

// TODO: implement channel overrides
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getActionConfig(db: Database, guildId: bigint, channelId: bigint) {
  const guild = await db.query.guilds.findFirst({
    where: eq(guilds.guildId, guildId)
  });

  if (!guild) {
    // Return default config
    return {
      action: {
        react: '⚠️',
        reply: true,
        replyMessage: 'This message contains links to blocked accounts.',
        delete: false,
        logChannel: null
      }
    };
  }

  // TODO: Apply channel-specific overrides
  return {
    action: guild.defaultAction
  };
}
