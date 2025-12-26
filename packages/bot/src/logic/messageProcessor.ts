import { findUrls } from '@gws/core/twitter';
import type { Match } from '@gws/core/twitter';

export interface ExtractedMessageData {
  messageId: string;
  guildId: string;
  channelId: string;
  authorId: string;
  isAuthorBot: boolean;
  content: string;
  urls: Match[];
}

/**
 * Extracts all relevant data and URLs from a Discord message,
 * including forwarded snapshots.
 */
export function extractMessageData(message: {
  id: string;
  guildId: string | null;
  channelId: string;
  author: { id: string; bot: boolean };
  content: string;
  messageSnapshots?: Iterable<{ content: string }>;
}): ExtractedMessageData | null {
  if (!message.guildId) return null;

  const urls: Match[] = findUrls(message.content);

  // Handle forwarded messages
  if (message.messageSnapshots) {
    for (const snapshot of message.messageSnapshots) {
      urls.push(...findUrls(snapshot.content));
    }
  }

  if (urls.length === 0) return null;

  // De-duplicate URLs
  const seen = new Set<string>();
  const uniqueUrls = urls.filter((m) => {
    const key =
      'tweetId' in m ? `t:${m.tweetId}` : 'userId' in m ? `u:${m.userId}` : `n:${m.username}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    messageId: message.id,
    guildId: message.guildId,
    channelId: message.channelId,
    authorId: message.author.id,
    isAuthorBot: message.author.bot,
    content: message.content || '',
    urls: uniqueUrls
  };
}
