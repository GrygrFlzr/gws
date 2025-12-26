import { Worker, type Job } from 'bullmq';
import { db } from '../db';
import { connection } from '../queue/connection';
import { processBlocklistJob, type BlocklistDependencies } from './blocklistChecker.logic';

interface ResolvedUser {
  userId: string;
  username: string;
  source: string;
}

interface BlocklistJob {
  messageId: string;
  guildId: string;
  channelId: string;
  authorId: string;
  isAuthorBot: boolean;
  resolvedUsers: ResolvedUser[];
}

const deps: BlocklistDependencies = {
  db,
  enqueueAction: async (data) => {
    const { executeActionQueue } = await import('../queue/queues');
    await executeActionQueue.add('execute-action', data);
  }
};

export const blocklistWorker = new Worker<BlocklistJob>(
  'message-actions',
  async (job: Job<BlocklistJob>) => {
    return processBlocklistJob(deps, job.data);
  },
  { connection }
);
