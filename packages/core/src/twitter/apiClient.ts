import type { Match, UserResult } from './types';
import * as cacheQueries from '../db/queries/cache';

interface APIHealth {
  successCount: number;
  failureCount: number;
  lastSuccess: number;
  lastFailure: number;
  recentLatencies: number[];
}

class AdaptiveAPIClient {
  private fxHealth: APIHealth = this.initHealth();
  private vxHealth: APIHealth = this.initHealth();

  private initHealth(): APIHealth {
    return {
      successCount: 0,
      failureCount: 0,
      lastSuccess: Date.now(),
      lastFailure: 0,
      recentLatencies: []
    };
  }

  async fetchUser(match: Match): Promise<UserResult> {
    const fxScore = this.calculateHealthScore(this.fxHealth);
    const vxScore = this.calculateHealthScore(this.vxHealth);

    console.log(`API Health - fx: ${fxScore.toFixed(2)}, vx: ${vxScore.toFixed(2)}`);

    const attempts: Array<{ api: 'fx' | 'vx'; fn: (match: Match) => Promise<UserResult> }> =
      fxScore >= vxScore
        ? [
            { api: 'fx', fn: this.fetchFx.bind(this) },
            { api: 'vx', fn: this.fetchVx.bind(this) }
          ]
        : [
            { api: 'vx', fn: this.fetchVx.bind(this) },
            { api: 'fx', fn: this.fetchFx.bind(this) }
          ];

    let lastError: Error | null = null;

    for (const { api, fn } of attempts) {
      try {
        const startTime = Date.now();
        const result = await fn(match);
        const latency = Date.now() - startTime;

        this.recordSuccess(api, latency);

        return { ...result, source: api };
      } catch (err) {
        this.recordFailure(api);
        lastError = err as Error;

        if ((err as Record<string, unknown>)?.status === 429) {
          await this.sleep(1000);
        }
      }
    }

    // Both failed - check cache
    const cached = await cacheQueries.getCachedUser(match);
    if (cached) {
      console.warn('Using stale cache after API failures');
      return { ...cached, source: 'cache' };
    }

    throw lastError || new Error('All APIs failed');
  }

  private calculateHealthScore(health: APIHealth): number {
    const total = health.successCount + health.failureCount;
    if (total === 0) return 0.5;

    const successRate = health.successCount / total;

    const timeSinceLastSuccess = Date.now() - health.lastSuccess;
    const isVX = health === this.vxHealth;
    const recoveryTime = isVX ? 10 * 60 * 1000 : 5 * 60 * 1000;
    const recencyPenalty = Math.min(timeSinceLastSuccess / recoveryTime, 0.4);

    const avgLatency =
      health.recentLatencies.length > 0
        ? health.recentLatencies.reduce((a, b) => a + b) / health.recentLatencies.length
        : 1000;

    const targetLatency = isVX ? 1500 : 1000;
    const latencyBonus = Math.max(0, (targetLatency * 2 - avgLatency) / (targetLatency * 2)) * 0.2;

    return Math.max(0, Math.min(1, successRate - recencyPenalty + latencyBonus));
  }

  private recordSuccess(api: 'fx' | 'vx', latency: number) {
    const health = api === 'fx' ? this.fxHealth : this.vxHealth;

    health.successCount++;
    health.lastSuccess = Date.now();
    health.recentLatencies.push(latency);

    if (health.recentLatencies.length > 20) {
      health.recentLatencies.shift();
    }

    if (health.successCount % 10 === 0 && health.failureCount > 0) {
      health.failureCount = Math.floor(health.failureCount * 0.8);
    }
  }

  private recordFailure(api: 'fx' | 'vx') {
    const health = api === 'fx' ? this.fxHealth : this.vxHealth;

    health.failureCount++;
    health.lastFailure = Date.now();

    // Log to DB would go here
    console.warn(`API ${api} failure recorded`);
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchFx(_match: Match): Promise<UserResult> {
    // TODO: Implement actual API calls
    throw new Error('Not implemented');
  }

  private async fetchVx(_match: Match): Promise<UserResult> {
    // TODO: Implement actual API calls
    throw new Error('Not implemented');
  }
}

export const apiClient = new AdaptiveAPIClient();
