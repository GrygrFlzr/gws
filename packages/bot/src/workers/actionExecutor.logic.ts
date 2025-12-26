import {
  actionQueries,
  determineActions,
  guildQueries,
  messageQueries,
  type BlacklistedUser,
  type Database
} from '@gws/core';

export interface ActionDependencies {
  db: Database;
  fetchMessage: (
    channelId: string,
    messageId: string
  ) => Promise<{
    react: (emoji: string) => Promise<void>;
    reply: (content: string) => Promise<void>;
    delete: () => Promise<void>;
  } | null>;
}

export async function processActionJob(
  deps: ActionDependencies,
  data: {
    messageId: string;
    guildId: string;
    channelId: string;
    authorId: string;
    isAuthorBot: boolean;
    blacklistedUsers: BlacklistedUser[];
  }
) {
  const { messageId, guildId, channelId, authorId, isAuthorBot, blacklistedUsers } = data;

  const config = await guildQueries.getActionConfig(deps.db, BigInt(guildId), BigInt(channelId));

  const message = await deps.fetchMessage(channelId, messageId);

  if (!message) {
    await messageQueries.updatePendingMessage(deps.db, BigInt(messageId), {
      state: 'failed'
    });
    return { success: false, reason: 'message_not_found' };
  }

  const actionsToTake = determineActions(config.action, isAuthorBot, blacklistedUsers);
  const actionsTaken: Array<{ type: string; [key: string]: unknown }> = [];

  for (const action of actionsToTake) {
    try {
      if (action.type === 'react' && action.emoji) {
        await message.react(action.emoji);
        actionsTaken.push({ type: 'react', emoji: action.emoji });
      } else if (action.type === 'reply' && action.content) {
        await message.reply(action.content);
        actionsTaken.push({ type: 'reply', content: action.content });
      } else if (action.type === 'delete') {
        await message.delete();
        actionsTaken.push({ type: 'delete' });
      }
    } catch (err) {
      console.error(`Failed to execute ${action.type}:`, err);
    }
  }

  // Record action
  await actionQueries.recordAction(deps.db, {
    messageId: BigInt(messageId),
    guildId: BigInt(guildId),
    channelId: BigInt(channelId),
    authorId: BigInt(authorId),
    matchedUserIds: blacklistedUsers.map((u) => BigInt(u.userId)),
    actionsTaken: actionsTaken
  });

  // Update pending message
  await messageQueries.updatePendingMessage(deps.db, BigInt(messageId), {
    state: 'actioned',
    actionData: actionsTaken,
    completedAt: new Date()
  });

  // Track offender (Skip for bots)
  if (!isAuthorBot) {
    await actionQueries.recordOffender(deps.db, {
      guildId: BigInt(guildId),
      authorId: BigInt(authorId),
      channelId: BigInt(channelId),
      messageId: BigInt(messageId),
      blacklistedUserIds: blacklistedUsers.map((u) => BigInt(u.userId)),
      timestamp: new Date()
    });
  }

  return { success: true, actions: actionsTaken };
}
