import { type BlacklistedUser } from '@gws/core';
import { Worker, type Job } from 'bullmq';
import type { Client, TextChannel } from 'discord.js';
import { db } from '../db';
import { connection } from '../queue/connection';
import { processActionJob, type ActionDependencies } from './actionExecutor.logic';

interface ActionJob {
  messageId: string;
  guildId: string;
  channelId: string;
  authorId: string;
  isAuthorBot: boolean;
  blacklistedUsers: BlacklistedUser[];
}

export function createActionExecutor(discordClient: Client) {
  const deps: ActionDependencies = {
    db,
    fetchMessage: async (channelId: string, messageId: string) => {
      const channel = (await discordClient.channels.fetch(channelId)) as TextChannel;
      const message = await channel.messages.fetch(messageId).catch(() => null);
      if (!message) return null;

      return {
        react: (emoji: string) => message.react(emoji).then(() => {}),
        reply: (content: string) => message.reply(content).then(() => {}),
        delete: () => message.delete().then(() => {})
      };
    }
  };

  return new Worker<ActionJob>(
    'execute-action',
    async (job: Job<ActionJob>) => {
      return processActionJob(deps, job.data);
    },
    { connection, concurrency: 10 }
  );
}
