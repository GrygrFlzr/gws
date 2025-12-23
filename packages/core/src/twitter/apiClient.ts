import type { Database } from '../db/client';
import * as cacheQueries from '../db/queries/cache';
import type {
  FxTwitterTweetResponse,
  FxTwitterUserResponse,
  Match,
  UserResult,
  VxTwitterTweetResponse,
  VxTwitterUserResponse
} from './types';

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

  async fetchUser(db: Database, match: Match): Promise<UserResult> {
    // Neither Fx nor Vx support querying by UID directly.
    // Since we already have the UID, we just check our cache or return it as-is.
    if ('userId' in match) {
      const cached = await cacheQueries.getCachedUser(db, match);
      if (cached) return { ...cached, source: 'cache' };
      return {
        userId: match.userId,
        username: '', // Username unknown without API lookup
        source: 'cache'
      };
    }

    const fxScore = this.calculateHealthScore(this.fxHealth);
    const vxScore = this.calculateHealthScore(this.vxHealth);

    console.log(`API Health - fx: ${fxScore.toFixed(2)}, vx: ${vxScore.toFixed(2)}`);

    const attempts: Array<{
      api: 'fx' | 'vx';
      fn: (match: Match) => Promise<Omit<UserResult, 'source'>>;
    }> =
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
    const cached = await cacheQueries.getCachedUser(db, match);
    if (cached) {
      console.warn('Using stale cache after API failures');
      return {
        userId: cached.userId,
        username: cached.username,
        source: 'cache',
        data: cached
      };
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

  private async fetchFx(match: Match): Promise<Omit<UserResult, 'source'>> {
    let url: string;
    if ('tweetId' in match) {
      url = `https://api.fxtwitter.com/i/status/${match.tweetId}`;
    } else if ('username' in match) {
      url = `https://api.fxtwitter.com/${match.username}`;
    } else {
      throw new Error('Fx does not support UID lookups');
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fx failed: ${res.status}`);
    const data = (await res.json()) as FxTwitterUserResponse | FxTwitterTweetResponse;

    if ('tweet' in data && data.tweet?.author) {
      const tweetData = data as FxTwitterTweetResponse;
      return {
        userId: tweetData.tweet.author.id,
        username: tweetData.tweet.author.screen_name,
        data: tweetData
      };
    } else if ('user' in data && data.user) {
      const userData = data as FxTwitterUserResponse;
      return {
        userId: userData.user.id,
        username: userData.user.screen_name,
        data: userData
      };
    }
    throw new Error('Invalid Fx response');
  }

  private async fetchVx(match: Match): Promise<Omit<UserResult, 'source'>> {
    let url: string;
    if ('tweetId' in match) {
      url = `https://api.vxtwitter.com/i/status/${match.tweetId}`;
    } else if ('username' in match) {
      url = `https://api.vxtwitter.com/${match.username}`;
    } else {
      throw new Error('Vx does not support UID lookups');
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Vx failed: ${res.status}`);
    const data = (await res.json()) as VxTwitterUserResponse | VxTwitterTweetResponse;

    if ('user_screen_name' in data) {
      const tweetData = data as VxTwitterTweetResponse;
      return {
        userId: '', // Vx doesn't return ID for tweets
        username: tweetData.user_screen_name,
        data: tweetData
      };
    } else if ('screen_name' in data && 'id' in data) {
      const userData = data as VxTwitterUserResponse;
      return {
        userId: String(userData.id),
        username: userData.screen_name,
        data: userData
      };
    }
    throw new Error('Invalid Vx response');
  }
}

export const apiClient = new AdaptiveAPIClient();
