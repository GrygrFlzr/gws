import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Database } from '../db/client';
import { apiClient } from './apiClient';

// Mock dependencies
vi.mock('../db/queries/cache', () => ({
  getCachedUser: vi.fn(),
  cacheUser: vi.fn(),
  getUserIdByUsername: vi.fn()
}));

const mockDb = {} as Database;

describe('AdaptiveAPIClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - accessing private member for testing
    apiClient.fetchFn = vi.fn();
  });

  describe('fetchFx', () => {
    it('should successfully fetch using v2 API and extract hashtags from facets', async () => {
      const mockV2Response = {
        code: 200,
        status: {
          author: { id: '123', screen_name: 'testuser' },
          text: 'Hello #world #test',
          raw_text: {
            facets: [
              { type: 'hashtag', original: 'world' },
              { type: 'hashtag', original: 'test' }
            ]
          }
        }
      };

      // @ts-expect-error - mock fetchFn
      apiClient.fetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => mockV2Response
      });

      const result = await apiClient.fetchUser(mockDb, { url: '', tweetId: '456' });

      expect(result).toMatchObject({
        userId: '123',
        username: 'testuser',
        source: 'fx',
        hashtags: ['world', 'test']
      });
      // @ts-expect-error - check call
      expect(apiClient.fetchFn).toHaveBeenCalledWith(expect.stringContaining('/2/status/456'));
    });

    it('should fallback to v1 API if v2 fails', async () => {
      // 1. v2 fails (404 or other)
      // @ts-expect-error - mock fetchFn
      apiClient.fetchFn.mockResolvedValueOnce({ ok: false, status: 404 });

      // 2. v1 succeeds
      const mockV1Response = {
        code: 200,
        tweet: {
          author: { id: '123', screen_name: 'testuser' },
          text: 'Hello #v1',
          raw_text: {
            facets: [{ type: 'hashtag', original: 'v1' }]
          }
        }
      };
      // @ts-expect-error - mock fetchFn
      apiClient.fetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => mockV1Response
      });

      const result = await apiClient.fetchUser(mockDb, { url: '', tweetId: '456' });

      expect(result.hashtags).toEqual(['v1']);
      // @ts-expect-error - check calls
      expect(apiClient.fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should extract hashtags from profile description using v2', async () => {
      const mockV2ProfileResponse = {
        code: 200,
        user: {
          id: '123',
          screen_name: 'testuser',
          description: 'Developer #coding #typescript'
        }
      };

      // @ts-expect-error - mock fetchFn
      apiClient.fetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => mockV2ProfileResponse
      });

      const result = await apiClient.fetchUser(mockDb, { url: '', username: 'testuser' });

      expect(result.hashtags).toEqual(['coding', 'typescript']);
    });
  });

  describe('fetchVx', () => {
    it('should extract hashtags from VxTwitter response', async () => {
      // Force fxHealth to be bad so it tries vx
      // @ts-expect-error - private access
      apiClient.fxHealth.failureCount = 100;
      // @ts-expect-error - private access
      apiClient.fxHealth.lastSuccess = 0;

      const mockVxResponse = {
        user_screen_name: 'testuser',
        hashtags: ['vxhashtag'],
        text: 'Hello #vxhashtag'
      };

      // @ts-expect-error - mock fetchFn
      apiClient.fetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVxResponse
      });

      const result = await apiClient.fetchUser(mockDb, { url: '', tweetId: '456' });

      expect(result.username).toBe('testuser');
      expect(result.hashtags).toEqual(['vxhashtag']);
      expect(result.source).toBe('vx');
    });
  });
});
