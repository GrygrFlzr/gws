import type { Message } from 'discord.js';
import { findUrls } from '@gws/core/twitter';
import { messageQueries } from '@gws/core';
import { urlResolutionQueue } from '../queue/queues';

export async function handleMessage(message: Message) {
  if (!message.guildId) return;

  const urls = findUrls(message.content);

  if (urls.length === 0) return;

  const messageData = {
    messageId: BigInt(message.id),
    guildId: BigInt(message.guildId),
    channelId: BigInt(message.channelId),
    authorId: BigInt(message.author.id),
    content: message.content,
    urls
  };

  // Dual write: Queue and database
  await Promise.all([
    urlResolutionQueue.add('resolve-urls', messageData, {
      jobId: `msg-${message.id}`
    }),
    messageQueries.storePendingMessage(messageData)
  ]);
}
