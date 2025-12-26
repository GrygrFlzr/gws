import { describe, expect, it } from 'vitest';
import { determineActions, groupUsersByBlocklist, renderReply, type BlacklistedUser, type ActionConfig } from './logic';

describe('Discord Moderation Logic', () => {
  const mockUsers: BlacklistedUser[] = [
    {
      userId: '123',
      username: 'badactor',
      blocklistName: 'Scammers',
      publicReason: 'Phishing links',
      privateReason: null
    }
  ];

  const defaultConfig: ActionConfig = {
    react: '⚠️',
    reply: true,
    delete: true,
    replyMessage: 'Blocked!',
    logChannel: null
  };

  describe('determineActions', () => {
    it('should return all actions for a normal user', () => {
      const actions = determineActions(defaultConfig, false, mockUsers);
      expect(actions).toContainEqual({ type: 'react', emoji: '⚠️' });
      expect(actions).toContainEqual({ type: 'delete' });
      expect(actions.find((a) => a.type === 'reply')).toBeDefined();
    });

    it('should only return delete action for a bot', () => {
      const actions = determineActions(defaultConfig, true, mockUsers);
      expect(actions).toHaveLength(1);
      expect(actions[0]).toEqual({ type: 'delete' });
    });

    it('should respect disabled configurations', () => {
      const config: ActionConfig = {
        react: null,
        reply: false,
        delete: true,
        replyMessage: null,
        logChannel: null
      };
      const actions = determineActions(config, false, mockUsers);
      expect(actions).toHaveLength(1);
      expect(actions[0]).toEqual({ type: 'delete' });
    });
  });

  describe('groupUsersByBlocklist', () => {
    it('should correctly group multiple users by their blocklist name', () => {
      const manyUsers: BlacklistedUser[] = [
        { userId: '1', username: 'u1', blocklistName: 'List A', publicReason: null, privateReason: null },
        { userId: '2', username: 'u2', blocklistName: 'List A', publicReason: null, privateReason: null },
        { userId: '3', username: 'u3', blocklistName: 'List B', publicReason: null, privateReason: null }
      ];

      const groups = groupUsersByBlocklist(manyUsers);

      expect(Object.keys(groups)).toHaveLength(2);
      expect(groups['List A']).toHaveLength(2);
      expect(groups['List B']).toHaveLength(1);
      expect(groups['List A'].map((u) => u.userId)).toEqual(['1', '2']);
    });
  });

  describe('renderReply', () => {
    it('should include necessary information in the string', () => {
      const groups = {
        'List A': [
          {
            userId: '1',
            username: 'u1',
            blocklistName: 'List A',
            publicReason: 'Reason X',
            privateReason: null
          }
        ]
      };

      const output = renderReply(groups, 'Custom Header');

      expect(output).toContain('Custom Header');
      expect(output).toContain('List A');
      expect(output).toContain('u1');
      expect(output).toContain('Reason X');
    });
  });
});
