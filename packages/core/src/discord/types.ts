export type Snowflake = `${bigint}`;

export interface DiscordGuildPartial {
  id: Snowflake;
  name: string;
  owner: boolean;
  permissions: string;
  features: string[];
  icon: string | null;
  banner: string | null;
}

export interface DiscordGuildWithCounts extends DiscordGuildPartial {
  approximate_member_count: number;
  approximate_presence_count: number;
}

export interface ActionConfig {
  react: string | null;
  reply: boolean | null;
  replyMessage: string | null;
  delete: boolean | null;
  logChannel: string | null;
}

/**
 * Used for sparse overrides where 'undefined' means 'inherit'
 * and 'null' means 'explicitly disable'.
 */
export type ActionConfigOverride = Partial<ActionConfig>;

export interface BlacklistedUser {
  userId: string;
  username: string;
  blocklistName: string;
  publicReason: string | null;
  privateReason: string | null;
  hashtags?: string[];
}

export interface ModerationAction {
  type: 'react' | 'reply' | 'delete';
  emoji?: string;
  content?: string;
}
