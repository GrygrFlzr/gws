import { eq } from 'drizzle-orm';
import type { Database } from '../client';
import { pendingMessages } from '../schema';

export async function storePendingMessage(
  db: Database,
  data: {
    messageId: bigint;
    guildId: bigint;
    channelId: bigint;
    authorId: bigint;
    isAuthorBot: boolean;
    content: string;
    urls: unknown;
  }
) {
  return db.insert(pendingMessages).values(data).returning();
}

export async function updatePendingMessage(
  db: Database,
  messageId: bigint,
  updates: {
    state?: string;
    resolutionData?: unknown;
    actionData?: unknown;
    completedAt?: Date;
    error?: string;
  }
) {
  return db
    .update(pendingMessages)
    .set(updates)
    .where(eq(pendingMessages.messageId, messageId))
    .returning();
}

export async function getPendingMessages(db: Database, state: string) {
  return db.query.pendingMessages.findMany({
    where: eq(pendingMessages.state, state)
  });
}
