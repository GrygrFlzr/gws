import type { ActionConfig, BlacklistedUser, ModerationAction } from './types';
export type { ActionConfig, BlacklistedUser, ModerationAction };

export type BlocklistGroups = Record<string, BlacklistedUser[]>;

/**
 * Determines which actions should be taken based on configuration and message context.
 * This logic is decoupled from the Discord API and can be easily tested.
 */
export function determineActions(
  config: ActionConfig,
  isAuthorBot: boolean,
  blacklistedUsers: BlacklistedUser[]
): ModerationAction[] {
  const actions: ModerationAction[] = [];

  // 1. React (Skip for bots)
  if (config.react && !isAuthorBot) {
    actions.push({ type: 'react', emoji: config.react });
  }

  // 2. Reply (Skip for bots)
  if (config.reply && !isAuthorBot) {
    const groups = groupUsersByBlocklist(blacklistedUsers);
    const replyContent = renderReply(groups, config.replyMessage);
    actions.push({ type: 'reply', content: replyContent });
  }

  // 3. Delete (Always if configured)
  if (config.delete) {
    actions.push({ type: 'delete' });
  }

  return actions;
}

/**
 * Pure logic: Groups users by their blocklist.
 */
export function groupUsersByBlocklist(users: BlacklistedUser[]): BlocklistGroups {
  return users.reduce((acc, u) => {
    if (!acc[u.blocklistName]) acc[u.blocklistName] = [];
    acc[u.blocklistName].push(u);
    return acc;
  }, {} as BlocklistGroups);
}

/**
 * Pure view: Renders groups into a markdown string.
 */
export function renderReply(groups: BlocklistGroups, defaultMessage?: string | null): string {
  const msg = defaultMessage || '⚠️ This message contains links to blocked accounts.';
  let reply = msg + '\n\n';

  for (const [listName, listUsers] of Object.entries(groups)) {
    reply += `**${listName}:**\n`;
    for (const user of listUsers) {
      reply += `• @${user.username}`;
      if (user.publicReason) {
        reply += ` - ${user.publicReason}`;
      }
      reply += '\n';
    }
  }

  return reply;
}
