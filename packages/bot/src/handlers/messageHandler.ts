import { messageQueries } from '@gws/core';
import type { Message, PartialMessage } from 'discord.js';
import { db } from '../db';
import { extractMessageData } from '../logic/messageProcessor';
import { urlResolutionQueue } from '../queue/queues';

export async function handleMessage(message: Message | PartialMessage) {
  if (message.partial) {
    try {
      message = await message.fetch();
    } catch {
      return;
    }
  }

  // Ignore our own messages to avoid loops
  if (message.author.id === message.client.user?.id) return;

  const data = extractMessageData({
    id: message.id,
    guildId: message.guildId,
    channelId: message.channelId,
    author: {
      id: message.author.id,
      bot: message.author.bot
    },
    content: message.content,
    messageSnapshots: message.messageSnapshots?.values()
  });

  if (!data) return;

  const messageData = {
    ...data,
    messageId: BigInt(data.messageId),
    guildId: BigInt(data.guildId),
    channelId: BigInt(data.channelId),
    authorId: BigInt(data.authorId),
    urls: data.urls
  };

  // Dual write: Queue and database
  await Promise.all([
    urlResolutionQueue.add('resolve-urls', messageData, {
      jobId: `msg-${message.id}`
    }),
    messageQueries.storePendingMessage(db, messageData)
  ]);
}
