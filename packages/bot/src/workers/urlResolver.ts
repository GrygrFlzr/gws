import type { Match } from '@gws/core/twitter';
import { Worker, type Job } from 'bullmq';
import { db } from '../db';
import { connection } from '../queue/connection';
import { actionQueue } from '../queue/queues';
import { processUrlResolutionJob, type ResolverDependencies } from './urlResolver.logic';

interface UrlResolutionJob {
  messageId: string;
  guildId: string;
  channelId: string;
  authorId: string;
  isAuthorBot: boolean;
  urls: Match[];
  recoveryAttempt?: boolean;
}

const deps: ResolverDependencies = {
  db,
  enqueueBlacklistCheck: async (data) => {
    await actionQueue.add('check-blacklist', data);
  }
};

export const urlResolverWorker = new Worker<UrlResolutionJob>(
  'url-resolution',
  async (job: Job<UrlResolutionJob>) => {
    return processUrlResolutionJob(deps, job.data);
  },
  { connection }
);
