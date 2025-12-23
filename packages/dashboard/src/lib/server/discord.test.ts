import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiscordAPIClient } from './discord';

describe('DiscordAPIClient', () => {
  let client: DiscordAPIClient;
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    client = new DiscordAPIClient();
    fetchMock = vi.fn<typeof fetch>();
    global.fetch = fetchMock as typeof fetch;
  });

  it('should successfully fetch data', async () => {
    const mockData = { id: '123', name: 'Test Guild' };
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: new Headers({
          'x-ratelimit-limit': '10',
          'x-ratelimit-remaining': '9',
          'x-ratelimit-reset': String(Date.now() / 1000 + 60),
          'x-ratelimit-reset-after': '60',
          'x-ratelimit-bucket': 'test-bucket'
        })
      })
    );

    const result = await client.fetch('/test', 'token123');
    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://discord.com/api/v10/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token123'
        })
      })
    );
  });

  it('should handle rate limiting with retry', async () => {
    const mockData = { success: true };

    // First call returns 429
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: 429,
          message: 'Rate limited',
          retry_after: 0.1
        }),
        {
          status: 429,
          headers: new Headers()
        }
      )
    );

    // Second call succeeds
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: new Headers({
          'x-ratelimit-limit': '10',
          'x-ratelimit-remaining': '9',
          'x-ratelimit-reset': String(Date.now() / 1000 + 60),
          'x-ratelimit-reset-after': '60',
          'x-ratelimit-bucket': 'test-bucket'
        })
      })
    );

    const startTime = Date.now();
    const result = await client.fetch('/test', 'token123');
    const elapsed = Date.now() - startTime;

    expect(result).toEqual(mockData);
    expect(elapsed).toBeGreaterThanOrEqual(100); // Should have waited
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should retry on server errors with exponential backoff', async () => {
    const mockData = { success: true };

    // First two calls fail with 500
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ code: 500, message: 'Internal Server Error' }), {
        status: 500,
        headers: new Headers()
      })
    );

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ code: 500, message: 'Internal Server Error' }), {
        status: 500,
        headers: new Headers()
      })
    );

    // Third call succeeds
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: new Headers({
          'x-ratelimit-limit': '10',
          'x-ratelimit-remaining': '9',
          'x-ratelimit-reset': String(Date.now() / 1000 + 60),
          'x-ratelimit-reset-after': '60',
          'x-ratelimit-bucket': 'test-bucket'
        })
      })
    );

    const result = await client.fetch('/test', 'token123', {}, 3);
    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('should throw SvelteKit error on 401', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ code: 401, message: 'Unauthorized' }), {
        status: 401,
        headers: new Headers()
      })
    );

    await expect(client.fetch('/test', 'invalid-token')).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1); // Should not retry auth errors
  });

  it('should throw SvelteKit error after exhausting retries', async () => {
    // All attempts fail with 500
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 500, message: 'Internal Server Error' }), {
        status: 500,
        headers: new Headers()
      })
    );

    await expect(client.fetch('/test', 'token123', {}, 3)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('should handle global rate limit', async () => {
    const mockData = { success: true };

    // First call returns global rate limit
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: 429,
          message: 'Rate limited',
          retry_after: 0.1,
          global: true
        }),
        { status: 429, headers: new Headers() }
      )
    );

    // Second call succeeds
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: new Headers({
          'x-ratelimit-limit': '10',
          'x-ratelimit-remaining': '9',
          'x-ratelimit-reset': String(Date.now() / 1000 + 60),
          'x-ratelimit-reset-after': '60',
          'x-ratelimit-bucket': 'test-bucket'
        })
      })
    );

    const result = await client.fetch('/test', 'token123');
    expect(result).toEqual(mockData);
  });
});
