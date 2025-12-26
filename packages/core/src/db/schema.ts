import { eq, isNull, relations, sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import type { ActionConfigOverride, DiscordGuildPartial } from '../discord/types';

// Guilds
export const guilds = pgTable('guilds', {
  guildId: bigint('guild_id', { mode: 'bigint' }).primaryKey(),
  defaultAction: jsonb('default_action').$type<ActionConfigOverride>().notNull(),
  channelOverrides: jsonb('channel_overrides').$type<Record<string, ActionConfigOverride>>(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Blocklists
export const blocklists = pgTable('blocklists', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ownerGuildId: bigint('owner_guild_id', { mode: 'bigint' }),
  visibility: varchar('visibility', { length: 20 }).notNull().default('private'),
  createdByUserId: bigint('created_by_user_id', { mode: 'bigint' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  subscriberCount: integer('subscriber_count').default(0).notNull(),
  entryCount: integer('entry_count').default(0).notNull()
});

export const blocklistsRelations = relations(blocklists, ({ many }) => ({
  entries: many(blocklistEntries),
  subscriptions: many(guildBlocklistSubscriptions)
}));

// Guild blocklist subscriptions
export const guildBlocklistSubscriptions = pgTable(
  'guild_blocklist_subscriptions',
  {
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
    blocklistId: integer('blocklist_id')
      .notNull()
      .references(() => blocklists.id, { onDelete: 'cascade' }),
    enabled: boolean('enabled').default(true).notNull(),
    channelOverrides: jsonb('channel_overrides').$type<Record<string, { enabled?: boolean }>>(),
    subscribedAt: timestamp('subscribed_at').defaultNow().notNull()
  },
  (table) => [
    primaryKey({
      name: 'guild_blocklist_subscriptions_pkey',
      columns: [table.guildId, table.blocklistId]
    })
  ]
);

export const guildBlocklistSubscriptionsRelations = relations(
  guildBlocklistSubscriptions,
  ({ one }) => ({
    blocklist: one(blocklists, {
      fields: [guildBlocklistSubscriptions.blocklistId],
      references: [blocklists.id]
    })
  })
);

// Blocklist entries
export const blocklistEntries = pgTable(
  'blocklist_entries',
  {
    id: serial('id').primaryKey(),
    blocklistId: integer('blocklist_id')
      .notNull()
      .references(() => blocklists.id, { onDelete: 'cascade' }),
    twitterUserId: bigint('twitter_user_id', { mode: 'bigint' }).notNull(),
    twitterUsername: varchar('twitter_username', { length: 15 }).notNull(),
    publicReason: text('public_reason'),
    privateReason: text('private_reason'),
    evidenceUrls: text('evidence_urls').array(),
    addedByUserId: bigint('added_by_user_id', { mode: 'bigint' }).notNull(),
    addedAt: timestamp('added_at').defaultNow().notNull(),
    removedAt: timestamp('removed_at'),
    removedByUserId: bigint('removed_by_user_id', { mode: 'bigint' }),
    removalReason: text('removal_reason'),
    modifiedAt: timestamp('modified_at').defaultNow().notNull(),
    modifiedByUserId: bigint('modified_by_user_id', { mode: 'bigint' }),
    modificationReason: text('modification_reason')
  },
  (table) => [
    uniqueIndex('blocklist_entries_unique').on(table.blocklistId, table.twitterUserId),
    index('idx_blocklist_entries_active')
      .on(table.blocklistId, table.twitterUserId)
      .where(isNull(table.removedAt))
  ]
);

export const blocklistEntriesRelations = relations(blocklistEntries, ({ one }) => ({
  blocklist: one(blocklists, {
    fields: [blocklistEntries.blocklistId],
    references: [blocklists.id]
  })
}));

// Twitter user cache
export const twitterUserCache = pgTable(
  'twitter_user_cache',
  {
    userId: bigint('user_id', { mode: 'bigint' }).primaryKey(),
    username: varchar('username', { length: 15 }).notNull(),
    cachedAt: timestamp('cached_at').defaultNow().notNull(),
    lastChecked: timestamp('last_checked').defaultNow().notNull(),
    data: jsonb('data')
  },
  (table) => [index('idx_username').on(table.username)]
);

// Username history
export const twitterUsernameHistory = pgTable(
  'twitter_username_history',
  {
    id: serial('id').primaryKey(),
    twitterUserId: bigint('twitter_user_id', { mode: 'bigint' }).notNull(),
    username: varchar('username', { length: 15 }).notNull(),
    firstSeen: timestamp('first_seen').notNull(),
    lastSeen: timestamp('last_seen').notNull(),
    discoveredVia: varchar('discovered_via', { length: 50 }),
    isCurrent: boolean('is_current').default(true).notNull()
  },
  (table) => [
    uniqueIndex('twitter_username_history_unique').on(table.twitterUserId, table.username),
    index('idx_username_current')
      .on(table.twitterUserId)
      .where(eq(table.isCurrent, sql`TRUE`)),
    index('idx_username_lookup').on(table.username)
  ]
);

// Username change analytics
export const usernameChangeAnalytics = pgTable(
  'username_change_analytics',
  {
    twitterUserId: bigint('twitter_user_id', { mode: 'bigint' }).primaryKey(),
    totalUsernameChanges: integer('total_username_changes').default(0).notNull(),
    changeFrequency: integer('change_frequency'), // Store as changes per 1000 days to avoid decimals
    lastChangeAt: timestamp('last_change_at'),
    isSuspicious: boolean('is_suspicious').notNull().default(false)
  },
  (table) => [
    index('idx_suspicious_accounts')
      .on(table.isSuspicious)
      .where(eq(table.isSuspicious, sql`TRUE`))
  ]
);

// Pending messages
export const pendingMessages = pgTable(
  'pending_messages',
  {
    id: serial('id').primaryKey(),
    messageId: bigint('message_id', { mode: 'bigint' }).notNull(),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
    channelId: bigint('channel_id', { mode: 'bigint' }).notNull(),
    authorId: bigint('author_id', { mode: 'bigint' }).notNull(),
    isAuthorBot: boolean('is_author_bot').default(false).notNull(),
    content: text('content').notNull(),
    urls: jsonb('urls').notNull(),
    state: varchar('state', { length: 20 }).notNull().default('queued'),
    resolutionData: jsonb('resolution_data'),
    actionData: jsonb('action_data'),
    attempts: integer('attempts').default(0).notNull(),
    lastAttempt: timestamp('last_attempt'),
    nextRetry: timestamp('next_retry'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at')
  },
  (table) => [
    uniqueIndex('pending_messages_unique').on(table.messageId, table.guildId),
    index('idx_pending_state').on(table.state, table.nextRetry)
  ]
);

// Offender analytics
export const offenderAnalytics = pgTable(
  'offender_analytics',
  {
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
    discordUserId: bigint('discord_user_id', { mode: 'bigint' }).notNull(),
    totalViolations: integer('total_violations').default(1).notNull(),
    lastViolationAt: timestamp('last_violation_at').defaultNow().notNull(),
    firstViolationAt: timestamp('first_violation_at').defaultNow().notNull(),
    blockedUserFrequency: jsonb('blocked_user_frequency')
      .$type<Record<string, number>>()
      .default({})
      .notNull(),
    detailsPurgedAt: timestamp('details_purged_at'),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => [
    primaryKey({ name: 'offender_analytics_pkey', columns: [table.guildId, table.discordUserId] }),
    index('idx_offenders_by_frequency').on(table.guildId, table.totalViolations)
  ]
);

// Violation log
export const violationLog = pgTable(
  'violation_log',
  {
    id: serial('id').primaryKey(),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
    discordUserId: bigint('discord_user_id', { mode: 'bigint' }).notNull(),
    channelId: bigint('channel_id', { mode: 'bigint' }).notNull(),
    messageId: bigint('message_id', { mode: 'bigint' }).notNull(),
    blockedTwitterUserIds: bigint('blocked_twitter_user_ids', { mode: 'bigint' }).array().notNull(),
    blocklistNames: text('blocklist_names').array().notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull()
  },
  (table) => [
    index('idx_violations_by_user').on(table.guildId, table.discordUserId, table.timestamp)
  ]
);

// Action log
export const actionLog = pgTable('action_log', {
  id: serial('id').primaryKey(),
  messageId: bigint('message_id', { mode: 'bigint' }).notNull(),
  guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
  channelId: bigint('channel_id', { mode: 'bigint' }).notNull(),
  authorId: bigint('author_id', { mode: 'bigint' }).notNull(),
  matchedUserIds: bigint('matched_user_ids', { mode: 'bigint' }).array().notNull(),
  actionsTaken: jsonb('actions_taken').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// API failures tracking
export const apiFailures = pgTable(
  'api_failures',
  {
    id: serial('id').primaryKey(),
    api: varchar('api', { length: 10 }).notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    consecutiveFailures: integer('consecutive_failures').notNull(),
    suspectedCause: varchar('suspected_cause', { length: 50 })
  },
  (table) => [index('idx_api_failures_timestamp').on(table.api, table.timestamp)]
);

// Auth
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: bigint('user_id', { mode: 'bigint' }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  discordAccessToken: text('discord_access_token').notNull(),
  discordRefreshToken: text('discord_refresh_token'),
  discordTokenExpiresAt: timestamp('discord_token_expires_at', { withTimezone: true })
});

export const users = pgTable('users', {
  id: bigint('id', { mode: 'bigint' }).primaryKey(), // Discord user ID
  username: varchar('username', { length: 32 }).notNull(),
  globalName: varchar('global_name', { length: 64 }),
  discriminator: varchar('discriminator', { length: 4 }),
  avatar: varchar('avatar', { length: 255 }),
  email: varchar('email', { length: 255 }),
  guildsCache: jsonb('guilds_cache').$type<DiscordGuildPartial[]>(),
  guildsCacheAt: timestamp('guilds_cache_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));
