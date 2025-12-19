import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Redis with AOF (Append-Only File) for durability
const connection = new IORedis({
  maxRetriesPerRequest: null,
  // Enable persistence
  enableReadyCheck: true,
  enableOfflineQueue: true
  // AOF config (add to redis.conf)
  // appendonly yes
  // appendfsync everysec
});

export const urlResolutionQueue = new Queue('url-resolution', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    // Keep completed jobs for reconciliation
    removeOnComplete: { age: 3600, count: 10000 },
    removeOnFail: { age: 86400, count: 5000 }
  }
});
