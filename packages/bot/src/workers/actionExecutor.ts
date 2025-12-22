import { actionQueries, guildQueries, messageQueries } from '@gws/core';
import { Worker, type Job } from 'bullmq';
import type { Client, TextChannel } from 'discord.js';
import { db } from '../db';
import { connection } from '../queue/connection';

interface BlacklistedUser {
  userId: string;
  username: string;
  blocklistName: string;
  publicReason?: string;
  privateReason?: string;
}

interface ActionJob {
  messageId: string;
  guildId: string;
  channelId: string;
  authorId: string;
  blacklistedUsers: BlacklistedUser[];
}

export function createActionExecutor(discordClient: Client) {
  return new Worker<ActionJob>(
    'execute-action',
    async (job: Job<ActionJob>) => {
      const { messageId, guildId, channelId, authorId, blacklistedUsers } = job.data;

      const config = await guildQueries.getActionConfig(db, BigInt(guildId), BigInt(channelId));

      const channel = (await discordClient.channels.fetch(channelId)) as TextChannel;
      const message = await channel.messages.fetch(messageId).catch(() => null);

      if (!message) {
        await messageQueries.updatePendingMessage(db, BigInt(messageId), {
          state: 'failed'
        });
        return { success: false, reason: 'message_not_found' };
      }

      const actions: Array<{ type: string; [key: string]: unknown }> = [];

      // 1. React
      if (config.action.react) {
        try {
          await message.react(config.action.react as string);
          actions.push({ type: 'react', emoji: config.action.react });
        } catch (err) {
          console.error('Failed to react:', err);
        }
      }

      // 2. Reply
      if (config.action.reply) {
        try {
          const replyContent = formatReply(blacklistedUsers, config.action.replyMessage as string);
          await message.reply(replyContent);
          actions.push({ type: 'reply', content: replyContent });
        } catch (err) {
          console.error('Failed to reply:', err);
        }
      }

      // 3. Delete
      if (config.action.delete) {
        try {
          await message.delete();
          actions.push({ type: 'delete' });
        } catch (err) {
          console.error('Failed to delete:', err);
        }
      }

      // 4. Record action
      await actionQueries.recordAction(db, {
        messageId: BigInt(messageId),
        guildId: BigInt(guildId),
        channelId: BigInt(channelId),
        authorId: BigInt(authorId),
        matchedUserIds: blacklistedUsers.map((u) => BigInt(u.userId)),
        actionsTaken: actions
      });

      // 5. Update pending message
      await messageQueries.updatePendingMessage(db, BigInt(messageId), {
        state: 'actioned',
        actionData: actions,
        completedAt: new Date()
      });

      // 6. Track offender
      await actionQueries.recordOffender(db, {
        guildId: BigInt(guildId),
        authorId: BigInt(authorId),
        blacklistedUserIds: blacklistedUsers.map((u) => BigInt(u.userId)),
        timestamp: new Date()
      });

      return { success: true, actions };
    },
    { connection, concurrency: 10 }
  );
}

function formatReply(users: BlacklistedUser[], defaultMessage?: string): string {
  const msg = defaultMessage || '⚠️ This message contains links to blocked accounts.';

  const byBlocklist = users.reduce(
    (acc, u) => {
      if (!acc[u.blocklistName]) acc[u.blocklistName] = [];
      acc[u.blocklistName].push(u);
      return acc;
    },
    {} as Record<string, BlacklistedUser[]>
  );

  let reply = msg + '\n\n';

  for (const [listName, listUsers] of Object.entries(byBlocklist)) {
    reply += `**${listName}:**\n`;
    for (const user of listUsers) {
      reply += `• @${user.username}`;
      if (user.publicReason) {
        reply += ` - ${user.publicReason}`;
      }
      reply += '\n';
    }
  }

  return reply;
}
