import { Worker, type Job } from 'bullmq';
import { db } from '../db';
import { connection } from '../queue/connection';
import { executeActionQueue } from '../queue/queues';
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
