import { Queue } from 'bullmq';
import { connection } from './connection';

export const urlResolutionQueue = new Queue('url-resolution', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 }
  }
});

export const actionQueue = new Queue('message-actions', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 }
  }
});
