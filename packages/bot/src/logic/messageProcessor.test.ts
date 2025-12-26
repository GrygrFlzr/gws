import { describe, expect, it } from 'vitest';
import { extractMessageData } from './messageProcessor';

describe('Message Processor Logic', () => {
  it('should extract URLs from a simple message', () => {
    const data = extractMessageData({
      id: '1',
      guildId: '100',
      channelId: '200',
      author: { id: '300', bot: false },
      content: 'Check this: https://x.com/jack/status/20'
    });

    expect(data).not.toBeNull();
    expect(data?.urls).toHaveLength(1);
    expect(data?.urls[0]).toMatchObject({ tweetId: '20' });
    expect(data?.isAuthorBot).toBe(false);
  });

  it('should return null if no URLs are found', () => {
    const data = extractMessageData({
      id: '1',
      guildId: '100',
      channelId: '200',
      author: { id: '300', bot: false },
      content: 'No links here'
    });

    expect(data).toBeNull();
  });

  it('should extract URLs from forwarded snapshots', () => {
    const data = extractMessageData({
      id: '1',
      guildId: '100',
      channelId: '200',
      author: { id: '300', bot: false },
      content: 'I forwarded this',
      messageSnapshots: [{ content: 'Original message with https://x.com/jack/status/20' }]
    });

    expect(data).not.toBeNull();
    expect(data?.urls).toHaveLength(1);
    expect(data?.urls[0]).toMatchObject({ tweetId: '20' });
  });

  it('should de-duplicate URLs between content and snapshots', () => {
    const data = extractMessageData({
      id: '1',
      guildId: '100',
      channelId: '200',
      author: { id: '300', bot: false },
      content: 'Same link https://x.com/jack/status/20',
      messageSnapshots: [{ content: 'Again https://x.com/jack/status/20' }]
    });

    expect(data?.urls).toHaveLength(1);
  });

  it('should return null for messages without a guildId', () => {
    const data = extractMessageData({
      id: '1',
      guildId: null,
      channelId: '200',
      author: { id: '300', bot: false },
      content: 'https://x.com/jack/status/20'
    });

    expect(data).toBeNull();
  });
});
