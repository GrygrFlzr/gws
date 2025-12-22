import { db } from '@gws/core';
import { pendingMessages } from '@gws/core/db/schema';
import type { Match } from '@gws/core/twitter';
import { eq } from 'drizzle-orm';
import { urlResolutionQueue } from '../queue/queues';

export async function recoverPendingMessages() {
  console.log('Checking for pending messages after restart...');

  // Find all messages that were in-flight
  const pending = await db
    .select()
    .from(pendingMessages)
    .where(eq(pendingMessages.state, 'queued'))
    .limit(1000);

  console.log(`Recovering ${pending.length} messages`);

  for (const msg of pending) {
    // Re-queue them
    await urlResolutionQueue.add(
      'resolve-urls',
      {
        messageId: msg.messageId.toString(),
        guildId: msg.guildId.toString(),
        channelId: msg.channelId.toString(),
        authorId: msg.authorId.toString(),
        urls: msg.urls as Match[],
        recoveryAttempt: true
      },
      {
        // Don't duplicate if already in queue
        jobId: `msg-${msg.messageId}`,
        removeOnComplete: true
      }
    );
  }
}

// Run on startup if in production
if (process.env.NODE_ENV === 'production') {
  setTimeout(recoverPendingMessages, 5000);
}
