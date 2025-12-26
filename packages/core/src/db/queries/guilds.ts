import { eq } from 'drizzle-orm';
import type { Database } from '../client';
import { guilds } from '../schema';
import type { ActionConfig } from '../../discord/types';

export async function getActionConfig(
  db: Database,
  guildId: bigint,
  channelId: bigint
): Promise<{ action: ActionConfig }> {
  const guild = await db.query.guilds.findFirst({
    where: eq(guilds.guildId, guildId)
  });

  const defaultAction: ActionConfig = {
    react: '⚠️',
    reply: true,
    replyMessage: 'This message contains links to blocked accounts.',
    delete: false,
    logChannel: null,
    ...(guild?.defaultAction || {})
  };

  if (!guild) {
    return { action: defaultAction };
  }

  const channelOverride = guild.channelOverrides?.[channelId.toString()];

  return {
    action: {
      ...defaultAction,
      ...channelOverride
    }
  };
}

